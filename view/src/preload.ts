import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AppPreload } from './AppPreload';

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
    return AppPreload();
  };
  /**
   *
   */
  ReactDOM.render(React.createElement(InjectPropsForAppPreload), domContainer);
});
