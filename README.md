# Dispatch - A selective multicast operator for Most.js

[![Build Status](https://travis-ci.org/axefrog/most-dispatch.svg?branch=master)](https://travis-ci.org/axefrog/most-dispatch)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cujojs/most)

This operator works like a mail room operation. If only a small number of packages and letters are received in a given time period and there are only a small number of potential recipients, it's usually ok to just stick the letters and packages on a shelf and let people come by and pick things up themselves. The same is true of a primary event stream being filtered by a number of downstream consumers.

As the number of inbound items and the number of potential recipients increases however, a more efficient approach starts to become necessary. Instead of having thousands of people crowd into the mail room and independently sift through all of the mail to find envelopes and packages for which they are the intended recipient- a process which would be horribly inefficient- a mail room operation sorts through the mail efficiently and dispatches each item to the intended recipients.

## Installation

```
npm install --save most-dispatch
```

## Usage

The dispatch operator is initialized with a selector function, which takes an event as input and returns a key identifying an event recipient. The dispatch function then returns a function that takes a stream and returns a stream, as is the case for most other operators.

```js
const dispatchEvents = dispatch(event => event.xyz);
const dispatcherStream = dispatchEvents(eventStream); // or eventStream.thru(dispatchEvents)
```

The stream returned by the dispatch operator emits events that it receives as-is, but as a tuple coupled with a `select` function. The `select` function takes a key as input and returns a stream of events pre-filtered to those which match the specified key.

```js
dispatcherStream.tap(([event, select]) => {
  assert('xyz' in event);
  assert(typeof select === 'function');
  assert(select('foo') instanceof most.Stream);
})
```

When a `select` stream is run, the dispatch source adds the resulting sink to a register of keys mapped to lists of sinks. When new events arrive at the dispatch source, in addition to re-emitting them as a tuple, as described above, the key selector function is run to map the event to a specific key. The event is then passed directly to any matching sinks that originated via a call to the `select` function using that same key.

In this way, instead of having a thousand streams filtering a single multicasted source stream potentially hundreds of times per second, a single pre-emptive filtering operation occurs within the dispatch source, and consuming streams need only wait for the events for which they have registered interest via their specified key. Consuming streams can be created and processed by watching the primary dispatch stream, usually via an accumulating operator such as `scan` or `loop`. When an event is received that does not match any known recipient, the accompanying `select` function can be called, passing in the related key, and the returned stream can then be applied as needed to efficiently process those events from then on.

## Example

This example builds an immutable map of streams as events are received, keyed by the id of the event. Actually running those streams is an exercise left to the reader. 

```js
import Immutable from 'immutable';
import dispatch from 'most-dispatch';

function buildList(event$) {
  return event$
    .thru(dispatch(event => event.id))
    .scan((map, [event, select]) => {
      const stream = select(event.id).startWith(event);
      return map.has(event.id) ? map : map.set(event.id, stream);
    }, Immutable.OrderedMap)
    .skipRepeatsWith(Immutable.is);
}
```
