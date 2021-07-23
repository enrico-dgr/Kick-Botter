import * as t from 'io-ts';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { invoke } from '../../asyncThunks/IPCs';

namespace Models {
  export interface BrowserProgramsState {
    names: string[];
    selected: string;
  }

  export const GetProgramsResponse = t.type({
    users: t.array(t.string),
  });
}

// Define the initial state using that type
export const initialState: Models.BrowserProgramsState = {
  names: [],
  selected: "generic",
};

const getUsers = invoke("getUsers")(Models.GetProgramsResponse);

const browserUsersSlice = createSlice({
  name: "browserUsers",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<string>) => {
      state.names.push(action.payload);
      state.names.sort((a, b) => {
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
      state.names = state.names.filter((user) => user !== action.payload);
    },
    select: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.names = action.payload.users;
    });
  },
});

// reducer for store
export const reducer = browserUsersSlice.reducer;
// actions
export { getUsers };
export const {
  add: addBrowserUser,
  remove: removeBrowserUser,
  select: selectBrowserUser,
} = browserUsersSlice.actions;
