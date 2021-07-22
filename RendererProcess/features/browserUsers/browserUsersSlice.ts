import * as t from 'io-ts';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { invoke } from '../../asyncThunks/IPCs';

namespace Models {
  export interface BrowserUsersState {
    users: string[];
  }

  export const GetUserResponse = t.type({
    users: t.array(t.string),
  });
}

// Define the initial state using that type
const initialState: Models.BrowserUsersState = {
  users: [],
};

const getUsers = invoke("getUsers")(Models.GetUserResponse);

const browserUsersSlice = createSlice({
  name: "browserUsers",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<string>) => {
      state.users.push(action.payload);
      state.users.sort((a, b) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
    },
    remove: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.users = action.payload.users;
    });
  },
});

// reducer for store
export const reducer = browserUsersSlice.reducer;
// actions
export { getUsers };
export const actions = browserUsersSlice.actions;
