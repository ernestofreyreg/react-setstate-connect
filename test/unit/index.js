'use strict'

require('must')
const React = require('react')
const { mount } = require('enzyme')
const connect = require('../../src/index')

describe('connect', () => {
  const DummyComponent = props => <ol>{Object.keys(props).map(prop => <li key={prop}>{`${prop} = ${props[prop]}`}</li>)}</ol>
  const initState = {a: 0, b: 0}
  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADDS_A': {
        return Object.assign({}, state, {a: state.a + action.value})
      }

      case 'ADDS_B': {
        return Object.assign({}, state, {b: state.b + action.value})
      }

      default: return state
    }
  }

  const reducerReflection = (state, action) => {
    switch (action.type) {
      case 'REFLECTION': {
        return Object.assign({}, state, {state: action.state})
      }

      default: return state
    }
  }

  const mockActions = ({getState, dispatch}) => {
    const addsToA = value => dispatch('ADDS_A', {value})
    const addsToB = value => dispatch('ADDS_B', {value})

    const asyncAddsToA = (value, delay) => {
      return new Promise(resolve => {
        setTimeout(() => {
          return resolve(addsToA(value))
        }, delay)
      })
    }

    const addsBIntoA = () => {
      const b = getState().b
      return addsToA(b)
    }

    return {addsToA, addsToB, asyncAddsToA, addsBIntoA}
  }

  const createVariant = variant => {
    const ADDS_A = `ADDS_A_${variant}`
    const ADDS_B = `ADDS_B_${variant}`

    const reducer = (state, action) => {
      switch (action.type) {
        case ADDS_A: {
          return Object.assign({}, state, {a: state.a + action.value})
        }

        case ADDS_B: {
          return Object.assign({}, state, {b: state.b + action.value})
        }

        default: return state
      }
    }

    const mockActions = ({getState, dispatch}) => {
      const addsToA = value => dispatch(ADDS_A, {value})
      const addsToB = value => dispatch(ADDS_B, {value})

      return {addsToA, addsToB}
    }

    return { reducer: reducer, createActions: mockActions, initialState: {a: 0, b: 0} }
  }

  const mockActionsReflection = ({getState, dispatch}) => {
    const reflection = () => dispatch('REFLECTION', {state: getState()})
    return {reflection}
  }

  it('wraps dummy component', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, initState)
    const component = mount(React.createElement(wrapped, {}))
    component.find('Connected').must.have.length(1)
    component.find('Connected').find('DummyComponent').must.have.length(1)
  })

  it('also works with state object construct', () => {
    const createStateManager = () => {
      return {
        reducer: reducer,
        createActions: mockActions,
        initialState: initState
      }
    }

    const wrapped = connect(DummyComponent, createStateManager())
    const component = mount(React.createElement(wrapped, {}))
    component.find('Connected').must.have.length(1)
    component.find('Connected').find('DummyComponent').must.have.length(1)
  })

  it('passes down state and actions as props', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, initState)
    const component = mount(React.createElement(wrapped, {}))
    const dummyProps = component.find('Connected').find('DummyComponent').get(0).props
    dummyProps.must.have.property('a', 0)
    dummyProps.must.have.property('b', 0)
    dummyProps.must.have.property('addsToA')
    dummyProps.must.have.property('addsToB')
    dummyProps.must.have.property('asyncAddsToA')
    dummyProps.must.have.property('addsBIntoA')
    dummyProps.addsToA.must.be.a.function()
    dummyProps.addsToB.must.be.a.function()
    dummyProps.asyncAddsToA.must.be.a.function()
    dummyProps.addsBIntoA.must.be.a.function()
  })

  it('passes down props wrapping props', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, initState)
    const component = mount(React.createElement(wrapped, {someProp: 45}))
    const dummyProps = component.find('Connected').find('DummyComponent').get(0).props
    dummyProps.must.have.property('someProp', 45)
  })

  it('calling actions', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, initState)
    const component = mount(React.createElement(wrapped, {}))
    return component.find('DummyComponent').get(0).props.addsToA(4)
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('a', 4)
      })
  })

  it('calling async actions', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, initState)
    const component = mount(React.createElement(wrapped, {}))
    const promise = component.find('DummyComponent').get(0).props.asyncAddsToA(4, 1000)
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('a', 4)
      })
    component.find('DummyComponent').get(0).props.must.have.property('a', 0)
    return promise
  })

  it('async actions have access to state via get', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, Object.assign({}, initState, {a: 8}))
    const component = mount(React.createElement(wrapped, {}))
    return component.find('DummyComponent').get(0).props.addsToB(9)
      .then(() => component.find('DummyComponent').get(0).props.addsBIntoA())
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('a', 17)
      })
  })

  it('passed props become part of initial state with collect flag', () => {
    const wrapped = connect(DummyComponent, reducer, mockActions, {}, true)
    const component = mount(React.createElement(wrapped, {a: 10, b: 11}))
    return component.find('DummyComponent').get(0).props.addsToA(4)
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('a', 14)
      })
  })

  it('HOC component uses props as initial state too in wrapped components with collect flag', () => {
    const doubleWrapped = connect(DummyComponent, reducerReflection, mockActionsReflection, {}, true)
    const wrapped = connect(doubleWrapped, reducer, mockActions, Object.assign({}, initState, {a: 8}))

    const component = mount(React.createElement(wrapped, {}))

    return component.find('DummyComponent').get(0).props.reflection()
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('state')
        component.find('DummyComponent').get(0).props.state.must.have.property('a', 8)
        component.find('DummyComponent').get(0).props.state.must.have.property('b', 0)
      })
  })

  it('merges reducers/actions/initial state', () => {
    const wrapped = connect(
      DummyComponent,
      {
        app: createVariant('A'),
        app2: createVariant('B')
      }
    )

    const component = mount(React.createElement(wrapped, {}))
    const dummyProps = component.find('Connected').find('DummyComponent').get(0).props
    dummyProps.app.must.have.property('a', 0)
    dummyProps.app.must.have.property('b', 0)
    dummyProps.app.must.have.property('addsToA')
    dummyProps.app.must.have.property('addsToB')
    dummyProps.app.addsToA.must.be.a.function()
    dummyProps.app.addsToB.must.be.a.function()

    dummyProps.app2.addsToA(5)
      .then(() => {
        const changedProps = component.find('Connected').find('DummyComponent').get(0).props
        changedProps.app.must.have.property('a', 0)
        changedProps.app2.must.have.property('a', 5)
      })
  })

  it('merges reducers/actions/initial state, collects props right place', () => {
    const wrapped = connect(
      DummyComponent,
      {
        app: createVariant('A'),
        app2: createVariant('B')
      },
      true
    )

    const component = mount(React.createElement(wrapped, {app: {a: 4, b: 6}}))
    const dummyProps = component.find('Connected').find('DummyComponent').get(0).props
    dummyProps.app.must.have.property('a', 4)
    dummyProps.app.must.have.property('b', 6)
    dummyProps.app.must.have.property('addsToA')
    dummyProps.app.must.have.property('addsToB')
    dummyProps.app.addsToA.must.be.a.function()
    dummyProps.app.addsToB.must.be.a.function()

    dummyProps.app.addsToA(5)
      .then(() => {
        const changedProps = component.find('Connected').find('DummyComponent').get(0).props
        changedProps.app.must.have.property('a', 9)
        changedProps.app2.must.have.property('a', 0)
      })
  })
})
