import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { addBrowserUser, getUsers, initialState, selectBrowserUser } from './browserUsersSlice';

const DEFAULT_USER = initialState.selected;

const BrowserUsers = () => {
  const users = useAppSelector((state) => state.browserUsers.users);
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
    <div className="program-query">
      <p className="program-query__name">User:</p>
      <select
        className="program-query__select"
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
      <div className="program-query__add">
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
      </div>
    </div>
  );
};
export default BrowserUsers;
