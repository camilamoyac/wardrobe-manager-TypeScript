//Clothing Item class module, defines and initializes a ClothingItem

export type ItemType = "top" | "bottom" | "shoes" | "accessory"; //4 options for type
export type Style = "casual" | "formal" | "sport"; //3 options for style

export class ClothingItem {
    constructor(
        public id : number,
        public name : string,
        public itemType : ItemType,
        public color : string,
        public style : Style 
    ){}
}