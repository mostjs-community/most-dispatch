export class Pipe {
  constructor(sink) {
    this.sink = sink;
  }

  event(t, x) {
    return this.sink.event(t, x);
  }

  end(t) {
    return this.sink.end(t);
  }

  error(t, e) {
    return this.sink.error(t, e);
  }
}
