import { ipcRenderer } from 'electron';
import * as React from 'react';

const OpenLocal = () => {
  const openLocal = () => ipcRenderer.invoke("openLocal");

  return (
    <div className="open-local-files">
      <button
        className="primary-button open-local-files__btn"
        onClick={() => openLocal()}
      >
        Open Local Files
      </button>
      <p className="open-local-files__description">e.g. local settings</p>
    </div>
  );
};
export default OpenLocal;
