import { ipcRenderer } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import * as React from 'react';
import { Errors } from 'src/TypeGuards';

import * as fpTG from '../TypeGuards/fp-ts';
import { DisplaySettings } from './DisplaySettings';
import { GetText } from './GetText';
import { Queries } from './Queries';
import { RunProgram } from './RunProgram';

export const App = () => {
  /**
   * States
   */
  const [user, setUser] = React.useState<string>("unknown");
  const [nameOfProgram, setNameOfProgram] = React.useState<string>("unknown");
  const [settings, setStateOfSettings] = React.useState({});
  /**
   * Fetch new settings
   */
  const fetchSettings = (user_: string, program_: string) =>
    ipcRenderer
      .invoke("getSettings", { user: user_, program: program_ })
      .then((settings_) => setStateOfSettings((_pv) => settings_));

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
  // component did mount
  React.useEffect(() => {
    // load users
    pipe(
      () => ipcRenderer.invoke("getUsers"),
      T.map((either) =>
        fpTG.Either.Either(
          Errors.Error,
          t.type({
            users: t.array(t.string),
          })
        ).decode(either)
      ),
      TE.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.map(
        E.match(
          (e) => console.error(e.message),
          (res) => setListUsers(res.users)
        )
      )
    );
    // load programs
    pipe(
      () => ipcRenderer.invoke("getPrograms"),
      T.map((either) =>
        fpTG.Either.Either(
          Errors.Error,
          t.type({
            names: t.array(t.string),
          })
        ).decode(either)
      ),
      TE.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.map(
        E.match(
          (e) => console.error(e.message),
          (res) => setListPrograms(res.names)
        )
      )
    );
  }, []);
  const [listPrograms, setListPrograms] = React.useState<string[]>(["none"]);

  const [listUsers, setListUsers] = React.useState<string[]>(["none"]);
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
        queries={listPrograms}
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
