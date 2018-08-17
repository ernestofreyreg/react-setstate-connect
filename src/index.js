// @flow

import * as React from 'react'

export type Reducer = (state: Object, action: { type: string, [string]: mixed }) => Object
export type ActionCall = () => mixed
export type GetStateCall = () => Object
export type DispatchCall = (type: string, payload?: Object) => mixed
export type ActionSet = { [string]: Function }
export type ActionParams = { getState: GetStateCall, dispatch: DispatchCall }
export type ActionsCreator = (ActionParams) => ActionSet
export type StateManager = {
  initialState: Object | void,
  reducer: Reducer,
  createActions: ActionsCreator,
  collect: ?boolean
}

const mergeAll = (arr) => arr.reduce((prev, item) => Object.assign(prev, item), {})

const connect = (
  component: React.ComponentType<any>,
  stateManager: StateManager
):React.ComponentType<any> => {
  const attach = (instance):ActionParams => ({
    getState: () => instance.state || {},
    dispatch: createDispatcher(stateManager.reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
  })

  const createDispatcher = (reducer, set) => (type, params = {}) => set(state => reducer(state, Object.assign({ type }, params)))

  return class Connected extends React.PureComponent<*, *> {
    actions: ActionSet

    constructor (props) {
      super(props)

      this.state = (stateManager.collect)
        ? mergeAll([stateManager.initialState || {}, props])
        : stateManager.initialState || {}

      this.actions = stateManager.createActions(attach(this))
    }

    render () {
      return React.createElement(component, mergeAll([this.props, this.actions, this.state]))
    }
  }
}

export default connect
