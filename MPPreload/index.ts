import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './App';

const Preload = () =>
  window.addEventListener("DOMContentLoaded", () => {
    /**
     *
     */
    let domContainer = document.getElementById("preload");
    if (domContainer === null) throw new Error("dom container is null.");
    /**
     *
     */
    const InjectPropsForAppPreload = () => {
      return App();
    };
    /**
     *
     */
    ReactDOM.render(
      React.createElement(InjectPropsForAppPreload),
      domContainer
    );
  });
export default Preload;
