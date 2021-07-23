import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { addBrowserUser, getUsers, initialState, selectBrowserUser } from './browserUsersSlice';

const DEFAULT_USER = initialState.selected;

const BrowserUsers = () => {
  const users = useAppSelector((state) => state.browserUsers.names);
  const selectedBrowserUser = useAppSelector(
    (state) => state.browserUsers.selected
  );

  const [newUser, setNewUser] = useState<string>("");
  const dispatch = useAppDispatch();

  // on mount
  React.useEffect(() => {
    dispatch(getUsers());
  }, []);

  return (
    <>
      <select
        name="browserUsers"
        id="browserUsers"
        value={selectedBrowserUser}
        onChange={(e) => dispatch(selectBrowserUser(e.target.value))}
      >
        <option value={DEFAULT_USER}>{DEFAULT_USER}</option>

        {users.map((mappedUser) => (
          <option value={mappedUser} key={mappedUser}>
            {mappedUser}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={newUser}
        onChange={(e) => setNewUser(e.target.value)}
      />
      <button
        disabled={newUser.length < 2}
        onClick={() => dispatch(addBrowserUser(newUser))}
      >
        Add user
      </button>
    </>
  );
};
export default BrowserUsers;
