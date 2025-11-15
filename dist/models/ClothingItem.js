//Represents a single piece of clothing in the wardrobe.
//creates a new ClothingItem
export class ClothingItem {
    constructor(id, //The unique ID for this item
    name, //The name of the clothing piece
    itemType, //What type of clothing it is (top, bottom, or shoes)
    color, //The color of the item
    style //Whether this item is casual or formal
    ) {
        this.id = id;
        this.name = name;
        this.itemType = itemType;
        this.color = color;
        this.style = style;
    }
}
