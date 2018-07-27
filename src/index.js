import React from 'react'

const mergeAll = arr => arr.reduce((prev, item) => Object.assign(prev, item), {})

const attach = (instance, reducer) => {
  const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({ type }, params)))

  return ({
    getState: () => instance.state,
    dispatch: createDispatcher(reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
  })
}

const connect = (component, { reducer, createActions, initialState }) => {
  const StateContext = (typeof(component) === 'string') ? React.createContext() : null

  class Connected extends React.PureComponent {
    constructor (props) {
      super(props)
      this.state = mergeAll([initialState || {}, props])
      this.actions = createActions(attach(this, reducer))
    }

    render () {
      const value = mergeAll([this.props, this.actions, this.state])

      if (StateContext) {
        return (
          <StateContext.Provider value={value}>
            {this.props.children}
          </StateContext.Provider>
        )
      }

      return React.createElement(component, value)
    }
  }

  if (!StateContext) {
    return Connected
  }

  return {
    [`${name}Provider`]: Connected,
    [`${name}Consumer`]: StateContext.Consumer
  }
}

export default connect
