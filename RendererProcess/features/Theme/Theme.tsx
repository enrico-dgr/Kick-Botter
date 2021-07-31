import * as React from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { Models, set } from './themeSlice';

const Theme = () => {
  const dispatch = useAppDispatch();
  const themeName = useAppSelector((state) => state.theme.name);

  const themeButton = (themeName_: Models.ThemeName) => {
    return (
      <button
        className="theme__button"
        disabled={themeName_ === themeName}
        onClick={() => dispatch(set(themeName_))}
      >
        {themeName_}
      </button>
    );
  };

  return (
    <div className="theme">
      {themeButton("Day")}
      {themeButton("Night")}
    </div>
  );
};

export default Theme;
