export class Store {
  constructor() {
    this.items = new Map();
  }

  add(key, item) {
    const isFirst = this.items.size === 0;
    let items = this.items.get(key);
    if(items === void 0) {
      items = new Set();
      this.items.set(key, items);
    }
    items.add(item);
    return isFirst;
  }

  remove(key, item) {
    const items = this.items.get(key);
    if(items) {
      items.delete(item);
      if(items.size === 0) {
        this.items.delete(key);
      }
    }
    return this.items.size;
  }

  get(key) {
    return (this.items.get(key) || [])[Symbol.iterator]();
  }

  [Symbol.iterator]() {
    return this._iterate();
  }

  *_iterate() {
    for(let sinks of this.items.values()) {
      for(let sink of sinks) {
        yield sink;
      }
    }
  }
}
