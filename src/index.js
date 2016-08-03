/*
  # Dispatch: a selective multicast operator for efficient delegation of events to large numbers of subscribers

  `f`:     A selector function that takes the inbound event as input and returns a key identifying the event target.
           If not supplied, `f` defaults to an identity function, i.e. x => x
  
  `store`: A subscriber store implementation. The default implementation uses plain javascript objects for tracking
           subscribers, so keys are only differentiated as far as is possible with plain JavaScript object keys. For
           keys that need to be differentiated on more complex criteria, such as Immutable.is(a, b), an appropriate
           store implementation should be provided.
*/

import DispatchSource from './source';

export default function dispatch(f, store) {
  return function(stream) {
    if(stream.source instanceof DispatchSource && stream.source.f === f) {
      return stream;
    }
    const source = new DispatchSource(stream, f, store);
    const newStream = new stream.constructor(source);
    newStream.select = key => source.select(key);
    return newStream;
  };
}
