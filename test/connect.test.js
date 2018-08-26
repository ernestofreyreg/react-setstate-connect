import React from 'react'
import renderer from 'react-test-renderer'
import connect from '../src/index'

const DummyComponent = (props) => (
  <ol>
    a = {props.a}<br />
    b = {props.b}<br />
    <hr />
    addsToA = {typeof (props.addsToA)}<br />
    addsToB = {typeof (props.addsToB)}<br />
    asyncAddsToA = {typeof (props.asyncAddsToA)}<br />
    addsBIntoA = {typeof (props.addsBIntoA)}<br />
    addBoth = {typeof (props.addBoth)}<br />
    <hr />
    className = {props.className || 'undefined'}
  </ol>
)

const initialState = {a: 0, b: 0}
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADDS_A': {
      return {...state, a: state.a + action.value}
    }

    case 'ADDS_B': {
      return {...state, b: state.b + action.value}
    }

    case 'ADD_BOTH': {
      return {...state, a: state.a + state.b}
    }
  }

  return state
}

const createMockActions = ({ getState, dispatch }) => {
  const addsToA = (value: number) => dispatch('ADDS_A', { value })
  const addsToB = (value: number) => dispatch('ADDS_B', { value })
  const addBoth = () => dispatch('ADD_BOTH')

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

  return { addsToA, addsToB, asyncAddsToA, addsBIntoA, addBoth }
}

const createMockStateManager = () => ({
  reducer,
  createActions: createMockActions,
  initialState
})

test('passes down state and actions as props', () => {
  const wrapped = connect(DummyComponent, createMockStateManager())
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummyProps = component.root.findByType(DummyComponent).props
  const expected = ['a', 'b', 'addsToA', 'addsToB', 'asyncAddsToA', 'addsBIntoA']
  expect(Object.keys(dummyProps)).toEqual(expect.arrayContaining(expected))
})

test('passes down props wrapping props', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: createMockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {someProp: 45}))
  const dummyProps = component.root.findByType(DummyComponent).props
  expect(dummyProps).toHaveProperty('someProp', 45)
})

test('calling actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: createMockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 4)
    })
})

test('calling async actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: createMockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.asyncAddsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 4)
    })
})

test('async actions have access to state via get', () => {
  const wrapped = connect(DummyComponent, {
    reducer,
    createActions: createMockActions,
    initialState: Object.assign({}, initialState, {a: 8})
  })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToB(9)
    .then(() => dummy.props.addsBIntoA())
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 17)
    })
})

test('passed props become part of initial state', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: createMockActions, initialState: { a: 100, b: 100 } })
  const component = renderer.create(React.createElement(wrapped, {a: 10, b: 11}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 14)
    })
})

test('dispatched action does not have a payload, only type', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: createMockActions, initialState: {a: 3, b: 2} })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addBoth()
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 5)
    })
})
