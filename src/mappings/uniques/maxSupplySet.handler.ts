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
import { createEvent, getItemId } from '../helpers'

interface IUniquesMaxSupplySetData {
  classId: number
  maxSupply: number
}

function getUniquesMaxSupplySetData(
  ctx: EventHandlerContext<Store>
): IUniquesMaxSupplySetData {
  const event = new events.UniquesCollectionMaxSupplySetEvent(ctx)
  if (event.isV9230) {
    const { collection: classId, maxSupply } = event.asV9230
    return { classId, maxSupply }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const { collection: classId, maxSupply } = ctx._chain.decodeEvent(ctx.event)
  return { classId, maxSupply }
}

export async function uniqueMaxSupplySet(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesMaxSupplySetData(ctx)
  const { classId, maxSupply } = eventData
  const uniqueClass = await ctx.store.get(
    UniqueClass,
    eventData.classId.toString()
  )
  assert(uniqueClass)
  uniqueClass.maxSupply = maxSupply
  await ctx.store.save(uniqueClass)
  const event = createEvent(ctx, {
    uniqueClass,
    type: EventType.MAX_SUPPLY_SET,
  })
  await ctx.store.save(event)
}
