import { ClothingItem } from "./ClothingItem.js";

//Represents a node in the wardrobe category tree.
//Categories are organized hierarchically (e.g., by style and type),
//and each category can contain clothing items and subcategories.

export interface Category {
    name: string;                 
    items: ClothingItem[];        // items directly in this category
    subcategories: Category[];    // children categories (recursive)
}