export const dispose = disposable => disposable.dispose();

export const emptyDisposable = {
  dispose() {}
};

export class DispatchDisposable {
  constructor(source, sink, key) {
    this.source = source;
    this.sink = sink;
    this.key = key;
    this.disposed = false;
  }

  dispose() {
    if(this.disposed) {
      return;
    }
    this.disposed = true;
    const remaining = this.source.remove(this.key, this.sink);
    return remaining === 0 && this.source._dispose(); // eslint-disable-line no-underscore-dangle
  }
}