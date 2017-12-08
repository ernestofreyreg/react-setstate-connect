module.exports = ({initialState, reducer, createActions}) => {
  let state = initialState

  const getState = () => state
  const dispatch = (type, params) => {
    state = reducer(state, Object.assign({type}, params))
    return state
  }

  return createActions({getState, dispatch})
}
