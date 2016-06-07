import { handleAction, createAction } from '../';

describe('handleAction()', () => {
  const type = 'TYPE';
  const prevState = { counter: 3 };

  describe('single handler form', () => {
    describe('resulting reducer', () => {
      it('returns previous state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', () => null);
        expect(reducer(prevState, { type })).to.equal(prevState);
      });

      it('returns default state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', () => null, { counter: 7 });
        expect(reducer(undefined, { type }))
          .to.deep.equal({
            counter: 7
          });
      });

      it('accepts single function as handler', () => {
        const reducer = handleAction(type, (state, action) => ({
          ...state,
          counter: state.counter + action.payload
        }));
        expect(reducer(prevState, { type, payload: 7 }))
          .to.eql({
            counter: 10
          });
      });

      it('accepts action function as action type', () => {
        const incrementAction = createAction(type);
        const reducer = handleAction(incrementAction, (state, action) => ({
          counter: state.counter + action.payload
        }));

        expect(reducer(prevState, incrementAction(7)))
          .to.deep.equal({
            counter: 10
          });
      });

      it('accepts single function as handler and a default state', () => {
        const reducer = handleAction(type, (state, action) => ({
          counter: state.counter + action.payload
        }), { counter: 3 });
        expect(reducer(undefined, { type, payload: 7 }))
          .to.deep.equal({
            counter: 10
          });
      });
    });
  });

  describe('map of handlers form', () => {
    describe('resulting reducer', () => {
      it('returns previous state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', { next: () => null });
        expect(reducer(prevState, { type })).to.equal(prevState);
      });

      it('uses `start()` if action signals start of action sequence', () => {
        const reducer = handleAction(type, {
          start: (state, action) => ({
            ...state,
            pending: [...state.pending, action.sequence.id]
          })
        });
        const initialState = { counter: 3, pending: [] };
        const action = { type, sequence: { type: 'start', id: 123 } };
        expect(reducer(initialState, action))
          .to.eql({
            counter: 3,
            pending: [123]
          });
      });

      it('uses `next()` if action does not represent an error', () => {
        const reducer = handleAction(type, {
          next: (state, action) => ({
            ...state,
            counter: state.counter + action.payload
          })
        });
        expect(reducer(prevState, { type, payload: 7 }))
          .to.eql({
            counter: 10
          });
      });

      it('uses `throw()` if action represents an error', () => {
        const reducer = handleAction(type, {
          throw: (state, action) => ({
            ...state,
            counter: state.counter + action.payload
          })
        });
        expect(reducer(prevState, { type, payload: 7, error: true }))
          .to.eql({
            counter: 10
          });
      });

      it('uses `complete()` if action signals end of action sequence', () => {
        const reducer = handleAction(type, {
          complete: (state, action) => ({
            ...state,
            pending: state.pending.filter(id => id !== action.sequence.id)
          })
        });
        const initialState = { counter: 3, pending: [123, 456, 789] };
        const action = { type, sequence: { type: 'complete', id: 123 } };
        expect(reducer(initialState, action))
          .to.eql({
            counter: 3,
            pending: [456, 789]
          });
      });

      it('returns previous state if matching handler is not function', () => {
        const reducer = handleAction(type, { next: null, error: 123 });
        expect(reducer(prevState, { type, payload: 123 })).to.equal(prevState);
        expect(reducer(prevState, { type, payload: 123, error: true }))
          .to.equal(prevState);
      });
    });
  });
});
