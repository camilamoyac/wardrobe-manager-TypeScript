//Error thrown when trying to add a duplicate item (by id) to the wardrobe.
//Extends the built-in Error class.
export class DuplicateItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateItemError";
  }
}

//Error thrown when trying to remove or find an item that does not exist in the wardrobe.
//Extends the built-in Error class.
export class ItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemNotFoundError";
  }
}