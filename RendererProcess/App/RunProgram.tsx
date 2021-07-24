import { ipcRenderer } from 'electron';
import * as React from 'react';

namespace Models {
  export type Props = {
    browserUser: string;
    browserProgram: string;
    disabled: boolean;
  };
}
export const RunProgram = (props: Models.Props) => {
  const runProgram = ({
    browserUser: user,
    browserProgram: name,
  }: Models.Props) =>
    ipcRenderer.invoke("runProgram", {
      user,
      name,
    });

  return (
    <button
      className="primary-button"
      disabled={props.disabled}
      onClick={() => runProgram(props)}
    >
      Run
    </button>
  );
};
