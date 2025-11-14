import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  loading: false,
  notifications: [],
  alertas: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
    setAlertas: (state, action) => {
      state.alertas = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  removeNotification,
  setAlertas,
} = uiSlice.actions;

export default uiSlice.reducer;
