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
    <div className="browser-program-container">
      <div className="browser-program-container__heading">
        <h1>Handle Browser Bots</h1>
        <p>Here you can start and stop browser bots.</p>
      </div>
      <div className="browser-program-controller">
        <div className="browser-program-controller__queries">
          <BrowserUsers />
          <BrowserPrograms />
        </div>
        <div className="browser-program-controller__main">
          <RunProgram
            browserUser={selectedBrowserUser}
            browserProgram={selectedBrowserProgram}
            disabled={selectedBrowserProgram === "none"}
          />
          <ProgramSettings
            browserUser={selectedBrowserUser}
            browserProgram={selectedBrowserProgram}
          />
        </div>
      </div>
    </div>
  );
};
