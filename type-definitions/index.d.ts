import {Stream} from 'most';

export interface DispatchStream<A, B> extends Stream<[A, (key: B) => Stream<A>]> {
  select(key: B): Stream<A>;
}

export function dispatch<A, B>(f: (a: A) => B): (stream: Stream<A>) => DispatchStream<A, B>;
export function dispatch<A, B>(f: (a: A) => B, stream: Stream<A>): DispatchStream<A, B>;
