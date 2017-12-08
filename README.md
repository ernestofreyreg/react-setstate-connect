# react-setstate-connect

This javascript module contains 1 helper function: `connect`

`connect` is a HOC function that wraps React components and allows you
 to inject props and actions function from a
redux-like state management construct. 

### How to use it:

You can put your state management code in a single file, you will need
 a `reducer` function in the form
```(state, action) => state```, a `createActions` function in the
form ```({getState, dispatch}) => {actions}```, also an `initialState`
object.

_state.js_
```jsx harmony

export default () => ({
  initialState: {
    value: 0
  },

  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREASE': return {...state, value: state.value + action.value}
      case 'DECREASE': return {...state, value: state.value - action.value}
      default: return state
    }
  },

  createActions: ({getState, dispatch}) => {
    const increase = value => dispatch('INCREASE', {value})
    const decrease = value => dispatch('DECREASE', {value})
    const increase1 = value => dispatch('INCREASE', {value: 1})
    const decrease1 = value => dispatch('DECREASE', {value: 1})

    const delayedIncrease = () => new Promise(
      resolve => setTimeout(() => resolve(increase(1)), 1000)
    )

    return {
      increase,
      decrease,
      increase1,
      decrease1,
      delayedIncrease
    }
  }
})
```

This module is exporting a single function that creates an object with 3
properties `reducer`, the reducer function; `createActions`, a function
that returns a object containing functions an `initialState` also an object.

`createActions` receives two properties inside an object: `getState` and
`dispatch`
- `getState`: Is a function that returns the current store state.
Ex. ```getState()```
- `dispatch`: Is a function that always return a **Promise** and allows you
to dispatch actions to the reducer.
Ex. ```dispatch(ACTION_TYPE, {key: 'value'})```

...and wrap your component with the `connect` function

_ValueButton.js_
```jsx harmony
import connect from 'react-setstate-connect'
import createState from './state.js'

const ValueButton = ({value, increase1, decrease1, delayedIncrease}) => (
  <div>
    <button onClick={increase1}>Add 1</button><button onClick={delayedIncrease}>Add 1 later</button>
    <p>{value}</p>
    <button onClick={decrease1}>Sub 1</button>
  </div>
)


export default connect(ValueButton, createState())
```

You can also pass those three parameters separated. But, this will be probably
deprecated in future versions.

```jsx harmony
import connect from 'react-setstate-connect'
import createState from './state.js'

const ValueButton = ({value, increase1, decrease1, delayedIncrease}) => (
  <div>
    <button onClick={increase1}>Add 1</button><button onClick={delayedIncrease}>Add 1 later</button>
    <p>{value}</p>
    <button onClick={decrease1}>Sub 1</button>
  </div>
)

const {reducer, createActions, initialState} = createState()
export default connect(ValueButton, reducer, createActions, initialState)
```

The preferred way is to have functions that returns the state construct with
those 3 properties based on some parameters.

This way you can combine several state handling into the same connected component.

```jsx harmony
const IndexView = props => (
  <div>...</div>
)

const reducer = (state, action) => state
const createActions = ({getState, dispatch}) => ({})
const initialState = {}

export default connect(
  IndexView,
  {
    orders: getOrdersState(),
    app: {
      reducer,
      createActions,
      initialState
    }
  }
)
```

Props passed to wrapped component will be like: 
```
{ 
  app: { ... }, 
  orders: { ... } 
}
```

### Collect flag

We also have a `collect` flag in the `connect` function to indicate we want
to recollect all previous properties as part of the initial state of the HOC. This allows 
easier compositions of generic HOCs that will end of contributing data to a custom logic 
that collects all previous data into its state and can perform state changes on them.
 
```jsx harmony
import withDataPull from 'data-puller'

const DataView = ({data, pullingData, errorData}) => (
  <div>...</div>
)

export default connect(
  withDataPull('data', getDataService)(DataView),   // Component wrapped by some data service
  {
    reducer: customLogicReducer,         // Custom logic reducer
    createActions: customLogicCreateActions,   // Custom logic createActions
    initialState: {},   // Initial state
    collect: true  // collect all props and make them part of the store state, this also updates it when component receives new properties
  }
)
```

### Server side rendering
Many web apps try to implement Server Side Render by reusing the same
state management functions. `react-setstate-connect` constructs can be
used on the server via a small helper function we included.

```
const server = require('react-setstate-connect/server')
const manageState = require('./state')

server(manageState()).loadAsyncData()
    .then(state => {
        // Do something with state.data
    })
```

#### Next.js example
Next.js (https://github.com/zeit/next.js) is a
"Framework for server-rendered or statically-exported React apps" they
implemented a fairly simple way to inject server side data to your
React apps via adding an async `getInitialProps` function in your page
root component. This function can receive Request/Response object like
any HTTP middleware function. So, it can check for cookies, make
redirects, etc.

Assuming we have a Next.js app with a page that connects to a state
management construct that loads data async using on action function. We
can do:

_state/page-state.js
```
import axios from 'axios'

const LOADED_DATA = 'LOADED_DATA'

export default () => ({
    collect: true, // <- collect flag must be true
    initialState: {data: null}
    reducer: (state, action) => {
        switch (action.type) {
            case LOADED_DATA: return {...state, data: action.data}
        }

        return state
    },
    createActions: ({dispatch}) => ({
        loadData: () => axios.get('/api/data')
            .then(response => dispatch(LOADED_DATA, {data: response.data})
    })
})
```

_pages/page.js_
```
import React from 'react'
import connect from 'react-setstate-connect'
import server from 'react-setstate-connect/server'
import managePageState from '../state/page-state'
import { Panel, DataList, Button } from '../components'

const Page = ({
    data,
    loadData
}) => (
    <Panel>
        <DataList data={data} />

        <Button onClick={loadData}>
            Refresh List
        </Button>
    </Panel>
)

const ConnectedPage = connect(Page, managePageState())

ConnectedPage.getInitialProps = () => {
    return server(managePageState()).loadData()
}

export default ConnectedPage
```

On the server, you should take care of cookies and using the correct URL for
the api endpoint. But, since the state management construct is a function
we can make it to accept those as parameters and use it accordingly.

_state/page-state.js
```
import axios from 'axios'

const LOADED_DATA = 'LOADED_DATA'

export default (cookies, urlBase) => ({
    ...
    createActions: ({dispatch}) => ({
        loadData: () => axios.get('${urlBase}/api/data', {headers: {...}})
         ...
    })
})
```

Anything is possible since is just a function.

### Pro tips
- Keep the state management code and the wrapped component close together.
- By default all actions in the form **(props) => dispatch(type, props)** return promises, so, is a good thing to make 
all async actions return promises as well.
- Your wrapped component should never need to use setState directly, if you find yourself adding this.setState then go
to the actions creator and reducer and add it there.
- Composition is possible by using the connect wrapper more that once. Each layer will add its own Connected component 
with holds the state and pass it down as properties. This properties will become the initial state (along with the passed 
initialState param in the connect function) of the next wrapped component.
- Lift up/down state.
- Create parametrized state handling functions, those are easier to tests and reuse


### Read more
- [Functional setState is the future of React](https://medium.freecodecamp.org/functional-setstate-is-the-future-of-react-374f30401b6b)
- [Redux-like functional setState in React](https://medium.com/@efreyreg/redux-like-functional-setstate-6c1c17a9fa77)
