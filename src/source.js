const {newStream} = require('@most/core');

import {Pipe} from './pipe';
import {DispatchDisposable, emptyDisposable, dispose} from './dispose';
import {Store} from './store';
import {tryEvent, tryEnd} from './try';

const defaultKey = Symbol('DispatchSource');
const identity = x => x;

export default class DispatchSource {
  constructor(stream, f = identity) {
    this.stream = stream;
    this.f = f;
    this._store = new Store();
    this._disposable = emptyDisposable;
    this._boundSelect = key => this.select(key);
  }

  _dispose() {
    const disposable = this._disposable;
    this._disposable = emptyDisposable;
    return Promise.resolve(disposable).then(dispose);
  }

  run(sink, scheduler) {
    return this.add(sink, scheduler, defaultKey);
  }

  event(t, x) {
    const key = this.f(x);
    event(this._store.get(defaultKey), t, wrap(x, this._boundSelect));
    event(this._store.get(key), t, x);
  }

  end(t, x) {
    end(this._store[Symbol.iterator](), t, x);
  }

  error(t, e) {
    error(this._store[Symbol.iterator](), t, e);
  }

  select(key, initial) {
    const source = new TargetSource(this, key);
    return newStream(source.run.bind(source));
  }

  add(sink, scheduler, key) {
    if(this._store.add(key, sink)) {
      this._disposable = this.stream.run(this, scheduler);
    }
    return new DispatchDisposable(this, sink, key);
  }

  remove(key, sink) {
    this._store.remove(key, sink);
  }
}

function wrap(event, select) {
  return [event, select];
}

function event(it, t, x) {
  for(let sink of it) {
    tryEvent(t, x, sink);
  }
}

function end(it, t, x) {
  for(let sink of it) {
    tryEnd(t, x, sink);
  }
}

function error(it, t, e) {
  for(let sink of it) {
    sink.error(t, e);
  }
}

class TargetSource {
  constructor(source, key) {
    this.key = key;
    this.source = source;
  }

  run(sink, scheduler) {
    return this.source.add(new Pipe(sink), scheduler, this.key);
  }
}
