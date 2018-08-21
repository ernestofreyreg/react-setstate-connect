// @flow

import type { StateManager, DispatchCall, ActionSet } from './index.js'

export type Server<S, A: $Shape<ActionSet>> = {
  getState: () => S,
  dispatch: DispatchCall,
  actions: A
}

const serverState = <S, A>(stateManager: StateManager<S, A>): Server<S, A> => {
  let state = stateManager.initialState

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
