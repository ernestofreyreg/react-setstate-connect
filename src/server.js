// @flow

import type { StateManager } from './index.js'

const serverState = (stateManager: StateManager) => {
  let state = stateManager.initialState || {}

  const getState = () => Object.assign({}, state, actions)
  const dispatch = (type: string, params?: Object) => {
    state = stateManager.reducer(state, Object.assign({ type }, params))
    return Promise.resolve(this)
  }

  const actions = stateManager.createActions({ getState, dispatch })

  return {
    getState,
    dispatch,
    actions
  }
}

export default serverState
