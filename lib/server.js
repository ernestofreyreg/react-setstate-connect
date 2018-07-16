"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var serverState = function serverState(_ref) {
  var initialState = _ref.initialState,
      reducer = _ref.reducer,
      createActions = _ref.createActions;

  var state = initialState;

  var getState = function getState() {
    return Object.assign({}, state, actions);
  };
  var dispatch = function dispatch(type, params) {
    state = reducer(state, Object.assign({ type: type }, params));
    return Promise.resolve(undefined);
  };

  var actions = createActions({ getState: getState, dispatch: dispatch });

  return {
    getState: getState,
    dispatch: dispatch,
    actions: actions
  };
};

exports.default = serverState;