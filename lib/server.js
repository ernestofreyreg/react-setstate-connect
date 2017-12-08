"use strict";

module.exports = function (_ref) {
  var initialState = _ref.initialState,
      reducer = _ref.reducer,
      createActions = _ref.createActions;

  var state = initialState;

  var getState = function getState() {
    return state;
  };
  var dispatch = function dispatch(type, params) {
    state = reducer(state, Object.assign({ type: type }, params));
    return state;
  };

  return createActions({ getState: getState, dispatch: dispatch });
};