import { ipcRenderer } from 'electron';
import * as React from 'react';

namespace Models {
  export type Props = {
    browserUser: string;
    browserProgram: string;
    disabled: boolean;
  };
}

const CloseProgram = (props: Models.Props) => {
  const closeProgram = ({
    browserUser: user,
    browserProgram: name,
  }: Models.Props) =>
    ipcRenderer.invoke("closeProgram", {
      user,
      name,
    });

  return (
    <button
      className="primary-button"
      disabled={props.disabled}
      onClick={() => closeProgram(props)}
    >
      Close
    </button>
  );
};
export default CloseProgram;
