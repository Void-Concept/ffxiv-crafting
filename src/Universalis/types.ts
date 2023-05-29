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