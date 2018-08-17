'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


var serverState = function serverState(stateManager) {
  var state = stateManager.initialState || {};

  var getState = function getState() {
    return Object.assign({}, state, actions);
  };
  var dispatch = function dispatch(type, params) {
    state = stateManager.reducer(state, Object.assign({ type: type }, params));
    return Promise.resolve(undefined);
  };

  var actions = stateManager.createActions({ getState: getState, dispatch: dispatch });

  return {
    getState: getState,
    dispatch: dispatch,
    actions: actions
  };
};

exports.default = serverState;