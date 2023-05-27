import fetch from 'node-fetch'
import {isMultiItem, Material, MaterialPrice, UniversalisItem, UniversalisResponse} from './types'


const withQuantity = (material: Omit<Material, 'quantity'>, quantity: number): Material => ({
    ...material,
    quantity
})


const thavnairianAlmandine = {
    name: "Thavnairian Almandine",
    id: 37825,
}
const ilmenite = {
    name: "Ilmenite",
    id: 37820,
}
const vanadinite = {
    name: "Vanadinite",
    id: 37828,
}
const immutableSolution = {
    name: "Immutable Solution",
    id: 38932,
}

const rawZoisite = {
    name: "Raw Zoisite",
    id: 38934,
}

const earthbreakAethersand = {
    name: "Earthbreak Aethersand",
    id: 38936,
}

const mornveilTreeBark = {
    name: "Mornveil Tree Bark",
    id: 38933,
}

const rawRutilatedQuartz = {
    name: "Raw Rutilated Quartz",
    id: 38933,
}

const gripgel = {
    name: "Gripgel",
    id: 39595,
}
const hannishVarnish = {
    name: "Hannish Varnish",
    id: 37826,
}
const paldaoLog = {
    name: "Paldao Log",
    id: 37818,
}

//-----

const zoisite = {
    name: "Zoisite",
    id: 38931,
    components: [
        withQuantity(rawZoisite, 4),
        withQuantity(immutableSolution, 1),
        withQuantity(earthbreakAethersand, 1),
    ]
}

const rutilatedQuartz = {
    name: "Rutilated Quartz",
    id: 37830,
    components: [
        withQuantity(thavnairianAlmandine, 2),
        withQuantity(rawRutilatedQuartz, 5),
    ]
}
const craftsmansAlkahest = {
    name: "Craftsman's Alkahest",
    id: 38932,
    components: [
        withQuantity(mornveilTreeBark, 4),
        withQuantity(immutableSolution, 1),
        withQuantity(earthbreakAethersand, 1),
    ]
}
const paldaoLumber = {
    name: "Paldao Lumber",
    id: 37831,
    components: [
        withQuantity(paldaoLog, 5),
        withQuantity(hannishVarnish, 2),
    ]
}
const ilmeniteIngot = {
    name: "Ilmenite Ingot",
    id: 37833,
    components: [
        withQuantity(ilmenite, 4),
        withQuantity(vanadinite, 2),
    ]
}

//-----

const indagatorsRisingHammer: Material = {
    name: "Indagator's Rising Hammer",
    id: 38892,
    quantity: 1,
    components: [
        withQuantity(craftsmansAlkahest, 3),
        withQuantity(ilmeniteIngot, 3),
        withQuantity(paldaoLumber, 2),
        withQuantity(gripgel, 3),
    ]
}

const indagatorsMortar: Material = {
    name: "Indagator's Mortar",
    id: 38907,
    quantity: 1,
    components: [
        withQuantity(zoisite, 3),
        withQuantity(ilmeniteIngot, 3),
        withQuantity(paldaoLumber, 2),
        withQuantity(gripgel, 3),
    ]
}


const indagatorsPliers: Material = {
    name: "Indagator's Pliers",
    id: 38903,
    quantity: 1,
    components: [
        withQuantity(zoisite, 3),
        withQuantity(ilmeniteIngot, 4),
        withQuantity(rutilatedQuartz, 1),
        withQuantity(gripgel, 3),
    ]
}

const materials: Material[] = [
    indagatorsRisingHammer,
    indagatorsMortar,
    indagatorsPliers,
]

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

//TODO: check calculations
const getSubPrices = (items: Record<string, UniversalisItem>, components?: Material[]) => {
    if (!components) return {}
 
    const subPrices = calculatePrice(components, items)

    const prices = subPrices.reduce((prev, curr) => ({
        craftPrice: prev.craftPrice + (curr.marketPrice * curr.quantity),
        minCraftPrice: prev.minCraftPrice + (Math.min(curr.craftPrice || Infinity, curr.marketPrice) * curr.quantity), 
        craftPriceFromRaw: prev.craftPriceFromRaw + ((curr.craftPriceFromRaw || curr.marketPrice) * curr.quantity),
        minCraftPriceFromRaw: prev.minCraftPriceFromRaw + (Math.min(curr.craftPriceFromRaw || Infinity, curr.marketPrice) * curr.quantity),
    }), {
        craftPrice: 0,
        minCraftPrice: 0,
        craftPriceFromRaw: 0,
        minCraftPriceFromRaw: 0,
    })
 
    return { ...prices, components: subPrices }
}

const calculatePrice = (materials: Material[], items: Record<string, UniversalisItem>): MaterialPrice[] => {
    return materials.map(material => {
        const itemPrice = items[material.id]

        return {
            ...material,
            components: undefined, // remove components for types
            hq: !!itemPrice.averagePriceHQ,
            marketPrice: itemPrice.averagePriceHQ || itemPrice.averagePriceNQ,
            ...getSubPrices(items, material.components)
        }
    })
}

const run = async () => {
    const ids = getIds(materials)
    // console.log(ids)
    const url = `https://universalis.app/api/v2/North-America/${ids.join(',')}`
    const response = await fetch(url)
    const universalisResponse = await response.json() as UniversalisResponse
    
    const items = getItems(universalisResponse)

    const itemPrices = calculatePrice(materials, items)
    console.log(JSON.stringify(itemPrices))
}

run().catch(console.error)
