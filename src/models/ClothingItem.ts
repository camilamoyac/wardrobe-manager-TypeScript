//Represents a single piece of clothing in the wardrobe.

//possible types for clothing items.
export type ItemType = "top" | "bottom" | "shoes"; //3 options for type
export type Style = "casual" | "formal"; //2 options for style

//creates a new ClothingItem
export class ClothingItem {
    constructor(
        public id : number,          //The unique ID for this item
        public name : string,        //The name of the clothing piece
        public itemType : ItemType,  //What type of clothing it is (top, bottom, or shoes)
        public color : string,       //The color of the item
        public style : Style         //Whether this item is casual or formal
    ){}
}