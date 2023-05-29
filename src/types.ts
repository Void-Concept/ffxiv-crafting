export type Material = {
    name: string
    id: number
    quantity: number
    yield: number
    components?: Material[]
}

export type MaterialListing = {
    price: number
    quantity: number
    hq: boolean
    worldName: string
}

export type MaterialCraftPrices = {
    price?: number
    minPrice?: number
    priceFromRaw?: number
    minPriceFromRaw?: number
}

export type MaterialPrice = {
    name: string
    id: number
    quantity: number
    marketPrice: number
    minMarketPrice: number
    hq: boolean
    craft?: MaterialCraftPrices
    craftPerItem?: MaterialCraftPrices
    craftPrice?: number
    minCraftPrice?: number
    craftPriceFromRaw?: number
    minCraftPriceFromRaw?: number
    components?: MaterialPrice[]
    listings: MaterialListing[]
}
