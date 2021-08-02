import * as React from 'react';

import Programs from '../../features/Programs';
import { useAppSelector } from '../../hooks';
import OpenLocal from './openLocal/OpenLocal';
import ProgramMain from './ProgramMain';
import ProgramsComponents from './Programs';

const Body = () => {
  const selectedBrowserUser = useAppSelector(
    (state) => state.browserUsers.selected
  );
  const selectedBrowserProgram = useAppSelector(
    (state) => state.browserPrograms.selected
  );

  return (
    <div className="app__body">
      <div className="app__body__central">
        <div className="app__body__central__header">
          <h1>Handle Browser Bots</h1>
          <p>Here you can start and stop browser bots.</p>
        </div>
        <div className="app__body__central__tool-bar">
          <OpenLocal />
        </div>
        <div className="app__body__central__program-controller">
          <div className="app__body__central__program-controller__queries card">
            <Programs.BrowserUsers />
            <Programs.BrowserPrograms />
          </div>
          <div className="app__body__central__program-controller__main card">
            <ProgramMain
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
  );
};

export default Body;
