import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  currentUser: {
    name: 'Admin',
    email: 'admin@abc-avm.com',
    role: 'admin',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

export const { toggleSidebar, setCurrentUser } = uiSlice.actions;
export default uiSlice.reducer;
