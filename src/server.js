const serverState = ({ initialState, reducer, createActions }) => {
  let state = initialState

  const getState = () => state
  const dispatch = (type, params) => {
    state = reducer(state, Object.assign({type}, params))
    return Promise.resolve(state)
  }

  return createActions({getState, dispatch})
}

export default serverState
