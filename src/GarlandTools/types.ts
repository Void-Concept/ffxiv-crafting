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
    yield?: number
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
        g?: number
        f?: {
            id: number
            job: number
            lvl: number
            stars: number
        }[]
        j?: number
        r?: number
        e?: number
    }
}

export type GarlandToolsResponse = {
    item: ItemInfo
    ingredients?: ItemIngredient[]
    partials: ItemPartial[]
}