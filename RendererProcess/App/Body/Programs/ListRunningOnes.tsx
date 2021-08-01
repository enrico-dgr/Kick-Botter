import * as React from 'react';

import Programs from '../../../features/Programs';
import { useAppSelector } from '../../../hooks';

const ListRunningOnes = () => {
  const runningPrograms = useAppSelector(
    (state) => state.controller.runningPrograms
  );

  return (
    <>
      {runningPrograms.map((prog) => (
        <div key={prog.user + "/" + prog.name}>
          <p>{prog.user + " -- " + prog.name}</p>
          <Programs.Controller.Close user={prog.user} name={prog.name} />
        </div>
      ))}
    </>
  );
};

export default ListRunningOnes;
