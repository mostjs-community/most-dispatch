# Dispatch - A selective multicast operator for Most.js

[![Build Status](https://travis-ci.org/axefrog/most-dispatch.svg?branch=master)](https://travis-ci.org/axefrog/most-dispatch)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cujojs/most)

One scenario you may have to deal with when writing an application using streams is that of a single "firehose" source stream that emits events or data intended only for a tiny subset of targets that are potentially consuming that stream. If there are a very large number of derivative streams filtering the source stream to extract data relevant to themselves, then every single one of those streams will have to execute their filter against every inbound event. This means O(N) performance, which could be an issue as the number of consuming streams grows, and particularly if there is high throughput on the source stream. 

The dispatch operator provides a way for derivative streams to subscribe only to events relevant to themselves. While `multicast` keeps tracks of all consuming streams and publishes inbound events to all of them, `dispatch` consumers add themselves with an identifying key, and the dispatch source then publishes events only to consumers registered under the key matching the inbound event.

## Installation

```
npm install --save most-dispatch
```

## Usage

`dispatch` takes a key selector function and returns a function which takes a stream and returns a stream. Because of this, it can be used as a simple function, or fluently using `thru()`.

The primary stream returned by `dispatch` emits a stream of tuples; the first value of each tuple is the event passed through as-is, and the second is a `select` function, which is also accessible directly from the dispatch stream, if desired.

The `select` function takes a key and returns a pre-filtered version of the original event stream, containing only those events that match the selector function provided to the `dispatch()` function.

## Example

This example builds an immutable map of streams as events are received, keyed by the id of the event.

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
