// @flow

import * as React from 'react'

export type Reducer<S, T> = (state: S, action: { type: T, [string]: mixed }) => S
export type ActionCall = () => mixed
export type GetStateCall<S> = () => S
export type DispatchCall<T> = (type: T, payload?: Object) => Promise<any>
export type ActionSet = { [string]: Function }
export type ActionParams<S, T> = { getState: GetStateCall<S>, dispatch: DispatchCall<T> }
export type StateManager<S, A, T> = {
  initialState: S,
  reducer: Reducer<S, T>,
  createActions: (ActionParams<S, T>) => A,
  collect: ?boolean
}

const mergeAll = (arr) => arr.reduce((prev, item) => Object.assign(prev, item), {})

const connect<S, A> = (
  component: React.ComponentType<any>,
  stateManager: StateManager<S, A>
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
