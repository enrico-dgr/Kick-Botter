import { ipcRenderer } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import * as React from 'react';

import { ProgramController as PC } from '../logic';
import { Errors } from '../TypeGuards';
import * as fpTG from '../TypeGuards/fp-ts';
import { DisplaySettings } from './DisplaySettings';
import { GetText } from './GetText';
import { Queries } from './Queries';
import { RunProgram } from './RunProgram';

export const App = () => {
  const [user, setUser] = React.useState<string>("unknown");
  const [nameOfProgram, setNameOfProgram] = React.useState<string>("unknown");
  const [settings, setStateOfSettings] = React.useState({});

  const getSettings = (user_: string, program_: string) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode({
        user: user_,
        name: program_,
      }),
      E.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.fromEither,
      TE.chain((validatedQueries) =>
        pipe(
          () => ipcRenderer.invoke("getSettings", validatedQueries),
          // validate data and extract right
          T.map((opts) =>
            fpTG.Either.Either(
              Errors.Error,
              PC.Models.ProgramOptionsPropsOnly
            ).decode(opts)
          ),
          TE.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
          TE.chain(
            E.match(
              TE.left,
              (asd): TE.TaskEither<Error, PC.Models.ProgramOptionsPropsOnly> =>
                TE.right(asd)
            )
          )
          //
        )
      ),
      TE.map((settings_) =>
        setStateOfSettings((_pv) =>
          settings_.launchOptions.userDataDir !== undefined ? settings_ : {}
        )
      )
    )();

  const areSettingsAvailable = () => Object.keys(settings).length > 0;

  const saveSettings = async (
    user_: string,
    nameOfProgram_: string,
    settings: {}
  ) => {
    const queries: PC.Models.ProgramDatabasesSharedProps = {
      user: user_,
      name: nameOfProgram_,
    };
    ipcRenderer.invoke("postSettings", queries, settings);
  };

  const [listPrograms, setListPrograms] = React.useState<string[]>(["none"]);

  const [listUsers, setListUsers] = React.useState<string[]>(["none"]);
  const updateListUsers = (value: string) => {
    if (listUsers.indexOf(value) < 0) setListUsers((pv) => [value, ...pv]);
  };
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
    )();
    // load programs
    pipe(
      () => ipcRenderer.invoke("getPrograms"),
      T.map((either) =>
        t
          .type({
            names: t.array(t.string),
          })
          .decode(either)
      ),
      TE.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.match(
        (e) => console.error(e.message),
        (res) => setListPrograms(res.names)
      )
    )();
  }, []);
  return (
    <div>
      {/* Queries */}
      <div>
        <Queries
          name="users"
          id="users"
          queries={listUsers}
          default={{ message: "Select a User", query: "none" }}
          onChange={(v) => {
            setUser((_pv) => v);
            getSettings(v, nameOfProgram);
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
        default={{ message: "Select a Program", query: "none" }}
        onChange={(v) => {
          setNameOfProgram((_pv) => v);
          getSettings(user, v);
        }}
      />
      {/* Editor */}

      <button
        disabled={areSettingsAvailable() === false}
        onClick={() => {
          saveSettings(user, nameOfProgram, settings);
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
