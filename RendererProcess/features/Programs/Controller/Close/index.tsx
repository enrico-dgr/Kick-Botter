import { ipcRenderer } from 'electron';
import * as React from 'react';

import { useAppDispatch } from '../../../../hooks';
import { remove } from '../controllerSlice';

namespace Models {
  export type Props = {
    user: string;
    name: string;
  };
}

const Close = (props: Models.Props) => {
  const dispatch = useAppDispatch();

  const closeProgram = ({ user, name }: Models.Props) =>
    ipcRenderer
      .invoke("closeProgram", {
        user,
        name,
      })
      .then(() => dispatch(remove({ user, name })));

  return (
    <button className="primary-button" onClick={() => closeProgram(props)}>
      Close
    </button>
  );
};

export default Close;
