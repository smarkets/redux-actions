function isFunction(val) {
  return typeof val === 'function';
}

function inArray(array, val) {
  return array.indexOf(val) !== -1;
}

function getHandlerKey(action) {
  if (action.error === true) return 'error';

  if (action.sequence && inArray(['start', 'complete'], action.sequence.type)) {
    return action.sequence.type;
  }

  return 'next';
}

export default function handleAction(type, reducers, defaultState) {
  const typeValue = isFunction(type)
    ? type.toString()
    : type;

  return (state = defaultState, action) => {
    // If action type does not match, return previous state
    if (action.type !== typeValue) return state;

    const handlerKey = getHandlerKey(action);

    // If function is passed instead of map, use as reducer
    if (isFunction(reducers)) {
      reducers.next = reducers.throw = reducers;
    }

    // Otherwise, assume an action map was passed
    const reducer = reducers[handlerKey];

    return isFunction(reducer)
      ? reducer(state, action)
      : state;
  };
}