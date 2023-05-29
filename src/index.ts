import fetch from 'node-fetch'
import {Material, MaterialPrice } from './types'
import { ItemPartial, lookupItem } from './GarlandTools'
import { getItemPrices } from './Universalis'

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
    const json = await response.json() as ItemPartial[] //TODO: type
    const ids = json.map(item => item.id).map(id => parseInt(id, 10))
    
    return await craftItems(ids)
}

const run2 = async () => {
    const id = 39677

    const prices = await craftItem(id)

    console.log(JSON.stringify(prices))
}

const run3 = async () => {
    const searchTerm = `Baked Eggplant`

    const prices = await searchItem(searchTerm)

    console.log(JSON.stringify(prices))
}

run3().catch(console.error)
