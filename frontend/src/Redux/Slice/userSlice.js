import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetching: false,
  user: {
    username: null,
    isAuthenticated: false,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsFetching: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      console.log(action);
      state.user.username = action.payload.username;
      state.user.isAuthenticated = true;
      state.isFetching = false;
    },
    loginFailure: (state) => {
      state.user.username = null;
      state.user.isAuthenticated = false;
      state.isFetching = false;
    },
  },
});

export const {
  setIsFetching,
  loginSuccess,
  loginFailure,
} = userSlice.actions;

export default userSlice.reducer;