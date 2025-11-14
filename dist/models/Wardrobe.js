//Wardrobe class module, defines wardrobe class and methods.
import { ClothingItem } from "./ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./Errors.js";
import { promises as fs } from "node:fs";
export class Wardrobe {
    constructor() {
        this.items = []; //list of clothing items
        this.nextId = 1;
    }
    //methods
    //adds a clothing item to the list(array)
    addItem(item) {
        const newItem = new ClothingItem(this.nextId++, item.name, item.itemType, item.color, item.style);
        if (this.items.some(i => i.id === newItem.id)) {
            throw new DuplicateItemError(`Item with id ${newItem.id} already exists.`);
        }
        this.items.push(newItem);
        return newItem.id;
    }
    //removes a clothing item from the array
    removeItem(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) {
            throw new ItemNotFoundError(`Item with id %{id} not found.`);
        }
        this.items.splice(index, 1);
        return id;
    }
    //prints the list of items in the wardrobe
    listItems() {
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
    async saveToFile(filePath) {
        const data = {
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
    async loadFromFile(filePath) {
        try {
            const fileData = await fs.readFile(filePath, "utf8");
            const obj = JSON.parse(fileData);
            this.nextId = obj.nextId;
            this.items = obj.items.map(itemData => new ClothingItem(itemData.id, itemData.name, itemData.itemType, itemData.color, itemData.style));
            console.log(`Wardrobe loaded from '${filePath}'.`);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                console.log(`No existing file at '${filePath}', starting with empty wardrobe.`);
                // file not found is OK — just skip
            }
            else {
                console.error("Error loading wardrobe:", err);
            }
        }
    }
}
