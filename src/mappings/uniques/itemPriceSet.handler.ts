import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  Status,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import {
  createEvent,
  getItemId,
} from '../helpers'

export interface IUniquesItemPriceSet {
  classId: number
  instanceId: number
  price: bigint
}

function getUniquesItemPriceSetData(
  ctx: EventHandlerContext<Store>
): IUniquesItemPriceSet {
  const event = new events.UniquesItemPriceSetEvent(ctx)

  if (event.isV9270) {
    const { collection: classId, item: instanceId, price } = event.asV9270
    return { classId, instanceId, price }
  }

  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    price,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, price }
}

export async function uniqueItemPriceSet(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const eventData = getUniquesItemPriceSetData(ctx)
  const { classId, instanceId, price } = eventData

  const uniqueInstance = await ctx.store.get(UniqueInstance, getItemId(classId,instanceId))
  assert(uniqueInstance)
  uniqueInstance.price = price
  uniqueInstance.status = Status.LISTED
  await ctx.store.save(uniqueInstance)

  const event = createEvent(ctx, {
    type: EventType.PRICE_SET,
    uniqueInstance,
  })
  await ctx.store.save(event)
}
