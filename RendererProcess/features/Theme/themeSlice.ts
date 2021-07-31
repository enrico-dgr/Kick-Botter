import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export namespace Models {
  export type ThemeName = "Day" | "Night";

  export interface ThemeState {
    name: ThemeName;
  }
}

// Define the initial state using that type
export const initialState: Models.ThemeState = {
  name: "Day",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Models.ThemeName>) => {
      state.name = action.payload;
    },
  },
});

// reducer for store
export const reducer = themeSlice.reducer;
// actions

export const { set } = themeSlice.actions;
