import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  AccountTransfer,
  Direction,
  EventType,
  Status,
  UniqueClass,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  encodeId,
  getItemId,
  getOrCreateAccount,
} from '../helpers'

interface IUniquesIssuedData {
  classId: number
  instanceId: number
  owner: Uint8Array
}

function getUniquesIssuedData(
  ctx: EventHandlerContext<Store>
): IUniquesIssuedData {
  const event = new events.UniquesIssuedEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, owner] = event.asV1
    return { classId, instanceId, owner }
  }
  if (event.isV700) {
    const { class: classId, instance: instanceId, owner } = event.asV700
    return { classId, instanceId, owner }
  }
  if (event.isV9230) {
    const { collection: classId, item: instanceId, owner } = event.asV9230
    return { classId, instanceId, owner }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    owner,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, owner }
}

export async function uniqueIssued(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesIssuedData(ctx)
  const { classId, instanceId } = eventData
  const ownerId = encodeId(eventData.owner)
  const [owner, uniqueClass] = await Promise.all([
    getOrCreateAccount(ctx.store, ownerId),
    ctx.store.get(UniqueClass, classId.toString()),
  ])

  assert(uniqueClass)

  const uniqueInstance = new UniqueInstance({
    id: getItemId(classId, instanceId),
    innerID: instanceId,
    owner,
    uniqueClass,
    status: Status.ACTIVE,
    attributes: [],
    price: 0n,
    mintedAt: new Date(ctx.block.timestamp),
  })

  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    uniqueClass,
    uniqueInstance,
    type: EventType.MINT,
    to: ownerId,
  })

  await ctx.store.save(event)

  const toTransfer = new AccountTransfer({
    id: `${ctx.event.id}-TO`,
    event,
    account: owner,
    direction: Direction.TO,
  })

  await ctx.store.save(toTransfer)
}
