# react-setstate-connect

This javascript module contains 2 helper functions:
- `connect`: Is a HOC function that wraps React components and allows you
 to inject props and actions function from a redux-like state management construct.
- `serverState`: Allows you to use the same state management construct on the server. Especially useful for server side rendering.

**Version 4.0.0**

- All state and actions are merged and passed together in the components properties
- This version lacks flow type definitions. (Future versions will reimplement them in a more simple way)

**Version 3.0.0 DEPRECATED VERSION**

Sadly we had to deprecate this short lived version.

**Version 2.1.0 With Flow type definitions**

This version of `react-setconnect-state` includes flow type definitions for the basic state manager construct.

### How to use it:

ES6 imports
```
import connect from 'react-setstate-connect'
import serverState from 'react-setstate-connect/lib/server'
```

or

```
const connect = require('react-setstate-connect')
const serverState = require('react-setstate-connect/lib/server')
```

You can put your state management code in a single file, you will need
 a `reducer` function in the form
```(state, action) => state```, a `createActions` function in the
form ```({getState, dispatch}) => {actions}```, also an `initialState`
object (if not declared an empty object will be used).

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
    const increase1 = () => dispatch('INCREASE', {value: 1})
    const decrease1 = () => dispatch('DECREASE', {value: 1})

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

This example module is exporting a single function that creates an object with 3
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

const ValueButton = ({
  value,
  increase1,
  decrease1,
  delayedIncrease
}) => (
  <div>
    <button onClick={increase1}>Add 1</button>
    <button onClick={delayedIncrease}>Add 1 later</button>
    <p>{value}</p>
    <button onClick={decrease1}>Sub 1</button>
  </div>
)

export default connect(ValueButton, createState())
```

### Auto merge props

Once wrapped our component we might still want to pass props to it, those
properties are merged in overwriting the initial state and passed down in the `state` prop.

```jsx harmony
import dataPull from './data-puller'

const DataView = ({
  data,
  error,
  pullingData
}) => (
  <div>...</div>
)

const ConnectedData = connect(DataView, dataPull())

// state.data = default initial state
<ConnectedData />

// state.data = preloadedData
<ConnectedData data={preloadedData} />
```

### Server side rendering and tests
Many web apps try to implement Server Side Render by reusing the same
state management functions. `react-setstate-connect` constructs can be
used on the server via a small helper function we included `serverState`.
This function can also be used for testing state management.

```javascript
const serverState = require('react-setstate-connect/lib/server')
const manageState = require('./state')

const server = serverState(manageState())

return server.actions.loadAsyncData()
    .then(() => {
        // Do something with state.data
        const currentState = server.getState()
        // ...
    })

// You can also chain async actions.

const server = serverState(manageState())
server.actions.loadAsyncData()
  .then(() => server.actions.doOtherAsyncTask())
  .then(() => server.actions.yetAnotherAsyncTask(server.getState().someProp))
  .then(() => {
    console.log(server.getState())
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
```javascript
import axios from 'axios'

const LOADED_DATA = 'LOADED_DATA'

export default () => ({
    initialState: {data: null}
    reducer: (state, action) => {
        switch (action.type) {
            case LOADED_DATA: return {...state, data: action.data}
        }

        return state
    },
    createActions: ({dispatch}) => ({
        loadData: () => axios.get('/api/data')
            .then(response => response.data, () => []) // Added error handling here, just returns an empty array
            .then(data => dispatch(LOADED_DATA, {data})
    })
})
```

_pages/page.js_
```jsx
import React from 'react'
import connect from 'react-setstate-connect'
import server from 'react-setstate-connect/lib/server'
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

// Server-Side-Render portion, will initialize state manager, call async function and return value as initial props.
ConnectedPage.getInitialProps = () => {
  const ssr = server(managePageState())

  return ssr.actions.loadData()
    .then(() => ssr.getState())
}

export default ConnectedPage
```

On the server, you should take care of cookies and using the correct URL for
the api endpoint. But, since the state management construct is a function
we can make it to accept those as parameters and use it accordingly.

_state/page-state.js
```javascript
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
which  holds the state and pass it down as properties. This properties will become the initial state (along with the passed
initialState param in the connect function) of the next wrapped component.
- Lift up/down state.
- Create parametrized state handling functions, those are easier to tests and reuse


### Read more
- [Functional setState is the future of React](https://medium.freecodecamp.org/functional-setstate-is-the-future-of-react-374f30401b6b)
- [Redux-like functional setState in React](https://medium.com/@efreyreg/redux-like-functional-setstate-6c1c17a9fa77)
