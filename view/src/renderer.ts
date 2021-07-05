import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './App';

let domContainer = document.getElementById("reactApp");
if (domContainer === null) throw new Error("dom container is null.");

/**
 *
 */
ReactDOM.render(React.createElement(App), domContainer);
