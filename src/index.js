import React from 'react'

const mergeAll = arr => arr.reduce((prev, item) => Object.assign(prev, item), {})

const connect = (component, { reducer, createActions, initialState, collect = false }) => {
  const attach = instance => ({
    getState: () => instance.state,
    dispatch: createDispatcher(reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
  })

  const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({ type }, params)))

  return class Connected extends React.PureComponent {
    constructor (props) {
      super(props)

      this.state = collect
        ? mergeAll([initialState || {}, props])
        : initialState || {}
      this.actions = createActions(attach(this))
    }

    render () {
      return React.createElement(component, mergeAll([this.props, this.actions, this.state]))
    }
  }
}

export default connect
