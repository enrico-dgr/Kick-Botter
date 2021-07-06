import { ipcRenderer } from 'electron';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';
import { Queries } from './Queries';

export type Props = {
  users: string[];
  programs: string[];
};

export const App = (props: Props) => {
  /**
   * States
   */
  const [user, setUser] = React.useState<string>("unknown");
  const [program, setProgram] = React.useState<string>("unknown");
  const [settings, setStateOfSettings] = React.useState({});
  /**
   * Fetch new settings
   */
  const fetchSettings = (user: string, program: string) => {
    const settings_ = ipcRenderer.sendSync("getSettings", { user, program });
    setStateOfSettings((_pv) => settings_);
  };
  /**
   *
   */
  return (
    <div>
      <Queries
        name="users"
        id="users"
        queries={props.users}
        defaultMessage="Select a User"
        onChange={(v) => {
          setUser((_pv) => v);
          fetchSettings(v, program);
        }}
      />
      <Queries
        name="programs"
        id="programs"
        queries={props.programs}
        defaultMessage="Select a Program"
        onChange={(v) => {
          setProgram((_pv) => v);
          fetchSettings(user, v);
        }}
      />
      <DisplaySettings
        settings={settings}
        onChange={(pv) => setStateOfSettings(pv)}
      />
    </div>
  );
};
