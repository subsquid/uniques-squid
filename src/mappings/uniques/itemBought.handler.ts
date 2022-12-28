import { EventHandlerContext } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'
import assert from 'assert'
import {
  EventType,
  Status,
  UniqueEvent,
  UniqueInstance,
} from '../../model/generated'
import * as events from '../../types/events'
import { encodeId, getItemId } from '../helpers'

interface IUniquesItemBoughtData {
  classId: number
  instanceId: number
  seller: Uint8Array
  buyer: Uint8Array
  price: bigint
}

function getUniquesItemBoughtData(
  ctx: EventHandlerContext<Store>
): IUniquesItemBoughtData {
  const event = new events.UniquesItemBoughtEvent(ctx)

  if (event.isV9270) {
    const {
      collection: classId,
      item: instanceId,
      price,
      seller,
      buyer,
    } = event.asV9270
    return { classId, instanceId, price, seller, buyer }
  }
  ctx.log.warn('USING UNSAFE GETTER! PLS UPDATE TYPES!')
  const {
    collection: classId,
    item: instanceId,
    price,
    seller,
    buyer,
  } = ctx._chain.decodeEvent(ctx.event)
  return { classId, instanceId, price, seller, buyer }
}

export async function uniqueItemBought(
  ctx: EventHandlerContext<Store>
): Promise<void> {
  const { classId, instanceId, seller, buyer, price } =
    getUniquesItemBoughtData(ctx)
  const from = encodeId(seller)
  const to = encodeId(buyer)

  const uniqueInstance = await ctx.store.get(
    UniqueInstance,
    getItemId(classId, instanceId)
  )
  assert(uniqueInstance)
  uniqueInstance.price = 0n
  uniqueInstance.status = Status.ACTIVE
  await ctx.store.save(uniqueInstance)

  // Find realted transfer and change it data
  const event = await ctx.store.get(UniqueEvent, {
    where: {
      blockNum: ctx.block.height,
      uniqueInstance: { id: uniqueInstance.id },
      from,
      to,
      type: EventType.TRNASFER,
    },
  })
  assert(event)
  event.price = price
  event.type = EventType.BOUGHT
  await ctx.store.save(event)
}
