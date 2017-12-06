const React = require('react')
const deepmerge = require('deepmerge')

const connect = (component, ...params) => {
  const createConnection = (reducer, createActions, initialState, collect) => {
    const attach = instance => ({
      getState: () => instance.state,
      dispatch: createDispatcher(reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
    })

    const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({type}, params)))

    class Connected extends React.PureComponent {
      constructor (props, context) {
        super(props, context)

        this.state = collect
          ? deepmerge.all([initialState || {}, props])
          : initialState || {}
        this.actions = createActions(attach(this))
      }

      componentWillReceiveProps (nextProps) {
        if (collect) {
          this.setState(state => deepmerge.all([state, nextProps]))
        }
      }

      render () {
        return React.createElement(component, deepmerge.all([this.props, this.actions, this.state]))
      }
    }

    return Connected
  }

  if (typeof params[0] === 'function') {
    const [reducer, createActions, initialState, collect = false] = params
    return createConnection(reducer, createActions, initialState, collect)
  }

  const stateHandlers = params[0]

  if (typeof stateHandlers === 'object' && params.length === 1 &&
    stateHandlers.hasOwnProperty('reducer') &&
    stateHandlers.hasOwnProperty('createActions') &&
    stateHandlers.hasOwnProperty('initialState')
  ) {
    const {reducer, createActions, initialState, collect = false} = stateHandlers
    return createConnection(reducer, createActions, initialState, collect)
  }

  const reducer = (state, action) => Object.keys(stateHandlers).reduce(
    (prev, key) => ({...prev, [key]: stateHandlers[key].reducer(state[key], action)}),
    {}
  )

  const createActions = ({getState, dispatch}) => {
    const getPartialState = key => () => getState()[key]

    return Object.keys(stateHandlers).reduce(
      (prev, key) => ({...prev, [key]: stateHandlers[key].createActions({getState: getPartialState(key), dispatch})}),
      {}
    )
  }

  const initialState = Object.keys(stateHandlers).reduce(
    (prev, key) => ({...prev, [key]: stateHandlers[key].initialState}),
    {}
  )

  const collect = params.length > 1 && params[1]

  return createConnection(reducer, createActions, initialState, collect)
}

module.exports = connect
