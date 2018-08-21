// @flow

require('babel-core')

const React = require('react')
const ReactSetStateConnect = require('../src')
const renderer = require('react-test-renderer')

const connect = ReactSetStateConnect.default

type DummyState = {
  a: number,
  b: number
}
type DummyProps = {
  state: DummyState,
  actions: {
    addsToA: () => mixed,
    addsToB: () => mixed,
    asyncAddsToA: () => mixed,
    addsBIntoA: () => mixed,
    addBoth: () => mixed
  }
}

const DummyComponent = (props: DummyProps) => (
  <ol>
    State: {Object.keys(props.state).map(prop => <li key={prop}>{`${prop} = ${props.state[prop]}`}</li>)}
  </ol>
)
const initialState = {a: 0, b: 0}
const reducer = (state: DummyState, action: { type: string, value?: number }):DummyState => {
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

    default: return state
  }
}

const mockActions = ({getState, dispatch}) => {
  const addsToA = value => dispatch('ADDS_A', {value})
  const addsToB = value => dispatch('ADDS_B', {value})
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

  return {addsToA, addsToB, asyncAddsToA, addsBIntoA, addBoth}
}

test('passes down state and actions as props', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummyProps = component.root.findByType(DummyComponent).props
  const expected = ['state', 'actions']
  expect(Object.keys(dummyProps)).toEqual(expect.arrayContaining(expected))

  const expectedState = ['a', 'b']
  const expectedActions = ['addsToA', 'addsToB', 'asyncAddsToA', 'addsBIntoA']
  expect(Object.keys(dummyProps.state)).toEqual(expect.arrayContaining(expectedState))
  expect(Object.keys(dummyProps.actions)).toEqual(expect.arrayContaining(expectedActions))
})

test('passes down props wrapping props', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {someProp: 45}))
  const dummyProps = component.root.findByType(DummyComponent).props
  expect(dummyProps.state).toHaveProperty('someProp', 45)
})

test('calling actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.actions.addsToA(4)
    .then(() => {
      expect(dummy.props.state).toHaveProperty('a', 4)
    })
})

test('calling async actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.actions.asyncAddsToA(4)
    .then(() => {
      expect(dummy.props.state).toHaveProperty('a', 4)
    })
})

test('async actions have access to state via get', () => {
  const wrapped = connect(DummyComponent, {
    reducer,
    createActions: mockActions,
    initialState: Object.assign({}, initialState, {a: 8})
  })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.actions.addsToB(9)
    .then(() => dummy.props.actions.addsBIntoA())
    .then(() => {
      expect(dummy.props.state).toHaveProperty('a', 17)
    })
})

test('passed props become part of initial state', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState: { a: 100, b: 100 } })
  const component = renderer.create(React.createElement(wrapped, {a: 10, b: 11}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.actions.addsToA(4)
    .then(() => {
      expect(dummy.props.state).toHaveProperty('a', 14)
    })
})

test('dispatched action does not have a payload, only type', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState: {a: 3, b: 2} })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.actions.addBoth()
    .then(() => {
      expect(dummy.props.state).toHaveProperty('a', 5)
    })
})
