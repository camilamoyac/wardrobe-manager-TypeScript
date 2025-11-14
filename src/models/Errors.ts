export class DuplicateItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateItemError";
  }
}

export class ItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemNotFoundError";
  }
}