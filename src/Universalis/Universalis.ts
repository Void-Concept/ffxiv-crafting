import { Material, MaterialCraftPrices, MaterialPrice } from "../types"
import { isMultiItem, UniversalisItem, UniversalisResponse } from "./types"
import fetch from 'node-fetch'

export const getItemPrices = async (materials: Material[]): Promise<MaterialPrice[]> => {
    const ids = getIds(materials)
    const url = `https://universalis.app/api/v2/Aether/${ids.join(',')}`
    const response = await fetch(url)
    const universalisResponse = await response.json() as UniversalisResponse
    
    const items = getItems(universalisResponse)

    const itemPrices = calculatePrice(materials, items)
    return itemPrices
}

const getItems = (response: UniversalisResponse): Record<string, UniversalisItem> => {
    if (isMultiItem(response)) {
        return response.items
    } else {
        return {
            [response.itemID]: response
        }
    }
}

const getIds = (materials: Material[]): number[] => {
    const ids = materials.reduce<number[]>((acc, curr) => {
        const subIds = curr.components && getIds(curr.components) || []
        return [...acc, curr.id, ...subIds]
    }, [])

    return [...new Set(ids)]
}

const calculatePrice = (materials: Material[], items: Record<string, UniversalisItem>): MaterialPrice[] => {
    return materials.map(material => {
        const itemPrice = items[material.id]

        const isHqItem = !!itemPrice.averagePriceHQ

        const listings = itemPrice.listings
            .filter(listing => !isHqItem || listing.hq)
            .map(listing => ({
                price: listing.pricePerUnit,
                quantity: listing.quantity, 
                hq: listing.hq,
                worldName: listing.worldName
            }))
            .slice(0, 5) //TODO: remove if/when UI is added

        const marketPrice = itemPrice.averagePriceHQ || itemPrice.averagePriceNQ
        const minMarketPrice = itemPrice.minPriceHQ || itemPrice.minPriceNQ

        return {
            ...material,
            components: undefined, // remove components for types
            hq: !!itemPrice.averagePriceHQ,
            marketPrice,
            minMarketPrice,
            marketPricePerCraft: marketPrice * material.yield,
            minMarketPricePerCraft: minMarketPrice * material.yield,
            ...getSubPrices(items, material.yield, material.components),
            listings
        }
    })
}

const getSubPrices = (items: Record<string, UniversalisItem>, itemYield?: number, components?: Material[]): Partial<MaterialPrice> => {
    if (!components) return {}
 
    const subPrices = calculatePrice(components, items)

    const prices = subPrices.reduce<MaterialCraftPrices>((prev, curr) => ({
        price: prev.price + (curr.marketPrice * curr.quantity),
        minPrice: prev.price + (Math.min(curr.craftPerItem?.price || Infinity, curr.minMarketPrice) * curr.quantity), 
        priceFromRaw: prev.priceFromRaw + ((curr.craftPerItem?.priceFromRaw || curr.minMarketPrice) * curr.quantity),
        minPriceFromRaw: prev.priceFromRaw + (Math.min(curr.craftPerItem?.priceFromRaw || Infinity, curr.minMarketPrice) * curr.quantity),
    }), {
        price: 0,
        minPrice: 0,
        priceFromRaw: 0,
        minPriceFromRaw: 0,
    })

    const pricePerItem: MaterialCraftPrices = !itemYield ? prices : {
        price: prices.price / itemYield,
        minPrice: prices.minPrice / itemYield,
        priceFromRaw: prices.priceFromRaw / itemYield,
        minPriceFromRaw: prices.minPriceFromRaw / itemYield,
    }
 
    return { 
        craft: prices,
        craftPerItem: pricePerItem,
        components: subPrices 
    }
}