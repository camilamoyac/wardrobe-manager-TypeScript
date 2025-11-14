//Clothing Item class module, defines and initializes a ClothingItem, defines clothing item types and style types
export class ClothingItem {
    constructor(id, name, itemType, color, style) {
        this.id = id;
        this.name = name;
        this.itemType = itemType;
        this.color = color;
        this.style = style;
    }
}
