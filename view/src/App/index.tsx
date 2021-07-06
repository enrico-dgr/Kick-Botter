import { ipcRenderer } from 'electron';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';
import { Queries } from './Queries';

export type Props = {
  users: string[];
  programs: string[];
};

export const App = (props: Props) => {
  const settings = ipcRenderer.sendSync("getSettings", { users, programs });
  return (
    <div>
      <Queries name="users" id="users" queries={props.users} />
      <Queries name="programs" id="programs" queries={props.programs} />
      {DisplaySettings({
        settings: props.settings,
      })}
    </div>
  );
};
