import { ClothingItem } from "./ClothingItem.js";

export interface Category {
  name: string;                 
  items: ClothingItem[];        // items directly in this category
  subcategories: Category[];    // children categories (recursive)
}