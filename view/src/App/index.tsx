import { ipcRenderer } from 'electron';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';
import { GetText } from './GetText';
import { Queries } from './Queries';
import { RunProgram } from './RunProgram';

export type Props = {
  users: string[];
  programs: string[];
};

export const App = (props: Props) => {
  /**
   * States
   */
  const [user, setUser] = React.useState<string>("unknown");
  const [nameOfProgram, setNameOfProgram] = React.useState<string>("unknown");
  const [settings, setStateOfSettings] = React.useState({});
  /**
   * Fetch new settings
   */
  const fetchSettings = (user_: string, program_: string) => {
    const settings_ =
      ipcRenderer.sendSync("getSettings", { user: user_, program: program_ }) ??
      {};
    setStateOfSettings((_pv) => settings_);
    setButtonColor((_pv) => baseColor());
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
    nameOfProgram_: string,
    settings: {}
  ) => {
    const res = (await ipcRenderer.invoke(
      "postSettings",
      { user: user_, nameOfProgram: nameOfProgram_ },
      settings
    )) as Response;
    //
    if (res.status !== 200) {
      console.error({
        status: res.status,
        statusText: res.statusText,
      });
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
  const [listUsers, setListUsers] = React.useState<string[]>(props.users);
  const updateListUsers = (value: string) => {
    if (listUsers.indexOf(value) < 0) setListUsers((pv) => [value, ...pv]);
  };
  return (
    <div>
      {/* Queries */}
      <div>
        <Queries
          name="users"
          id="users"
          queries={listUsers}
          defaultMessage="Select a User"
          onChange={(v) => {
            setUser((_pv) => v);
            fetchSettings(v, nameOfProgram);
          }}
        />
        <GetText
          buttonText="Add User"
          onClick={(value) => updateListUsers(value)}
        />
      </div>
      <Queries
        name="programs"
        id="programs"
        queries={props.programs}
        defaultMessage="Select a Program"
        onChange={(v) => {
          setNameOfProgram((_pv) => v);
          fetchSettings(user, v);
        }}
      />
      {/* Editor */}

      <button
        disabled={areSettingsAvailable() === false}
        style={{
          backgroundColor: buttonColor,
        }}
        onClick={() => {
          saveSettings(user, nameOfProgram, settings).then((a) =>
            setButtonColor((_pv) =>
              a === 200 ? goodResponseColor() : badReponseColor()
            )
          );
        }}
      >
        Save settings
      </button>
      <RunProgram
        user={user}
        nameOfProgram={nameOfProgram}
        disabled={user === "unknown" || nameOfProgram === "unknown"}
      />
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
