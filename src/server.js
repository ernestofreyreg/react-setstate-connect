const serverState = ({ initialState, reducer, createActions }) => {
  let state = initialState

  const getState = () => ({ ...state, ...actions })
  const dispatch = (type, params) => {
    state = reducer(state, { type, ...params })
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
