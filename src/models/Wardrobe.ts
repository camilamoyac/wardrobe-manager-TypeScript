import { ClothingItem } from "./ClothingItem.js";
import { ItemType, Style } from "./ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./Errors.js";
import { Category } from "./Category.js";
import { promises as fs } from "node:fs";

//Shape of the JSON data written to / read from disk.
//- nextId: the next unique id to assign for new items
// - items: serialized clothing items (primitive-friendly types)
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

//Return a random element from the given array, or undefined if the array is empty.
//Generic utility used by outfit-suggestion logic.
function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

//Main wardrobe manager class.
//
// Responsibilities:
// - maintain a flat list of ClothingItem objects (`items`)
// - manage a derived category tree (`rootCategories`) with two levels:
//     style ("casual" | "formal") -> type ("top" | "bottom" | "shoes")
//- provide methods for add/remove/list, file persistence (async),
//  recursive traversal of the category tree, and random outfit suggestions.
export class Wardrobe {
    private items : ClothingItem[] = [];     //list of clothing items
    private nextId : number = 1;             //Next numeric id to assign for newly created items.
    private rootCategories: Category[] = []; //Root nodes of the category tree

    //Create a new Wardrobe instance and initialize the category tree.
    //Note: the category tree is derived and populated when items are added or
    //rebuilt after loading from disk.
    constructor() {
        this.initCategories();
    }

    //methods
    
    //Initialize the category tree structure.
    //Builds two root style nodes ("casual", "formal"), each with three child
    //type nodes ("top", "bottom", "shoes"). Each node starts with an empty
    //items array and may be populated later when items are added or loaded.
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

    //Locate the category node for a specific style and type.
    //Fast path for the two-level tree: find the root node matching `style`
    //and return its child node that matches `type` (or undefined).
    private findCategoryNode(style: Style, type: ItemType) {
        const styleNode = this.rootCategories.find(c => c.name === style);
        return styleNode?.subcategories.find(sc => sc.name === type);
    }

    //Recursively search the category tree for a node with the given name.
    //This method demonstrates recursion by calling itself on each node's
    //subcategories until it finds a matching node or exhausts the tree.
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

    //Adds a new clothing item to the wardrobe
    //1. creates a new ClothingItem with an auto-generated id (this.nextId)
    //2. checks for id collisions and throws DuplicateItemError if one exists
    //3. pushes the new item into the flat `items` list
    //4. inserts the new item into the appropriate category node in the tree
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

    //Removes a clothing item by id from the wardrobe
    //1. finds the item index in the flat `items` array and throws
    //   ItemNotFoundError if it does not exist
    //2. removes the item from the flat array and also removes it from the
    //   corresponding category node's items array
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

    //Prints the list of all items in the wardrobe to console
    //It prints a message when the wardrobe is empty.
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

    //Persist the wardrobe to a JSON file asynchronously.
    //The saved shape includes `nextId` (so id assignment persists across runs)
    //and the flat `items` array. The category tree is not persisted because it
    //can be reconstructed from `items` on load.
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
    }

    //Load wardrobe data from a JSON file and rebuild in-memory structures.
    //1. read and parse the JSON file into the persisted shape
    //2. restore this.nextId and rebuild the flat this.items array
    //3. re-initialize the category tree and populate nodes with items
    //If the file does not exist (ENOENT), this method leaves the wardrobe empty
    //and prints a friendly message. Other errors are logged to the console.
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

        } catch (err: any) {
            if (err.code === "ENOENT") {
                console.log(`No existing file at '${filePath}', starting with empty wardrobe.`);
            } else {
                console.error("Error loading wardrobe:", err);
            }
        }
    }

    //Recursively collect all items contained in a category and its descendants.
    //- base: include items sitting directly on the current node
    //- recursive step: for each child subcategory, call this function and
    //  concatenate the results
    private collectItemsRecursive(node: Category): ClothingItem[] {
        let results = [...node.items];
        for (const child of node.subcategories) {
            results = results.concat(this.collectItemsRecursive(child));
        }
        return results;
    }

    //Get all items belonging to a named category (and its subcategories).
    //Uses `findCategoryByName` to locate the node (recursive search) then
    //uses `collectItemsRecursive` to return a flattened list of items.
    public getItemsInCategory(name: string): ClothingItem[] {
        const node = this.findCategoryByName(name);
        if (!node) return [];
        return this.collectItemsRecursive(node);
    }

    //Build a random outfit for the requested style by picking one random
    //top, bottom and shoes from items that match the style.
    //If any subcategory has no items, the returned field for that part will
    //be undefined (caller can decide to accept partial outfits or notify user).
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