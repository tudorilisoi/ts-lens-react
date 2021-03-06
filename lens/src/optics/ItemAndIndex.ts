import {Lens} from "./Lens";
import {LensContext} from "./LensContext";


export class ItemsAndIndex<T> {
    static makeLens<T>(n: number): Lens<T[], ItemsAndIndex<T>> { return new Lens<T[], ItemsAndIndex<T>>(l => new ItemsAndIndex<T>(l, n), (l, i) => i.items)}
    static makeContext<Domain, Main, T>(context: LensContext<Domain, Main, T[]>, n: number): LensContext<Domain, Main, ItemsAndIndex<T>> {return context.withChildLens(this.makeLens(n))}
    items: T[]
    index: number
    item() {return this.items[this.index]}

    constructor(items: T[], index: number) {
        this.items = items;
        this.index = index;
    }
    removeItem(): ItemsAndIndex<T> {
        let result = [...this.items]
        result.splice(this.index, 1)
        return new ItemsAndIndex<T>(result, -1)
    }
    decrementQuantityRemoveIfZero(quantityL: Lens<T, number>) {
        let item = this.item()
        let quantity = quantityL.get(item)
        return quantity < 2 ? this.removeItem() : this.mapItem(quantityL.transform(q => q - 1))

    }
    mapItem(fn: (t: T) => T) {
        let result = [...this.items]
        result[this.index] = fn(this.item())
        return new ItemsAndIndex(result, this.index)
    }
}
