import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import { EventType, Status, UniqueClass } from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, encodeId } from '../helpers'

interface IUniquesforceCreatedData {
  classId: number
  owner: Uint8Array
}

function getUniquesforceCreatedData(
  ctx: EventHandlerContext<Store>
): IUniquesforceCreatedData {
  const event = new events.UniquesForceCreatedEvent(ctx)
  if (event.isV1) {
    const [classId, owner] = event.asV1
    return { classId, owner }
  }
  if (event.isV700) {
    const { class: classId, owner } = event.asV700
    return { classId, owner }
  }
  if (event.isV9230) {
    const { collection: classId, owner } = event.asV9230
    return { classId, owner }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, owner } = ctx._chain.decodeEvent(ctx.event)
  return { classId, owner }
}

export async function uniqueForceCreated(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesforceCreatedData(ctx)
  const owner = encodeId(eventData.owner)

  const uniqueClass = new UniqueClass({
    owner,
    creator: owner,
    issuer: owner,
    admin: owner,
    freezer: owner,
    id: eventData.classId.toString(),
    status: Status.ACTIVE,
    attributes: [],
    createdAt: new Date(ctx.block.timestamp)
  })
  await ctx.store.save(uniqueClass)

  const event = createEvent(ctx, {
    to: owner,
    uniqueClass,
    type: EventType.FORCE_CREATE,
  })
  await ctx.store.save(event)
}
