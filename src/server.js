const serverState = ({ initialState, reducer, createActions }) => {
  let state = initialState

  const getState = () => Object.assign({}, state, actions)
  const dispatch = (type, params) => {
    state = reducer(state, Object.assign({ type }, params))
    return Promise.resolve(this)
  }

  const actions = createActions({ getState, dispatch })

  return {
    getState,
    dispatch,
    actions
  }
}

export default serverState
