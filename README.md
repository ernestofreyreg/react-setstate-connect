# react-setstate-connect

**react-setstate-connect** is NOT another Flux library. 

This javascript module contains 1 helper function: `connect`

`connect` is a HOC function that wraps React components and allows you to inject props and actions function from a 
redux-like state management construct. 

### How to use it:

You can put your state management code in a single file, you will need an initial state object, a reducer function 
in the form **(state, action) => state** and a createActions function in the form **({getState, dispatch}) => {actions}**. 

_state.js_
```jsx harmony
export const initialState = {
  value: 0
}

export function reducer (state, action) {
  switch (action.type) {
    case 'INCREASE': return {...state, value: state.value + action.value}
    case 'DECREASE': return {...state, value: state.value - action.value}
    default: return state
  }
}

export function createActions ({getState, dispatch}) {
  const increase = value => dispatch('INCREASE', {value})
  const increase1 = () => dispatch('INCREASE', {value: 1})
  const decrease = value => dispatch('DECREASE', {value})
  const decrease1 = () => dispatch('DECREASE', {value: 1})
  
  const delayedIncrease = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve(increase(1))
      }, 1000)
    })
  }
  
  return {
    increase,
    decrease,
    delayedIncrease
  }
}
```

You must wrap your component with the connect function

_ValueButton.js_
```jsx harmony
import connect from 'react-setstate-connect'
import { createActions, initialState, reducer } from './state.js'

const ValueButton = ({value, increase1, decrease1, delayedIncrease}) => (
  <div>
    <button onClick={increase1}>Add 1</button><button onClick={delayedIncrease}>Add 1 later</button>
    <p>{value}</p>
    <button onClick={decrease1}>Sub 1</button>
  </div>
)


export default connect(ValueButton, reducer, createActions, initialState)
```
### New from version 0.4.0
Passed props to a wrapped component will be part of the initial state making composition easier. 


### Pro tips
- Keep the state management code and the wrapped component close together.
- By default all actions in the form **(props) => dispatch(type, props)** return promises, so, is a good thing to make 
all async actions return promises as well.
- Your wrapped component should never need to use setState directly, if you find yourself adding this.setState then go
to the actions creator and reducer and add it there.
- Composition is possible by using the connect wrapper more that once. Each layer will add its own Connected component 
with holds the state and pass it down as properties. This properties will become the initial state (along with the passed 
initialState param in the connect function) of the next wrapped component.

```jsx harmony
...

export default connect(
  connect(
    ValueButton, 
    createValueActions, 
    initialValueState
  ),
  createMoreActions, 
  moreInitialState
)
```

### Read more
- [Functional setState is the future of React](https://medium.freecodecamp.org/functional-setstate-is-the-future-of-react-374f30401b6b)
- [Redux-like functional setState in React](https://medium.com/@efreyreg/redux-like-functional-setstate-6c1c17a9fa77)
