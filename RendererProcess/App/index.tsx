import { ipcRenderer } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as React from 'react';

import { ProgramController as PC } from '../../Programs';
import { Errors } from '../../TypeGuards';
import * as fpTG from '../../TypeGuards/fp-ts';
import BrowserPrograms from '../features/browserPrograms/BrowserPrograms';
import BrowserUsers from '../features/browserUsers/BrowserUsers';
import { useAppSelector } from '../hooks';
import { DisplaySettings } from './DisplaySettings';
import { RunProgram } from './RunProgram';

export const App = () => {
  const selectedBrowserUser = useAppSelector(
    (state) => state.browserUsers.selected
  );
  const selectedBrowserProgram = useAppSelector(
    (state) => state.browserPrograms.selected
  );

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
      TE.map((settings_) => {
        setStateOfSettings((_pv) =>
          settings_.launchOptions.userDataDir !== undefined ? settings_ : {}
        );
      })
    )();

  React.useEffect(() => {
    getSettings(selectedBrowserUser, selectedBrowserProgram);
  }, []);
  React.useEffect(() => {
    getSettings(selectedBrowserUser, selectedBrowserProgram);
  }, [selectedBrowserUser, selectedBrowserProgram]);

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

  return (
    <div>
      <p>User:</p>
      <BrowserUsers />
      <p>Program:</p>
      <BrowserPrograms />
      <br />
      <button
        disabled={areSettingsAvailable() === false}
        onClick={() => {
          saveSettings(selectedBrowserUser, selectedBrowserProgram, settings);
        }}
      >
        Save settings
      </button>
      <RunProgram
        user={selectedBrowserUser}
        nameOfProgram={selectedBrowserProgram}
        disabled={selectedBrowserProgram === "none"}
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
