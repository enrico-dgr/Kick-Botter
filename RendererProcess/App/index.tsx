import * as React from 'react';

import { useAppSelector } from '../hooks';
import Body from './Body';
import Header from './Header';

export const App = () => {
  const themeName = useAppSelector((state) => state.theme.name);

  return (
    <div className={"app " + "app--" + themeName.toLowerCase()}>
      <Header />
      <Body />
    </div>
  );
};
