//Console CLI for the Wardrobe Manager.
//Provides a simple interactive loop using Node's readline/promises API.
// Supported commands:
//  - add      : Prompt user for clothing fields and add an item
//  - remove   : Remove an item by numeric id
//  - list     : List all items in the wardrobe
//  - save     : Persist wardrobe to JSON file (async)
//  - load     : Load wardrobe from JSON file (async)
//  - category : Show items by style or type (uses category tree / recursion)
//  - suggest  : Suggest a random outfit by style (casual/formal)
//  - exit     : Quit the program
//
// The CLI catches and displays specific custom errors (DuplicateItemError,
// ItemNotFoundError) so the user gets clear feedback on problems.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "process";
import { Wardrobe } from "./models/Wardrobe.js";
import { ClothingItem } from "./models/ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./models/Errors.js";
// Main entry point for the CLI application.
// Sets up a readline interface, constructs a Wardrobe instance, and runs
// an infinite prompt loop until the user types "exit". Each loop iteration
// reads a command, validates it, and dispatches to the corresponding
// handler (add / remove / list / save / load / category / suggest / exit).
// The function is async because it uses await for readline questions and
// for wardrobe async persistence methods.
async function main() {
    const rl = readline.createInterface({ input, output });
    const wardrobe = new Wardrobe();
    console.log("******---------------------------------------------------******");
    console.log("**           Welcome to your Wardrobe Manager!               **");
    console.log("** COMMANDS                                                  **");
    console.log("** add: add a clothing item to your wardrobe                 **");
    console.log("** remove: remove a clothing item to your wardrobe           **");
    console.log("** list: show all items in your wardrobe                     **");
    console.log("** save: save wardrobe to file                               **");
    console.log("** load: load wardrobe from file                             **");
    console.log("** category: show items from a specific category             **");
    console.log("** suggest: suggest a random outfit by style                 **");
    console.log("** exit: exit your wardrobe                                  **");
    console.log("**-----------------------------------------------------------**");
    while (true) {
        const line = await rl.question("** Enter command >> ");
        const parts = line.trim().split(" ");
        const cmdInput = parts[0].toLowerCase();
        if (!["add", "remove", "list", "save", "load", "category", "suggest", "exit"].includes(cmdInput)) {
            console.log(`Unrecognized command: ${cmdInput}.`);
            console.log(`You must type a valid command (add | remove | list | save | load | category | suggest | exit)`);
            continue;
        }
        const cmd = cmdInput;
        if (cmd === "add") {
            // --- ADD: prompt the user for item fields and add to wardrobe ---
            // Validates type and style inputs then constructs a ClothingItem (id placeholder 0)
            // and calls wardrobe.addItem inside a try/catch to handle DuplicateItemError.
            const name = await rl.question("** Enter item name: ");
            const typeInput = await rl.question("** Enter item type (top | bottom | shoes): ");
            if (typeInput !== "top" && typeInput !== "bottom" && typeInput !== "shoes") {
                console.log("Invalid item type. Please try again.");
                continue;
            }
            const type = typeInput;
            const color = await rl.question("** Enter item color: ");
            const styleInput = await rl.question("** Enter item style (casual | formal): ");
            if (styleInput !== "casual" && styleInput !== "formal") {
                console.log("Invalid style. Please try again.");
                continue;
            }
            const style = styleInput;
            const item = new ClothingItem(0, name, type, color, style);
            try {
                const addedId = wardrobe.addItem(item);
                console.log(`** Added item: ${name} id:${addedId}`);
            }
            catch (err) {
                if (err instanceof DuplicateItemError) {
                    console.error("Error: That item ID already exists, cannot add duplicate.");
                }
                else {
                    console.error("Unexpected error while adding item:", err);
                }
            }
        }
        else if (cmd === "remove") {
            // --- REMOVE: ask for numeric id, validate, and remove ---
            // Converts input to Number, validates, then calls wardrobe.removeItem inside try/catch
            // which handles ItemNotFoundError for clearer user feedback.
            const inputId = await rl.question("** Enter id of item you want to remove: ");
            const removeId = Number(inputId);
            if (Number.isNaN(removeId)) {
                console.log("Invalid ID entered; please enter a numeric ID.");
            }
            else {
                try {
                    const removedId = wardrobe.removeItem(removeId);
                    console.log(`** Removed item with id: ${removedId}`);
                }
                catch (err) {
                    if (err instanceof ItemNotFoundError) {
                        console.error(`Error: No item found with id ${removeId}.`);
                    }
                    else {
                        console.error("Unexpected error while removing item:", err);
                    }
                }
            }
        }
        else if (cmd === "list") {
            // --- LIST: print the flat list of items ---
            // Uses the wardrobe.listItems() convenience method to display items.v
            wardrobe.listItems();
        }
        else if (cmd === "save") {
            // --- SAVE: asynchronous persistence ---
            // Writes current wardrobe to 'wardrobe.json'. Uses await so the CLI waits for completion.
            await wardrobe.saveToFile("wardrobe.json");
            console.log("** Wardrobe saved.");
        }
        else if (cmd === "load") {
            // --- LOAD: asynchronous restore ---
            // Loads from 'wardrobe.json' and rebuilds in-memory structures (including category tree).
            await wardrobe.loadFromFile("wardrobe.json");
            console.log("** Wardrobe loaded.");
        }
        else if (cmd === "category") {
            // --- CATEGORY: show items by category ---
            // Prompts for style and/or type. If style only is provided, uses wardrobe.getItemsInCategory
            // which uses a recursive collector to gather items under the chosen category.
            const styleInput = await rl.question("** Enter style (casual | formal) or leave blank: ");
            const typeInput = await rl.question("** Enter type (top | bottom | shoes) or leave blank: ");
            // validate if provided
            if (styleInput && styleInput !== "casual" && styleInput !== "formal") {
                console.log("Invalid style.");
                continue;
            }
            if (typeInput && typeInput !== "top" && typeInput !== "bottom" && typeInput !== "shoes") {
                console.log("Invalid type.");
                continue;
            }
            let results = [];
            if (styleInput && typeInput) {
                // direct node, no recursion
                const node = wardrobe.findCategoryNode(styleInput, typeInput);
                results = node ? node.items : [];
            }
            else if (styleInput) {
                // recursive get all items under that style
                results = wardrobe.getItemsInCategory(styleInput);
            }
            else if (typeInput) {
                // type only: gather items from both styles
                for (const style of ["casual", "formal"]) {
                    const node = wardrobe.findCategoryNode(style, typeInput);
                    if (node) {
                        results = results.concat(node.items);
                    }
                }
            }
            else {
                console.log("Must provide style or type.");
                continue;
            }
            if (results.length === 0) {
                console.log("No items found in that category.");
            }
            else {
                console.log("Items in category:");
                for (const item of results) {
                    console.log(`- ID: ${item.id} | ${item.name} | ${item.itemType} | ${item.color} | ${item.style}`);
                }
            }
        }
        else if (cmd === "suggest") {
            // --- SUGGEST: random outfit by style ---
            // Prompts for 'casual' or 'formal', filters wardrobe items for that style and each
            // type (top/bottom/shoes), then picks a random element from each list to form an outfit.
            const styleInput = await rl.question("** Enter style for outfit (casual | formal): ");
            if (styleInput !== "casual" && styleInput !== "formal") {
                console.log("Invalid style choice.");
            }
            else {
                const outfit = wardrobe.getRandomOutfitByStyle(styleInput);
                console.log("** Here’s a suggested outfit:");
                console.log(`** Top: ${outfit.top?.name ?? "none"}`);
                console.log(`** Bottom: ${outfit.bottom?.name ?? "none"}`);
                console.log(`** Shoes: ${outfit.shoes?.name ?? "none"}`);
            }
        }
        else if (cmd === "exit") {
            // --- EXIT: close the readline interface and end the program ---
            console.log("** Exiting Wardrobe Manager. Thank you!                      **");
            console.log("**-----------------------------------------------------------**");
            rl.close();
            break;
        }
    }
}
// Run the main CLI loop and log any unexpected top-level errors.
main().catch(err => console.error(err));
