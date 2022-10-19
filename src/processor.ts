import {
  EventHandlerContext,
  SubstrateBatchProcessor,
  SubstrateEvent,
} from '@subsquid/substrate-processor'
import { Store, TypeormDatabase } from '@subsquid/typeorm-store'
import * as mappings from './mappings'

const processor = new SubstrateBatchProcessor()

processor.setTypesBundle('statemine')
processor.setBatchSize(500)
processor.setDataSource({
  archive: 'https://statemine.archive.subsquid.io/graphql',
  chain: 'wss://statemine-rpc.polkadot.io',
})

// processor.setBlockRange({from: 338599});		///ERROR AT BLOCK 338600 - no class created before metadataset

processor.addEvent('Uniques.Created', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ForceCreated', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Issued', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Destroyed', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Transferred', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Burned', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Frozen', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.Thawed', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ClassFrozen', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ClassThawed', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.CollectionFrozen', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.CollectionThawed', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.CollectionMetadataSet', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.CollectionMetadataCleared', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ClassMetadataSet', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ClassMetadataCleared', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.MetadataSet', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.MetadataCleared', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.TeamChanged', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.OwnerChanged', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.AttributeSet', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.AttributeCleared', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ItemBought', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ItemPriceSet', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.ItemPriceRemoved', {
  data: { event: { args: true } },
} as const)
processor.addEvent('Uniques.CollectionMaxSupplySet', {
  data: { event: { args: true } },
} as const)

processor.run(new TypeormDatabase(), async (ctx) => {
  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind === 'event') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        // ctx.log.info([block.header.height, block.header.hash, item.name, (item.event as SubstrateEvent).args])
        await processEventItems({
          ...ctx,
          block: block.header,
          event: item.event as SubstrateEvent,
        })
      }
    }
  }
})

async function processEventItems(
  ctx: EventHandlerContext<Store, { event: true }>
) {
  switch (ctx.event.name) {
    case 'Uniques.Created': {
      await mappings.uniqueClassCreated(ctx)
      break
    }
    case 'Uniques.ForceCreated': {
      await mappings.uniqueForceCreated(ctx)
      break
    }
    case 'Uniques.Issued': {
      await mappings.uniqueIssued(ctx)
      break
    }
    case 'Uniques.Destroyed': {
      await mappings.uniqueClassDestroyed(ctx)
      break
    }
    case 'Uniques.Transferred': {
      await mappings.uniqueTransferred(ctx)
      break
    }
    case 'Uniques.Burned': {
      await mappings.uniqueBurned(ctx)
      break
    }
    case 'Uniques.Frozen': {
      await mappings.uniqueFrozen(ctx)
      break
    }
    case 'Uniques.Thawed': {
      await mappings.uniqueThawed(ctx)
      break
    }
    case 'Uniques.ClassFrozen': {
      await mappings.uniqueClassFrozen(ctx)
      break
    }
    case 'Uniques.ClassThawed': {
      await mappings.uniqueClassThawed(ctx)
      break
    }
    case 'Uniques.CollectionThawed': {
      await mappings.uniqueCollectionThawed(ctx)
      break
    }
    case 'Uniques.CollectionFrozen': {
      await mappings.uniqueCollectionFrozen(ctx)
      break
    }
    case 'Uniques.CollectionMetadataSet': {
      await mappings.uniqueCollectionMetadataSet(ctx)
      break
    }
    case 'Uniques.CollectionMetadataCleared': {
      await mappings.uniqueCollectionMetadataCleared(ctx)
      break
    }
    case 'Uniques.ClassMetadataSet': {
      await mappings.uniqueClassMetadataSet(ctx)
      break
    }
    case 'Uniques.ClassMetadataCleared': {
      await mappings.uniqueClassMetadataCleared(ctx)
      break
    }
    case 'Uniques.MetadataSet': {
      await mappings.uniqueMetadataSet(ctx)
      break
    }
    case 'Uniques.MetadataCleared': {
      await mappings.uniqueMetadataCleared(ctx)
      break
    }
    case 'Uniques.TeamChanged': {
      await mappings.uniqueTeamChanged(ctx)
      break
    }
    case 'Uniques.OwnerChanged': {
      await mappings.uniqueOwnerChanged(ctx)
      break
    }
    case 'Uniques.AttributeSet': {
      await mappings.uniqueAttributeSet(ctx)
      break
    }
    case 'Uniques.AttributeCleared': {
      await mappings.uniqueAttributeCleared(ctx)
      break
    }
    case 'Uniques.ItemBought': {
      await mappings.uniqueItemBought(ctx)
      break
    }
    case 'Uniques.ItemPriceSet': {
      await mappings.uniqueItemPriceSet(ctx)
      break
    }
    case 'Uniques.ItemPriceRemoved': {
      await mappings.uniqueItemPriceRemoved(ctx)
      break
    }
    case 'Uniques.CollectionMaxSupplySet': {
      await mappings.uniqueMaxSupplySet(ctx)
      break
    }
    default:
  }
}
