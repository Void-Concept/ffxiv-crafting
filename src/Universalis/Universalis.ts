import { Material, MaterialPrice } from "../types"
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

        return {
            ...material,
            components: undefined, // remove components for types
            hq: !!itemPrice.averagePriceHQ,
            marketPrice: itemPrice.averagePriceHQ || itemPrice.averagePriceNQ,
            minMarketPrice: itemPrice.minPriceHQ || itemPrice.minPriceNQ,
            ...getSubPrices(items, material.components),
            listings
        }
    })
}

const getSubPrices = (items: Record<string, UniversalisItem>, components?: Material[]): Partial<MaterialPrice> => {
    if (!components) return {}
 
    const subPrices = calculatePrice(components, items)

    const prices = subPrices.reduce((prev, curr) => ({
        craftPrice: prev.craftPrice + (curr.marketPrice * curr.quantity),
        minCraftPrice: prev.minCraftPrice + (Math.min(curr.craftPrice || Infinity, curr.minMarketPrice) * curr.quantity), 
        craftPriceFromRaw: prev.craftPriceFromRaw + ((curr.craftPriceFromRaw || curr.minMarketPrice) * curr.quantity),
        minCraftPriceFromRaw: prev.minCraftPriceFromRaw + (Math.min(curr.craftPriceFromRaw || Infinity, curr.minMarketPrice) * curr.quantity),
    }), {
        craftPrice: 0,
        minCraftPrice: 0,
        craftPriceFromRaw: 0,
        minCraftPriceFromRaw: 0,
    })
 
    return { ...prices, components: subPrices }
}