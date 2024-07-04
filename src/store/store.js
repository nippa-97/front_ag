import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "../reducers/rootReducer";
import localforage from 'localforage';

import { persistStore, persistReducer } from 'redux-persist' // imports from redux-persist
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const persistConfig = { // configuration object for redux-persist
  key: 'pgroot',
  storage: localforage, // define which storage to use
}

const persistedReducer = persistReducer(persistConfig, rootReducer) // create a persisted reducer


const store = createStore(
  persistedReducer, // pass the persisted reducer instead of rootReducer to createStore
  compose(
    applyMiddleware(), // add any middlewares here
    window.__REDUX_DEVTOOLS_EXTENSION__? window.__REDUX_DEVTOOLS_EXTENSION__(): f => f
  )
)

const  persistor = persistStore(store); // used to create the persisted store, persistor will be used in the next step

export {store, persistor}
