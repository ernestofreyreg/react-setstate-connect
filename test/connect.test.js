require('babel-core')

const React = require('react')
const ReactSetStateConnect = require('../src')
const renderer = require('react-test-renderer')

const connect = ReactSetStateConnect.default

const DummyComponent = props => <ol>{Object.keys(props).map(prop => <li key={prop}>{`${prop} = ${props[prop]}`}</li>)}</ol>
const initialState = {a: 0, b: 0}
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADDS_A': {
      return {...state, a: (state.a || 0) + action.value}
    }

    case 'ADDS_B': {
      return {...state, b: (state.b || 0) + action.value}
    }

    case 'ADD_BOTH': {
      return {...state, a: (state.a || 0) + (state.b || 0)}
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

test('wraps dummy component', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  expect(component.root.type.name).toEqual('Connected')
})

test('also works with state object construct', () => {
  const createStateManager = () => {
    return {
      reducer: reducer,
      createActions: mockActions,
      initialState
    }
  }

  const wrapped = connect(DummyComponent, createStateManager())
  const component = renderer.create(React.createElement(wrapped, {}))
  expect(component.root.type.name).toEqual('Connected')
  expect(component.root.findByType(DummyComponent)).toBeTruthy()
})

test('passes down state and actions as props', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummyProps = component.root.findByType(DummyComponent).props
  const expected = ['a', 'b', 'addsToA', 'addsToB', 'asyncAddsToA', 'addsBIntoA']
  expect(Object.keys(dummyProps)).toEqual(expect.arrayContaining(expected))
})

test('passes down props wrapping props', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {someProp: 45}))
  const dummyProps = component.root.findByType(DummyComponent).props
  expect(dummyProps).toHaveProperty('someProp', 45)
})

test('calling actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 4)
    })
})

test('calling async actions', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState })
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
    createActions: mockActions,
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

test('passed props become part of initial state with collect flag', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState: {}, collect: true })
  const component = renderer.create(React.createElement(wrapped, {a: 10, b: 11}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 14)
    })
})

test('dispatched action does not have a payload, only type', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, initialState: {a: 3, b: 2} })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addBoth()
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 5)
    })
})

test('initialState can be undefined, assumes empty object', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 4)
    })
})

test('initialState can be undefined, assumes empty object, with collect=true', () => {
  const wrapped = connect(DummyComponent, { reducer, createActions: mockActions, collect: true })
  const component = renderer.create(React.createElement(wrapped, {}))
  const dummy = component.root.findByType(DummyComponent)
  return dummy.props.addsToA(4)
    .then(() => {
      expect(dummy.props).toHaveProperty('a', 4)
    })
})
