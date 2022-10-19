import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  Status,
  UniqueClass,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  IUniquesClassId,
  processClassStateChange,
} from '../helpers'

function getUniquesDestroyedData(
  ctx: EventHandlerContext<Store>
): IUniquesClassId {
  const event = new events.UniquesDestroyedEvent(ctx)
  if (event.isV1) {
    const classId = event.asV1
    return { classId }
  }
  if (event.isV700) {
    const { class: classId } = event.asV700
    return { classId }
  }
  if (event.isV9230) {
    const { collection: classId } = event.asV9230
    return { classId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId } = ctx._chain.decodeEvent(ctx.event)
  return { classId }
}

export async function uniqueClassDestroyed(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesDestroyedData(ctx)
  const { classId } = eventData
  const [uniqueClass, uniqueInstances] = await Promise.all([
    ctx.store.get(UniqueClass, eventData.classId.toString()),
    ctx.store.find(UniqueInstance, {
      where: {
        uniqueClass: {
          id: classId.toString(),
        },
      },
    }),
  ])

  assert(uniqueClass)
  uniqueClass.status = Status.DESTROYED
  uniqueInstances.forEach((instance) => (instance.status = Status.DESTROYED))
  await ctx.store.save(uniqueClass)
  await ctx.store.save(uniqueInstances)

  const event = createEvent(ctx, {
    uniqueClass,
    type: EventType.DESTROY,
  })
  await ctx.store.save(event)
}
