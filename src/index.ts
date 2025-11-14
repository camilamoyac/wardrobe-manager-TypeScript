//Console App

import * as readline from "node:readline/promises";
import{stdin as input, stdout as output} from "process";

import { Wardrobe } from "./models/Wardrobe.js";
import { ClothingItem } from "./models/ClothingItem.js";
import { ItemType, Style } from "./models/ClothingItem.js";
import { ItemNotFoundError, DuplicateItemError } from "./models/Errors.js";
import { run } from "node:test";

type Command = "add" | "remove" | "list" | "save" | "load" | "exit";

async function main() {
    const rl = readline.createInterface({ input, output});
    const wardrobe = new Wardrobe();
    
    console.log("******---------------------------------------------------******");
    console.log("**           Welcome to your Wardrobe Manager!               **");
    console.log("** COMMANDS                                                  **");
    console.log("** add: add a clothing item to your wardrobe                 **");
    console.log("** remove: remove a clothing item to your wardrobe           **");
    console.log("** list: show all items in your wardrobe                     **");
    console.log("** save: save wardrobe to file                               **");
    console.log("** load: load wardrobe from file                             **");
    console.log("** exit: exit your wardrobe                                  **");
    console.log("**-----------------------------------------------------------**");

    while (true){
        const line = await rl.question("** Enter command >> ");
        const parts = line.trim().split(" ");
        const cmdInput = parts[0].toLowerCase();

        if (!["add", "remove", "list", "save", "load", "exit"].includes(cmdInput)){
            console.log(`Unrecognized command: ${cmdInput}.`);
            console.log(`You must type a valid command (add | remove | list | save | load | exit)`);
            continue;
        }

        const cmd = cmdInput as Command;

        // try{
            if (cmd === "add"){
                const name = await rl.question("** Enter item name: ");
                const type = await rl.question("** Enter item type (top | bottom | shoes | accessory): ") as ItemType;
                const color = await rl.question("** Enter item color: ");
                const style = await rl.question("** Enter item style (casual | formal | sport): ") as Style;
                
                const item = new ClothingItem(0, name, type, color, style);
                let addedId = wardrobe.addItem(item);
                console.log(`** Added item: ${name} id:${addedId}`);
            }
            else if (cmd === "remove"){
                const inputId = await rl.question("** Enter id of item you want to remove: ");
                
                const removeId = Number(inputId);
                let removedId = wardrobe.removeItem(removeId);
                console.log(`** Removed item with id: ${removedId}`);
            }
            else if (cmd === "list"){
                wardrobe.listItems();
            }
            else if (cmd === "save") {
                await wardrobe.saveToFile("wardrobe.json");
                console.log("** Wardrobe saved.");
            }
            else if (cmd === "load") {
                await wardrobe.loadFromFile("wardrobe.json");
                console.log("** Wardrobe loaded.");
            }
            else if (cmd === "exit"){
                console.log("** Exiting Wardrobe Manager. Thank you!                      **");
                console.log("**-----------------------------------------------------------**");
                rl.close();
                break;
            }
        // }
    }

}

main().catch(err => console.error(err));