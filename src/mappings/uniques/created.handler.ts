import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { EventType, Status, UniqueClass } from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, encodeId } from '../helpers'

interface IUniquesCreatedData {
  classId: number
  creator: Uint8Array
  owner: Uint8Array
}

function getUniquesCreatedData(
  ctx: EventHandlerContext<Store>
): IUniquesCreatedData {
  const event = new events.UniquesCreatedEvent(ctx)
  if (event.isV1) {
    const [classId, creator, owner] = event.asV1
    return { classId, creator, owner }
  }
  if (event.isV700) {
    const { class: classId, creator, owner } = event.asV700
    return { classId, creator, owner }
  }
  if (event.isV9230) {
    const { collection: classId, creator, owner } = event.asV9230
    return { classId, creator, owner }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    creator,
    owner,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, creator, owner }
}

export async function uniqueClassCreated(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesCreatedData(ctx)
  const creator = encodeId(eventData.creator)
  const owner = encodeId(eventData.owner)

  const uniqueClass = new UniqueClass({
    creator,
    owner,
    issuer: creator,
    admin: creator,
    freezer: creator,
    id: eventData.classId.toString(),
    status: Status.ACTIVE,
    attributes: [],
    createdAt: new Date(ctx.block.timestamp),
  })
  await ctx.store.save(uniqueClass)

  const event = createEvent(ctx, {
    to: owner,
    uniqueClass,
    type: EventType.CREATE,
  })
  await ctx.store.save(event)
}
