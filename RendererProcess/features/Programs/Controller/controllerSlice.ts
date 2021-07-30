import { createSlice, PayloadAction } from '@reduxjs/toolkit';

namespace Models {
  export interface RunningProgram {
    user: string;
    name: string;
  }

  export interface ControllerState {
    runningPrograms: RunningProgram[];
  }
}

// Define the initial state using that type
export const initialState: Models.ControllerState = {
  runningPrograms: [],
};

const controllerSlice = createSlice({
  name: "controller",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Models.RunningProgram>) => {
      state.runningPrograms.push(action.payload);
    },
    remove: (
      state,
      { payload: { user, name } }: PayloadAction<Models.RunningProgram>
    ) => {
      state.runningPrograms = state.runningPrograms.filter(
        (prog) => prog.name !== name || prog.user !== user
      );
    },
  },
});

// reducer for store
export const reducer = controllerSlice.reducer;
// actions

export const { add, remove } = controllerSlice.actions;
