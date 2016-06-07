'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAction;
function identity(t) {
  return t;
}

function createAction(type, actionCreator, metaCreator) {
  var finalActionCreator = typeof actionCreator === 'function' ? actionCreator : identity;
  var actionHandler = function actionHandler() {
    var action = {
      type: type
    };

    var payload = finalActionCreator.apply(undefined, arguments);
    if (!(payload === null || payload === undefined)) {
      action.payload = payload;
    }

    if (action.payload instanceof Error) {
      // Handle FSA errors where the payload is an Error object. Set error.
      action.error = true;
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator.apply(undefined, arguments);
    }

    return action;
  };

  actionHandler.toString = function () {
    return type;
  };

  return actionHandler;
}