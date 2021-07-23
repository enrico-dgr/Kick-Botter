import React from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { getPrograms, initialState, selectBrowserProgram } from './browserProgramsSlice';

const DEFAULT_PROGRAM = initialState.selected;

const BrowserUsers = () => {
  const { names, selected } = useAppSelector((state) => ({
    names: state.browserPrograms.names,
    selected: state.browserPrograms.selected,
  }));

  const dispatch = useAppDispatch();

  // on mount
  React.useEffect(() => {
    dispatch(getPrograms()).then((res) => console.table(res));
  }, []);

  return (
    <>
      <select
        name="browserUsers"
        id="browserUsers"
        value={selected}
        onChange={(e) => dispatch(selectBrowserProgram(e.target.value))}
      >
        <option value={DEFAULT_PROGRAM}>{DEFAULT_PROGRAM}</option>

        {names.map((mappedName) => (
          <option value={mappedName} key={mappedName}>
            {mappedName}
          </option>
        ))}
      </select>
    </>
  );
};
export default BrowserUsers;
