'use strict'

const React = require('react')

const connect = (component, actionCreator, initialState)  => {
  const attach = instance => ({
    set: fn => new Promise(resolve => instance.setState(fn, resolve)),
    get: () => instance.state
  })

  return class Connected extends React.PureComponent {
    constructor(props, context) {
      super(props, context)

      this.state = initialState
      this.actions = actionCreator(attach(this))
    }

    render() {
      return React.createElement(component, Object.assign({}, this.props, this.actions, this.state))
    }
  }
}

const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({type}, params)))

module.exports.connect = connect
module.exports.createDispatcher = createDispatcher
