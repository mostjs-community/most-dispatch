export function isEmptyObject(obj) { 
  for(var x in obj) { // eslint-disable-line no-unused-vars
    return false;
  }
  return true;
}

export class BasicStore
{
  constructor() {
    this.items = {};
  }

  add(key, item) {
    const items = (this.items[key] || (this.items[key] = []));
    const isFirst = isEmptyObject(this.items);
    items.push(item);
    return isFirst;
  }

  remove(key, item) {
    const items = this.items[key];
    if(items) {
      const index = items.indexOf(item);
      if(index > -1) {
        items.splice(index, 1);
      }
      if(items.length === 0) {
        delete this.items[key];
      }
    }
    return Object.keys(this.items).length;
  }

  get(key) {
    return (this.items[key] || [])[Symbol.iterator]();
  }

  [Symbol.iterator]() {
    return this._iterate();
  }

  *_iterate() {
    for(let key in this.items) {
      for(let sink of this.items[key]) {
        yield sink;
      }
    }
  }
}

/*
  # Example alternate store implementation using Immutable.js

  const Immutable = require('Immutable');

  export class ImmutableStore
  {
    constructor() {
      this.items = Immutable.Map();
    }

    add(key, item) {
      let exists = this.items.size > 0;
      this.items = this.items.update(key, Immutable.List(),
        items => items.push(item));
      return !exists;
    }

    remove(key, item) {
      const items = this.items.update(key, Immutable.List(), c => {
        const index = c.indexOf(item);
        return index === -1 ? c : c.delete(index);
      });
      this.items = items.get(key).size === 0 ? items.remove(key) : items;
      return this.items.size;
    }

    get(key) {
      return this.items.get(key, Immutable.Set()).values();
    }

    count(key) {
      return this.items.get(key, Immutable.Set()).size;
    }

    [Symbol.iterator]() {
      return this.items.valueSeq().flatMap(item => item.valueSeq()).values();
    }
  }

*/