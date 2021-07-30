import BrowserPrograms from './browserPrograms/BrowserPrograms';
import * as browserProgramsSlice from './browserPrograms/browserProgramsSlice';
import BrowserUsers from './browserUsers/BrowserUsers';
import * as browserUsersSlice from './browserUsers/browserUsersSlice';
import Controller from './Controller';
import * as controllerSlice from './Controller/controllerSlice';

export const reducers = {
  browserUsers: browserUsersSlice.reducer,
  browserPrograms: browserProgramsSlice.reducer,
  controller: controllerSlice.reducer,
};
export default { BrowserPrograms, BrowserUsers, Controller };
