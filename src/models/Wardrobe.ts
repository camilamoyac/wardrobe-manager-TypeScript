//Wardrobe class

import { ClothingItem } from "./ClothingItem";
import { ItemNotFoundError, DuplicateItemError } from "./Errors";

export class Wardrobe {
    private items : ClothingItem[] = []; //list of clothing items

    //methods
    //adds a clothing item to the list(array)
    addItem(item : ClothingItem){ 
        if (this.items.some(i => i.id === item.id)){
            throw new DuplicateItemError(`Item with id ${item.id} already exists.`)
        }
        this.items.push(item);
    }

    //removes a clothing item from the array
    removeItem(id : number) { 
        const index = this.items.findIndex(i => i.id === id); 
        if (index === -1){
            throw new ItemNotFoundError(`Item with id %{id} not found.`);
        }
        this.items.splice(index, 1);
    }

    //prints the list of items in the wardrobe
    listItems(){
        console.log(this.items);
    }

}