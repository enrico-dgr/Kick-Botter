import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';
import { Queries } from './Queries';

export const App = () => {
  return (
    <div>
      <Queries name="users" id="users" queries={["First", "Second"]} />
      <Queries name="programs" id="programs" queries={["First", "Second"]} />
      {DisplaySettings({
        settings: {
          name: "Franco",
          surname: "Pagliaroto",
          randomObject: {
            name: "Enrico",
            surname: "Di Grazia",
          },
          ciao: 12321,
        },
      })}
    </div>
  );
};
