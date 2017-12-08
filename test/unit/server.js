'use strict'

require('must')
const serverState = require('../../src/server')

describe('server state', () => {
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

  it('creates server state handler', () => {
    const server = serverState(manageState())
    server.must.have.keys(['addsToA', 'addsToB', 'asyncAddsToA', 'addsBIntoA'])
  })

  it('calling action returns', () => {
    const server = serverState(manageState())
    const state = server.addsToA(50)
    state.a.must.be(50)
  })

  it('calling repeated actions keeps state', () => {
    const server = serverState(manageState())
    const state = server.addsToA(50)
    state.a.must.be(50)
    server.addsToA(4).a.must.be(54)
  })

  it('also works with promises', () => {
    const server = serverState(manageState())
    return server.asyncAddsToA(50)
      .then(state => {
        state.a.must.be(50)
      })
  })

  it('keeping state with promises', () => {
    const server = serverState(manageState())
    return server.asyncAddsToA(50)
      .then(() => server.asyncAddsToA(4))
      .then(() => server.addsToB(10))
      .then(state => {
        state.a.must.be(54)
        state.b.must.be(10)
      })
  })

  it('can use getState in actions', () => {
    const server = serverState(manageState())
    server.addsToB(10)
    server.addsToA(4)
    const state = server.addsBIntoA()
    state.a.must.be(14)
  })
})
