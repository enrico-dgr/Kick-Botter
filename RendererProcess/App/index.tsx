import * as React from 'react';

import Programs from '../features/Programs';
import Theme from '../features/Theme';
import { useAppSelector } from '../hooks';
import OpenLocal from './openLocal/OpenLocal';
import ProgramsComponents from './Programs';
import ProgramSettings from './ProgramSettings';

export const App = () => {
  const selectedBrowserUser = useAppSelector(
    (state) => state.browserUsers.selected
  );
  const selectedBrowserProgram = useAppSelector(
    (state) => state.browserPrograms.selected
  );
  const themeName = useAppSelector((state) => state.theme.name);

  return (
    <div className={"app " + "app--" + themeName.toLowerCase()}>
      <div className="app__header">
        <div></div>
        <Theme />
      </div>
      <div className="app__body">
        <div className="app__body__central">
          <div className="app__body__central__header">
            <h1>Handle Browser Bots</h1>
            <p>Here you can start and stop browser bots.</p>
          </div>
          <div className="program__tool-bar">
            <OpenLocal />
          </div>
          <div className="program-controller">
            <div className="program-controller__queries">
              <Programs.BrowserUsers />
              <Programs.BrowserPrograms />
            </div>
            <div className="program-controller__main">
              <Programs.Controller.Run
                user={selectedBrowserUser}
                name={selectedBrowserProgram}
                disabled={selectedBrowserProgram === "none"}
              />

              <ProgramSettings
                browserUser={selectedBrowserUser}
                browserProgram={selectedBrowserProgram}
              />
            </div>
          </div>
        </div>
        <div className="app__body__right">
          <ProgramsComponents.ListRunningOnes />
        </div>
      </div>
    </div>
  );
};
