import { Material } from "../types"
import { GarlandToolsResponse, ItemInfo } from "./types"
import fetch from 'node-fetch'

const withQuantity = (material: Omit<Material, 'quantity'>, quantity: number): Material => ({
    ...material,
    quantity
})


export const lookupItem = async (id: number): Promise<Material> => {
    const url = `https://garlandtools.org/db/doc/item/en/3/${id}.json`
    const response = await fetch(url)
    const itemDescription = await response.json() as GarlandToolsResponse

    const craft = itemDescription.item.craft
    const yieldVar = !!craft && craft[0].yield || 0

    return {
        name: itemDescription.item.name,
        id: itemDescription.item.id,
        quantity: 1,
        yield: yieldVar,
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

