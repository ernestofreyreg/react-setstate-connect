import React from 'react'

const connect = (
  component,
  {
    initialState,
    reducer,
    createActions
  }
) => {
  const attach = (instance) => ({
    getState: () => instance.state,
    dispatch: createDispatcher(reducer, reducerCall => new Promise(resolve => instance.setState(reducerCall, resolve)))
  })

  const createDispatcher = (reducer, set) => (type, params) => set(state => reducer(state, Object.assign({ type }, params || {})))

  return class Connected extends React.Component {
    constructor (props) {
      super(props)

      this.state = Object.assign({}, initialState, props)
      this.actions = createActions(attach(this))
    }

    render () {
      return React.createElement(
        component,
        Object.assign({}, this.state, this.actions)
      )
    }
  }
}

export default connect
