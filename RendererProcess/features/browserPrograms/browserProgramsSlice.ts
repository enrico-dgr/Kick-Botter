import * as t from 'io-ts';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { invoke } from '../../asyncThunks/IPCs';

namespace Models {
  export interface BrowserUsersState {
    names: string[];
    selected: string;
  }

  export const GetProgramsResponse = t.type({
    names: t.array(t.string),
  });
}

// Define the initial state using that type
export const initialState: Models.BrowserUsersState = {
  names: [],
  selected: "none",
};

const getPrograms = invoke("getPrograms")(Models.GetProgramsResponse);

const browserProgramsSlice = createSlice({
  name: "browserPrograms",
  initialState,
  reducers: {
    select: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPrograms.fulfilled, (state, action) => {
      state.names = action.payload.names;
    });
  },
});

// reducer for store
export const reducer = browserProgramsSlice.reducer;
// actions
export { getPrograms };
export const { select: selectBrowserProgram } = browserProgramsSlice.actions;
