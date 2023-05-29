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
    price: number
    minPrice: number
    priceFromRaw: number
    minPriceFromRaw: number
}

export type MaterialPrice = {
    name: string
    id: number
    quantity: number
    yield: number
    marketPrice: number
    minMarketPrice: number
    marketPricePerCraft: number
    minMarketPricePerCraft: number
    hq: boolean
    craft?: MaterialCraftPrices
    craftPerItem?: MaterialCraftPrices
    components?: MaterialPrice[]
    listings: MaterialListing[]
}
