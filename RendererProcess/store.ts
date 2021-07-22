import { configureStore } from '@reduxjs/toolkit';

import { reducers } from './features';

const store = configureStore({
  reducer: reducers,
});

export type RootState = ReturnType<typeof store.getState>;
/**
 * Inferred type from reducers
 */
export type AppDispatch = typeof store.dispatch;

export default store;
