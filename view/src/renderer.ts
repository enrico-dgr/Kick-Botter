import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

let domContainer = document.getElementById("reactApp");
if (domContainer === null) throw new Error("dom container is null.");

domContainer.innerText = "new Text";

/**
 *
 */
ReactDOM.render(React.createElement(App), domContainer);
