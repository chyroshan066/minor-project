import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfiguratorState {
  isOpen: boolean;
  fixedNavbar: boolean;
  sidenavType: "transparent" | "white";
}

const initialState: ConfiguratorState = {
  isOpen: false,
  fixedNavbar: false, // Default to fixed
  sidenavType: "transparent",
};

export const configuratorSlice = createSlice({
  name: "configurator",
  initialState,
  reducers: {
    toggleConfigurator: (state) => {
      state.isOpen = !state.isOpen;
    },
    setConfiguratorOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setFixedNavbar: (state, action: PayloadAction<boolean>) => {
      state.fixedNavbar = action.payload;
    },
    setSidenavType: (
      state,
      action: PayloadAction<ConfiguratorState["sidenavType"]>
    ) => {
      state.sidenavType = action.payload;
    },
  },
});

export const {
  toggleConfigurator,
  setConfiguratorOpen,
  setFixedNavbar,
  setSidenavType,
} = configuratorSlice.actions;
export const configuratorReducer = configuratorSlice.reducer;
