import * as browserProgramsSlice from './browserPrograms/browserProgramsSlice';
import * as browserUsersSlice from './browserUsers/browserUsersSlice';

export const reducers = {
  browserUsers: browserUsersSlice.reducer,
  browserPrograms: browserProgramsSlice.reducer,
};
