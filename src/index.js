import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Provider } from "react-redux";
import {store, persistor} from './store/store';
import { PersistGate } from 'redux-persist/integration/react';

import './assets/css/BT5/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./firebase-messaging-sw.js")
    .then(function(registration) {
      console.log("Registration successful, scope is:", registration.scope);
    })
    .catch(function(err) {
      console.log("Service worker registration failed, error:", err);
    });

  //navigator.serviceWorker.addEventListener("message", (message) => console.log(message));
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
