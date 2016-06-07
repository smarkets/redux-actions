'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = handleAction;
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

function handleAction(type, reducers, defaultState) {
  var typeValue = isFunction(type) ? type.toString() : type;

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultState : arguments[0];
    var action = arguments[1];

    // If action type does not match, return previous state
    if (action.type !== typeValue) return state;

    var handlerKey = getHandlerKey(action);

    // If function is passed instead of map, use as reducer
    if (isFunction(reducers)) {
      reducers.next = reducers.throw = reducers;
    }

    // Otherwise, assume an action map was passed
    var reducer = reducers[handlerKey];

    return isFunction(reducer) ? reducer(state, action) : state;
  };
}