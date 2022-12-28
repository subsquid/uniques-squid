import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import { EventType, UniqueInstance } from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, getItemId } from '../helpers'

export interface IUniquesMetadataCleared {
  classId: number
  instanceId: number
}

function getUniquesMetadataClearedData(
  ctx: EventHandlerContext<Store>
): IUniquesMetadataCleared {
  const event = new events.UniquesMetadataClearedEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId] = event.asV1
    return { classId, instanceId }
  }
  if (event.isV700) {
    const { class: classId, instance: instanceId } = event.asV700
    return { classId, instanceId }
  }
  if (event.isV9230) {
    const { collection: classId, item: instanceId } = event.asV9230
    return { classId, instanceId }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, item: instanceId } = ctx._chain.decodeEvent(
    ctx.event
  )
  return { classId, instanceId }
}

export async function uniqueMetadataCleared(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesMetadataClearedData(ctx)
  const { classId, instanceId } = eventData

  const uniqueInstance = await ctx.store.get(
    UniqueInstance,
    getItemId(classId, instanceId)
  )
  try {
    assert(uniqueInstance)
  } catch {
    ctx.log.warn(`INSNTACE IS MISSING ${classId}-${instanceId}`)
    return
  }
  uniqueInstance.metadata = null

  const event = createEvent(ctx, {
    uniqueInstance,
    type: EventType.METADATA_CLEAR,
  })
  await ctx.store.save(event)
}
