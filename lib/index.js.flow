// @flow

import * as React from 'react'

export type Reducer<S> = (state: S, action: { type: string, [string]: any }) => S
export type GetStateCall<S> = () => S
export type DispatchCall = (type: string, payload?: Object) => Promise<any>
export type ActionSet = { [string]: Function }
export type ActionParams<S> = { getState: GetStateCall<S>, dispatch: DispatchCall }
export type StateManager<S, A: $Shape<ActionSet>> = {
  initialState: S,
  reducer: Reducer<S>,
  createActions: (ActionParams<S>) => A
}

const merge = <S, O>(state: S, props: O):S => (Object.assign({}, state, props): S)

const connect = <S, A, O>(
  component: React.ComponentType<{state: S, actions: A}>,
  stateManager: StateManager<S, A>
):React.ComponentType<O> => {
  const attach = (instance):ActionParams<S> => ({
    getState: () => instance.state,
    dispatch: createDispatcher(stateManager.reducer, fn => new Promise(resolve => instance.setState(fn, resolve)))
  })

  const createDispatcher = (reducer: Reducer<S>, set) => (type: string, params: Object = {}) => set((state: S) => reducer(state, Object.assign({ type }, params)))

  return class Connected extends React.Component<O, S> {
    actions: A

    constructor (props: O) {
      super(props)

      this.state = merge(stateManager.initialState, props)
      this.actions = stateManager.createActions(attach(this))
    }

    render () {
      return React.createElement(
        component,
        {
          state: this.state,
          actions: this.actions
        }
      )
    }
  }
}

export default connect
