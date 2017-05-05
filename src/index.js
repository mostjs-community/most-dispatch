/*
  # Dispatch: a selective multicast operator for efficient delegation of events to large numbers of subscribers

  `f`:     A selector function that takes the inbound event as input and returns a key identifying the event target.
           If not supplied, `f` defaults to an identity function, i.e. x => x
*/

import DispatchSource from './source';

function dispatch(f, stream) {
  const dispatcher = function(stream) {
    if(stream.source instanceof DispatchSource && stream.source.f === f) {
      return stream;
    }
    const source = new DispatchSource(stream, f);
    const newStream = new stream.constructor(source);
    newStream.select = key => source.select(key);
    return newStream;
  };
  return stream ? dispatcher(stream) : dispatcher;
}

export {dispatch};
