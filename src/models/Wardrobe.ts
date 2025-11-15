//Wardrobe class module, defines wardrobe class and methods.

import { ClothingItem } from "./ClothingItem.js";
import { ItemType, Style } from "./ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./Errors.js";
import { Category } from "./Category.js";
import { promises as fs } from "node:fs";

interface PersistedWardrobe {
  nextId: number;
  items: {
    id: number;
    name: string;
    itemType: string;
    color: string;
    style: string;
  }[];
}

//generic function that takes an array and returns a random element
function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

export class Wardrobe {
    private items : ClothingItem[] = []; //list of clothing items
    private nextId : number = 1;
    private rootCategories: Category[] = [];

    constructor() {
        this.initCategories();
    }

    //methods
    //
    private initCategories() {
        this.rootCategories = ["casual", "formal"].map(styleName => ({
            name: styleName,
            items: [],
            subcategories: ["top", "bottom", "shoes"].map(typeName => ({
            name: typeName,
            items: [],
            subcategories: []
            }))
        }));
    }

    private findCategoryNode(style: Style, type: ItemType) {
        const styleNode = this.rootCategories.find(c => c.name === style);
        return styleNode?.subcategories.find(sc => sc.name === type);
    }

    private findCategoryByName(name: string, nodes: Category[] = this.rootCategories): Category | undefined {
        for (const node of nodes) {
        if (node.name === name) {
            return node;
        }
        const found = this.findCategoryByName(name, node.subcategories);
        if (found) return found;
        }
        return undefined;
    }

    //adds a clothing item to the list(array)
    addItem(item : Omit<ClothingItem, "id">) : number{ 
        const newItem = new ClothingItem(
            this.nextId++,
            item.name,
            item.itemType,
            item.color,
            item.style
        );

        if (this.items.some(i => i.id === newItem.id)){
            throw new DuplicateItemError(`Item with id ${newItem.id} already exists.`)
        }

        //push into array
        this.items.push(newItem);

        //push into tree
        const node = this.findCategoryNode(newItem.style, newItem.itemType);
        if (node) {
            node.items.push(newItem);
        }

        return newItem.id;
    }

    //removes a clothing item from the array
    removeItem(id : number) : number{ 
        const index = this.items.findIndex(i => i.id === id); 
        if (index === -1){
            throw new ItemNotFoundError(`Item with id %{id} not found.`);
        }
        //remove from array
        const [removed] = this.items.splice(index, 1);

        //remove from tree
        const node = this.findCategoryNode(removed.style, removed.itemType);
        if (node) {
            const catIdx = node.items.findIndex(i => i.id === removed.id);
        if (catIdx !== -1) {
            node.items.splice(catIdx, 1);
        }
        }

        return id;
    }

    //prints the list of items in the wardrobe
    listItems() : void{
        if (this.items.length === 0) {
            console.log("Wardrobe is empty.");
        } 
        else {
            console.log("Items in wardrobe:");
            for (const item of this.items) {
                console.log(`- ID: ${item.id} | Name: ${item.name} | Type: ${item.itemType} | Color: ${item.color} | Style: ${item.style}`);
            }
        }
    }

    async saveToFile(filePath: string): Promise<void> {
        const data: PersistedWardrobe = {
            nextId: this.nextId,
            items: this.items.map(i => ({
                id: i.id,
                name: i.name,
                itemType: i.itemType,
                color: i.color,
                style: i.style
      }))
    };

    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, json, "utf8");
    console.log(`Wardrobe saved to '${filePath}'.`);
    }

    async loadFromFile(filePath: string): Promise<void> {
        try {
            const fileData = await fs.readFile(filePath, "utf8");
            const obj = JSON.parse(fileData) as PersistedWardrobe;

            this.nextId = obj.nextId;
            this.items = obj.items.map(itemData => {
                const itemType = itemData.itemType as ItemType;
                const style    = itemData.style    as Style;

                return new ClothingItem(
                    itemData.id,
                    itemData.name,
                    itemType,
                    itemData.color,
                    style
                );
            });

            this.initCategories();
            for (const item of this.items) {
                const node = this.findCategoryNode(item.style, item.itemType);
                if (node) {
                    node.items.push(item);
                }
            }

            console.log(`Wardrobe loaded from '${filePath}'.`);
        } catch (err: any) {
            if (err.code === "ENOENT") {
                console.log(`No existing file at '${filePath}', starting with empty wardrobe.`);
            } else {
                console.error("Error loading wardrobe:", err);
            }
        }
    }

    private collectItemsRecursive(node: Category): ClothingItem[] {
        let results = [...node.items];
        for (const child of node.subcategories) {
            results = results.concat(this.collectItemsRecursive(child));
        }
        return results;
    }

    public getItemsInCategory(name: string): ClothingItem[] {
        const node = this.findCategoryByName(name);
        if (!node) return [];
        return this.collectItemsRecursive(node);
    }

    public getRandomOutfitByStyle(style: Style): { top?: ClothingItem, bottom?: ClothingItem, shoes?: ClothingItem } {
        const tops = this.items.filter(i => i.itemType === "top" && i.style === style);
        const bottoms = this.items.filter(i => i.itemType === "bottom" && i.style === style);
        const shoes = this.items.filter(i => i.itemType === "shoes" && i.style === style);

        return {
            top: pickRandom(tops),
            bottom: pickRandom(bottoms),
            shoes: pickRandom(shoes),
        };
    }
}