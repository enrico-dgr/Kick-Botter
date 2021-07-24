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
    <div className="program-user">
      <p className="program-user__description">User:</p>
      <div className="program-user__controller">
        <select
          className="program-user__controller__select"
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
        <div className="program-user__controller__add">
          <input
            type="text"
            placeholder="Add User"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
          />
          <button
            className="primary-button"
            disabled={newUser.length < 2}
            onClick={() => dispatch(addBrowserUser(newUser))}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
export default BrowserUsers;
