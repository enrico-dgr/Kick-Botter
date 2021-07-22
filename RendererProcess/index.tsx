import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { App } from './App';
import store from './store';

let domContainer = document.getElementById("reactApp");
if (domContainer === null) throw new Error("dom container is null.");

const Renderer = () =>
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    domContainer
  );

export default Renderer;
