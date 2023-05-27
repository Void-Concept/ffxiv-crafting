export type Material = {
    name: string
    id: number
    quantity: number
    components?: Material[]
}

export type World = string //TODO: enumerate

export type Materia = any //TODO

export type UniversalisListing = {
    lastReviewTime: number
    pricePerUnit: number
    quantity: number
    stainID: number
    worldName: World
    worldID: number
    creatorName: string
    creatorID: string
    hq: boolean
    isCrafted: boolean
    listingID: string
    materia: Materia[]
    onMannequin: boolean
    retainerCity: number
    retainerID: string
    retainerName: string
    sellerID: string
    total: number
}

export type UniversalisHistory = {
    hq: boolean
    pricePerUnit: number
    quantity: number
    timestamp: number
    onMannequin: boolean
    worldName: World
    worldID: number
    buyerName: string
    total: number
}

export type StackSizeHistogram = Record<string, number>

export type WorldUploadTime = Record<World, number>

export type UniversalisItem = {
    itemID: string
    lastUploadTime: number
    listings: UniversalisListing[]
    recentHistory: UniversalisHistory[]
    regionName: string
    currentAveragePrice: number
    currentAveragePriceNQ: number
    currentAveragePriceHQ?: number
    regularSaleVelocity: number
    nqSaleVelocity: number
    hqSaleVelocity?: number
    averagePrice: number
    averagePriceNQ: number
    averagePriceHQ?: number
    minPrice: number
    minPriceNQ: number
    minPriceHQ?: number
    maxPrice: number
    maxPriceNQ: number
    maxPriceHQ?: number
    stackSizeHistogram: StackSizeHistogram
    stackSizeHistogramNQ: StackSizeHistogram
    stackSizeHistogramHQ?: StackSizeHistogram
    worldUploadTimes: WorldUploadTime
}

export type UniversalisMultiItem = {
    itemIDs: number[]
    items: Record<string, UniversalisItem>
    regionName: string
    unresolvedItems: number[]
}

export type UniversalisResponse = UniversalisItem | UniversalisMultiItem

export const isMultiItem = (response: UniversalisResponse): response is UniversalisMultiItem => !!(response as any).items

export type MaterialListing = {
    price: number
    quantity: number
    hq: boolean
    worldName: string
}

export type MaterialPrice = {
    name: string
    id: number
    quantity: number
    marketPrice: number
    minMarketPrice: number
    hq: boolean
    craftPrice?: number
    minCraftPrice?: number
    craftPriceFromRaw?: number
    minCraftPriceFromRaw?: number
    components?: MaterialPrice[]
    listings: MaterialListing[]
}

export type ItemAttributes = any //TODO

export type ItemSubIngredient = {
    id: number
    amount: number
    quality?: number
}

export type ItemCraft = {
    id: number
    job: number
    rlvl: number
    durability: number
    quality: number
    progress: number
    lvl: number
    suggestedCraftsmanship: number
    suggestedControl: number
    materialQualityFactor: number
    stars: number
    hq: 1 | 0
    controlReq: number
    craftsmanshipReq: number
    unlockId: number
    ingredients: ItemSubIngredient[]
    complexity: {
        nq: number
        hq: number
    }
}

export type ItemInfo = {
    name: string
    jobCategories?: string
    description?: string
    id: number
    patch: number
    patchCategory: number
    price: number
    ilvl: number
    category: number
    tradable: 1 | 0
    sell_price: number
    rarity: number
    convertable?: number
    stackSize: number
    repair?: number
    equip?: number
    sockets?: number
    repair_item?: number
    glamourous?: number
    deliver?: number
    slot?: number
    elvl?: number
    jobs?: number
    models?: string[]
    attr?: ItemAttributes
    attr_hq?: ItemAttributes
    attr_max?: ItemAttributes
    icon: number
    unlockId?: number
    ingredient_of?: Record<string, number>
    nodes?: number[]
    sharedModels: number[]
    craft?: ItemCraft[]
    downgrades: number[]
}

export type ItemShop = {
    shops: string
    npcs: number[]
    listings: {
        item: {
            id: string
            amount: number
        }[]
        currency: {
            id: string
            amount: number
        }[]
    }[]
}

export type ItemIngredient = {
    name: string
    id: number
    icon: number
    category: number
    ilvl: number
    price: number
    craft?: ItemCraft[]
    venture?: number[]
    nodes?: number[]
    tradeShops?: ItemShop[]
}

export type ItemPartial = {
    type: string //TODO enum
    id: string
    obj: {
        id: number
        n: string
        l: number
        c: number
        t: number
    }
}

export type GarlandToolsResponse = {
    item: ItemInfo
    ingredients?: ItemIngredient[]
    partials: ItemPartial[]
}