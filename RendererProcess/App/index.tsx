import * as React from 'react';

import BrowserPrograms from '../features/browserPrograms/BrowserPrograms';
import BrowserUsers from '../features/browserUsers/BrowserUsers';
import { useAppSelector } from '../hooks';
import ProgramSettings from './ProgramSettings';
import { RunProgram } from './RunProgram';

export const App = () => {
  const selectedBrowserUser = useAppSelector(
    (state) => state.browserUsers.selected
  );
  const selectedBrowserProgram = useAppSelector(
    (state) => state.browserPrograms.selected
  );

  return (
    <>
      <p>User:</p>
      <BrowserUsers />
      <p>Program:</p>
      <BrowserPrograms />
      <br />
      <RunProgram
        browserUser={selectedBrowserUser}
        browserProgram={selectedBrowserProgram}
        disabled={selectedBrowserProgram === "none"}
      />
      <ProgramSettings
        browserUser={selectedBrowserUser}
        browserProgram={selectedBrowserProgram}
      />
    </>
  );
};
