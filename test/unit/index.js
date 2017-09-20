'use strict'

require('must')
const React = require('react')
const { mount } = require('enzyme')
const connect = require('../../lib/index')

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

  it('HOC component uses props and state on getState', () => {
    const doubleWrapped = connect(DummyComponent, reducerReflection, mockActionsReflection, {})
    const wrapped = connect(doubleWrapped, reducer, mockActions, Object.assign({}, initState, {a: 8}))

    const component = mount(React.createElement(wrapped, {}))

    return component.find('DummyComponent').get(0).props.reflection()
      .then(() => {
        component.find('DummyComponent').get(0).props.must.have.property('state')
        component.find('DummyComponent').get(0).props.state.must.have.property('a', 8)
        component.find('DummyComponent').get(0).props.state.must.have.property('b', 0)
      })
  })
})
