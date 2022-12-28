import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import { EventType, Status, UniqueInstance } from '../../model/generated'
import * as events from '../../types/events'
import { createEvent, getItemId } from '../helpers'

export interface IUniquesMetadataSet {
  classId: number
  instanceId: number
  data: Uint8Array
  isFrozen: boolean
}

function getUniquesMetadataSetData(
  ctx: EventHandlerContext<Store>
): IUniquesMetadataSet {
  const event = new events.UniquesMetadataSetEvent(ctx)
  if (event.isV1) {
    const [classId, instanceId, data, isFrozen] = event.asV1
    return { classId, instanceId, data, isFrozen }
  }
  if (event.isV700) {
    const {
      class: classId,
      instance: instanceId,
      data,
      isFrozen,
    } = event.asV700
    return { classId, instanceId, data, isFrozen }
  }
  if (event.isV9230) {
    const {
      collection: classId,
      item: instanceId,
      data,
      isFrozen,
    } = event.asV9230
    return { classId, instanceId, data, isFrozen }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    data,
    isFrozen,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, data, isFrozen }
}

export async function uniqueMetadataSet(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesMetadataSetData(ctx)
  const { classId, instanceId, data, isFrozen } = eventData

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
  uniqueInstance.metadata = data.toString()
  uniqueInstance.status = isFrozen ? Status.FROZEN : Status.ACTIVE
  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    uniqueInstance,
    type: EventType.METADATA_SET,
  })
  await ctx.store.save(event)
}
