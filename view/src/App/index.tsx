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
  const fetchSettings = (user_: string, program_: string) => {
    const settings_ =
      ipcRenderer.sendSync("getSettings", { user: user_, program: program_ }) ??
      {};
    setStateOfSettings((_pv) => settings_);
  };
  /**
   *  util
   */
  const areSettingsAvailable = () => Object.keys(settings).length > 0;
  /**
   * Save Settings
   */
  const saveSettings = async (
    user_: string,
    program_: string,
    settings: {}
  ) => {
    const res = (await ipcRenderer.invoke(
      "postSettings",
      { user: user_, program: program_ },
      settings
    )) as Response;
    //
    if (res.status !== 200) {
      console.error({
        status: res.status,
        statusText: res.statusText,
      });
      return res.status;
    }
    return res.status;
  };
  /**
   * Graphic Responses
   */
  const baseColor = () => "#f3f3f0";
  const goodResponseColor = () => "#9ffca3";
  const badReponseColor = () => "#ff5858";
  const [buttonColor, setButtonColor] = React.useState<string>(baseColor());
  /**
   *
   */
  return (
    <div>
      {/* Queries */}
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
      {/* Editor */}

      <button
        disabled={areSettingsAvailable() === false}
        color={buttonColor}
        onClick={() => {
          setButtonColor(goodResponseColor);
          saveSettings(user, program, settings).then((a) =>
            setButtonColor(a !== 200 ? goodResponseColor : badReponseColor)
          );
        }}
      >
        Save settings
      </button>
      {areSettingsAvailable() ? (
        <>
          <DisplaySettings
            settings={settings}
            onChange={(pv) => setStateOfSettings(pv)}
          />
        </>
      ) : (
        <p>This user has no settings for this program yet.</p>
      )}
    </div>
  );
};
