import {Lens, LensContext, LensProps, takeFromItemsAndAddToMain} from "@phil-rice/lens";
import {ItemsAndIndex} from "@phil-rice/lens/src/optics/ItemAndIndex";


export let toInventoryProductsL: Lens<AppData, InventoryItemData[]> = Lens.build<AppData>('app').then('inventory').then('products')
export let toCartsProductL: Lens<AppData, ProductData[]> = Lens.build<AppData>('app').then('cart').then('products')
export let inventoryItemQuantityLens: Lens<InventoryItemData, number> = Lens.build<InventoryItemData>('inventoryData').then('inventory')
export let productDataQuantityLens: Lens<ProductData, number> = Lens.build<ProductData>('productData').then('quantity')

export class ShoppingCartDomain {
    onCheckoutClicked: () => void
    constructor(onCheckoutClicked: () => void) {this.onCheckoutClicked = onCheckoutClicked;}


    takeFromCartPutInInventory(c: ShoppingCartContext<ItemsAndIndex<ProductData>>) {
        return c.asTuple2(toInventoryProductsL).transform(takeFromItemsAndAddToMain<InventoryItemData, ProductData>(
            inventoryItemQuantityLens, productDataQuantityLens,
            (m, t) => m.title == t.title,
            pd => ({...pd, inventory: 1})))
    }

    takeFromInventoryPutInCart(c: ShoppingCartContext<ItemsAndIndex<InventoryItemData>>) {
        return c.asTuple2(toCartsProductL).transform(takeFromItemsAndAddToMain<ProductData, InventoryItemData>(
            productDataQuantityLens, inventoryItemQuantityLens,
            (m, t) => m.title == t.title,
            pd => ({...pd, quantity: 1})))
    }
}


export type CartProps<T> = LensProps<ShoppingCartDomain, AppData, T>
export type ShoppingCartContext<T> = LensContext<ShoppingCartDomain, AppData, T>


export interface AppData {
    cart: CartData,
    inventory: InventoryData
}
export interface InventoryData {
    products: InventoryItemData[]
}

export interface CartData {
    total: string,
    products: ProductData[],
}
export interface BasicProductData {
    id: number,
    price: number,
    title: string
}

export interface ProductData extends BasicProductData {
    quantity: number
}

export interface InventoryItemData extends BasicProductData {
    inventory: number
}


