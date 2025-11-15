//Wardrobe class module, defines wardrobe class and methods.
import { ClothingItem } from "./ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./Errors.js";
import { promises as fs } from "node:fs";
//generic function that takes an array and returns a random element
function pickRandom(arr) {
    if (arr.length === 0)
        return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}
export class Wardrobe {
    constructor() {
        this.items = []; //list of clothing items
        this.nextId = 1;
        this.rootCategories = [];
        this.initCategories();
    }
    //methods
    //
    initCategories() {
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
    findCategoryNode(style, type) {
        const styleNode = this.rootCategories.find(c => c.name === style);
        return styleNode?.subcategories.find(sc => sc.name === type);
    }
    findCategoryByName(name, nodes = this.rootCategories) {
        for (const node of nodes) {
            if (node.name === name) {
                return node;
            }
            const found = this.findCategoryByName(name, node.subcategories);
            if (found)
                return found;
        }
        return undefined;
    }
    //adds a clothing item to the list(array)
    addItem(item) {
        const newItem = new ClothingItem(this.nextId++, item.name, item.itemType, item.color, item.style);
        if (this.items.some(i => i.id === newItem.id)) {
            throw new DuplicateItemError(`Item with id ${newItem.id} already exists.`);
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
    removeItem(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) {
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
            this.items = obj.items.map(itemData => {
                const itemType = itemData.itemType;
                const style = itemData.style;
                return new ClothingItem(itemData.id, itemData.name, itemType, itemData.color, style);
            });
            this.initCategories();
            for (const item of this.items) {
                const node = this.findCategoryNode(item.style, item.itemType);
                if (node) {
                    node.items.push(item);
                }
            }
            console.log(`Wardrobe loaded from '${filePath}'.`);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                console.log(`No existing file at '${filePath}', starting with empty wardrobe.`);
            }
            else {
                console.error("Error loading wardrobe:", err);
            }
        }
    }
    collectItemsRecursive(node) {
        let results = [...node.items];
        for (const child of node.subcategories) {
            results = results.concat(this.collectItemsRecursive(child));
        }
        return results;
    }
    getItemsInCategory(name) {
        const node = this.findCategoryByName(name);
        if (!node)
            return [];
        return this.collectItemsRecursive(node);
    }
    getRandomOutfitByStyle(style) {
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
