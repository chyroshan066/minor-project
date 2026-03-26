import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { api } from "./services/api";
import { configuratorReducer } from "./features/configurator/configuratorSlice";

const rootReducer = combineReducers({
  configurator: configuratorReducer,
  [api.reducerPath]: api.reducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
