import serverState from '../src/server'

const initialState = {a: 0, b: 0}
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
const createActions = ({getState, dispatch}) => {
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
const manageState = () => ({ reducer, createActions, initialState })

test('creates server state handler', () => {
  const server = serverState(manageState())
  const expected = ['addsToA', 'addsToB', 'asyncAddsToA', 'addsBIntoA']
  expect(Object.keys(server)).toEqual(expect.arrayContaining(expected))
})

test('calling action returns', () => {
  const server = serverState(manageState())
  const state = server.addsToA(50)
  expect(state.a).toEqual(50)
})

test('calling repeated actions keeps state', () => {
  const server = serverState(manageState())
  const state = server.addsToA(50)
  expect(state.a).toEqual(50)
  expect(server.addsToA(4).a).toEqual(54)
})

test('also works with promises', () => {
  const server = serverState(manageState())
  return server.asyncAddsToA(50)
    .then(state => {
      expect(state.a).toEqual(50)
    })
})

test('keeping state with promises', () => {
  const server = serverState(manageState())
  return server.asyncAddsToA(50)
    .then(() => server.asyncAddsToA(4))
    .then(() => server.addsToB(10))
    .then(state => {
      expect(state.a).toEqual(54)
      expect(state.b).toEqual(10)
    })
})

test('can use getState in actions', () => {
  const server = serverState(manageState())
  server.addsToB(10)
  server.addsToA(4)

  const state = server.addsBIntoA()
  expect(state.a).toEqual(14)
})
