'use strict'

const React = require('react')

const connect = (component, reducer, actionsCreator, initialState) => {
  const attach = instance => ({
    getState: () => instance.state,
    dispatch: createDispatcher(reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
  })

  return class Connected extends React.PureComponent {
    constructor (props, context) {
      super(props, context)

      this.state = initialState
      this.actions = actionsCreator(attach(this))
    }

    render () {
      return React.createElement(component, Object.assign({}, this.props, this.actions, this.state))
    }
  }
}

const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({type}, params)))

module.exports = connect
