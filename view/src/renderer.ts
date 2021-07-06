import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './App';

let domContainer = document.getElementById("reactApp");
if (domContainer === null) throw new Error("dom container is null.");
/**
 *
 */
const InjectPropsForApp = () => {
  const { users, programs } = ipcRenderer.sendSync("getQueries");

  return App({ users, programs });
};
/**
 *
 */
ReactDOM.render(React.createElement(InjectPropsForApp), domContainer);
