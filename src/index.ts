import fetch from 'node-fetch'
import {GarlandToolsResponse, isMultiItem, ItemCraft, ItemInfo, Material, MaterialPrice, UniversalisItem, UniversalisResponse} from './types'


const withQuantity = (material: Omit<Material, 'quantity'>, quantity: number): Material => ({
    ...material,
    quantity
})


const thavnairianAlmandine = {
    name: "Thavnairian Almandine",
    id: 37825,
}
const ilmenite: Material = {
    name: "Ilmenite",
    id: 37820,
    quantity: 1
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

const worldsFilter = ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren']

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

const getItemPrices = async (materials: Material[]): Promise<MaterialPrice[]> => {
    const ids = getIds(materials)
    const url = `https://universalis.app/api/v2/Aether/${ids.join(',')}`
    const response = await fetch(url)
    const universalisResponse = await response.json() as UniversalisResponse
    
    const items = getItems(universalisResponse)

    const itemPrices = calculatePrice(materials, items)
    return itemPrices
} 

const run = async () => {
    const itemPrices = await getItemPrices([ilmenite])
    console.log(JSON.stringify(itemPrices))
}

// run().catch(console.error)

const lookupItem = async (id: number): Promise<Material> => {
    const url = `https://garlandtools.org/db/doc/item/en/3/${id}.json`
    const response = await fetch(url)
    const itemDescription = await response.json() as GarlandToolsResponse

    return {
        name: itemDescription.item.name,
        id: itemDescription.item.id,
        quantity: 1,
        components: await createComponents(itemDescription.item),
    }
}

const createComponents = async (itemInfo: ItemInfo): Promise<Material[] | undefined> => {
    if (!itemInfo.craft || itemInfo.craft.length == 0) return undefined
    if (itemInfo.craft.length > 1) console.warn("More than one craft found for", itemInfo.name, '| only using first')

    const subMaterialPromises = itemInfo.craft[0].ingredients.map(async (ing) => {
        const subMaterial = await lookupItem(ing.id)

        return withQuantity(subMaterial, ing.amount)
    })
    return Promise.all(subMaterialPromises)
}

const craftItem = async (id: number): Promise<MaterialPrice[]> => {
    const material = await lookupItem(id)

    return await getItemPrices([material])
}


const craftItems = async (ids: number[]): Promise<MaterialPrice[]> => {
    const materials = await Promise.all(ids.map(id => lookupItem(id)))

    return await getItemPrices(materials)
}

const searchItem = async (searchTerm: string): Promise<MaterialPrice[]> => {
    const url = `https://garlandtools.org/api/search.php?text=${encodeURIComponent(searchTerm)}&lang=en`
    const response = await fetch(url)
    const json = await response.json() as any[] //TODO: type
    const ids = json.map(item => item.id).map(id => parseInt(id, 10))
    
    return await craftItems(ids)
}

const run2 = async () => {
    const id = 39677

    const prices = await craftItem(id)

    console.log(JSON.stringify(prices))
}

const run3 = async () => {
    const searchTerm = `Cunning Craftsman D`

    const prices = await searchItem(searchTerm)

    console.log(JSON.stringify(prices))
}

run3().catch(console.error)
