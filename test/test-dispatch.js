const assert = require('power-assert');
const {dispatch} = require('../src');
const {Empty, empty, withItems, periodic, filter, merge, loop, map, join} = require('@most/core');
const {reduce} = require('./helpers/reduce');

function from(inputs) {
  return withItems(inputs)(periodic(0));
}

describe('[most-dispatch]', () => {
  describe('dispatch()', () => {
    it('returns a new function', () => {
      const d = dispatch(x => x);
      assert(typeof d === 'function');
    });
  });

  describe('the configured function', () => {
    it('takes a stream and returns a stream', () => {
      const d = dispatch(x => x);
      const a$ = empty();
      const b$ = d(a$);

      assert("run" in b$);
    });

    const arraySink = () => {
      const result = [];
      return {
        error: (t, err) => undefined,
        event: (t, evt) => console.log(evt) && result.push(evt),
        end: (t) => undefined,
        result
      };
    };
    it('emits the input values combined as a tuple with a selector function', () => {
      const d = dispatch(x => x);
      const inputs = [3, 5, 7];
      const a$ = from(inputs);
      const b$ = d(a$);
      return reduce((arr, x) => (arr.push(x), arr), [], b$)
        .then(values => {
          assert(values.length === 3);
          values.forEach((v, i) => {
            assert(Array.isArray(v))
            assert(v.length === 2);
            assert(v[0] === inputs[i]);
            assert(typeof v[1] === 'function');
          });
        });
    });

    it('dispatches values according to the selector function argument on the main stream', () => {
      const d = dispatch(x => x.a);
      const inputs = [
        {a: 3, b: 100},
        {a: 5, b: 101},
        {a: 7, b: 102},
        {a: 5, b: 103},
        {a: 3, b: 104},
        {a: 3, b: 105},
        {a: 5, b: 106}
      ];
      const a$ = from(inputs);
      const b$ = d(a$);
      const c$ = map(x => ({p: x.b}), b$.select(3));
      const d$ = map(x => ({q: x.b}), b$.select(5));
      const e$ = merge(c$, d$);
      return reduce((arr, x) => (arr.push(x), arr), [], e$)
        .then(values => {
          assert.deepEqual(values, [
            {p: 100},
            {q: 101},
            {q: 103},
            {p: 104},
            {p: 105},
            {q: 106}
          ]);
        });
    });

    it('dispatches values according to the selector function argument called via the tuple function', () => {
      const d = dispatch(x => x.a);
      const inputs = [
        {a: 3, b: 100},
        {a: 5, b: 101},
        {a: 7, b: 102},
        {a: 5, b: 103},
        {a: 3, b: 104},
        {a: 3, b: 105},
        {a: 5, b: 106}
      ];

      const a$ = from(inputs);

      const b$ = loop((seed, [{a, b}, select]) => {
        let stream = seed.get(a);
        const value = stream
          ? null
          : (seed.set(a, stream = map(x => [a, b, x.b], select(a))), stream);
        return {seed, value};
      }, new Map(), d(a$));

      const c$ = join(filter(x => x, b$));

      return reduce((arr, x) => (arr.push(x), arr), [], c$)
        .then(values => {
          assert.deepEqual(values, [
            [3, 100, 100],
            [5, 101, 101],
            [7, 102, 102],
            [5, 101, 103],
            [3, 100, 104],
            [3, 100, 105],
            [5, 101, 106]
          ]);
        });
    });
  });
});
