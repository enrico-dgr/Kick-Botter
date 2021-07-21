import { ipcRenderer } from 'electron';
import * as React from 'react';

type Props = {
  user: string;
  nameOfProgram: string;
  disabled: boolean;
};

export const RunProgram = (props: Props) => {
  const runProgram = ({ user, nameOfProgram: name }: Props) =>
    ipcRenderer.invoke("runProgram", {
      user,
      name,
    });

  return (
    <button disabled={props.disabled} onClick={() => runProgram(props)}>
      Run
    </button>
  );
};
