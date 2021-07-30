import { ipcRenderer } from 'electron';
import * as React from 'react';

import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { add } from '../controllerSlice';

namespace Models {
  export type Props = {
    user: string;
    name: string;
    disabled: boolean;
  };
}
const Run = (props: Models.Props) => {
  const dispatch = useAppDispatch();
  const runningPrograms = useAppSelector(
    (state) => state.controller.runningPrograms
  );

  const runProgram = ({ user, name }: Models.Props) =>
    ipcRenderer
      .invoke("runProgram", {
        user,
        name,
      })
      .then(() => dispatch(add({ user, name })));

  return (
    <button
      className="primary-button"
      disabled={
        props.disabled ||
        runningPrograms.findIndex(
          (prog) => prog.name === props.name && prog.user === props.user
        ) > -1
      }
      onClick={() => runProgram(props)}
    >
      Run
    </button>
  );
};

export default Run;
