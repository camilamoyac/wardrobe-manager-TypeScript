//Clothing Item class module, defines and initializes a ClothingItem, defines clothing item types and style types

export type ItemType = "top" | "bottom" | "shoes"; //3 options for type
export type Style = "casual" | "formal"; //2 options for style

export class ClothingItem {
    constructor(
        public id : number,
        public name : string,
        public itemType : ItemType,
        public color : string,
        public style : Style 
    ){}
}