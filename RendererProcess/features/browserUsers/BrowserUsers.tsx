import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { actions, getUsers } from './browserUsersSlice';

const DEFAULT_USER = "generic";

const BrowserUsers = () => {
  const users = useAppSelector((state) => state.browserUsers.users);
  const [selectedUser, setSelectedUser] = useState<string>(users[0]);
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
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
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
        onClick={() => dispatch(actions.add(newUser))}
      >
        Add user
      </button>
    </>
  );
};
export default BrowserUsers;
