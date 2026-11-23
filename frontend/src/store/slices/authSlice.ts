import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import type { User, SessionStatus, LoginValues } from "../../types/auth.types";
import axios from "axios";

export const login = createAsyncThunk<User, LoginValues, { rejectValue: string }>("auth/login", async (values, { rejectWithValue }) => {
    try {
      const data = await authService.login(values);
      return data.user;
    }
    catch (error) { 
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk<string, boolean, { rejectValue: string }>("auth/logout", async (allSessions, { rejectWithValue }) => {
    try { 
      const data = await authService.logout(allSessions);
      return data.message;
    }
    catch (error) {
  if (axios.isAxiosError(error) && error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
    return rejectWithValue("EMAIL_NOT_VERIFIED");
  }

  return rejectWithValue(getErrorMessage(error));
}
  },
);

export const restoreSession = createAsyncThunk<User | null, void, {rejectValue: string}>("auth/restoreSession", async (_, { rejectWithValue }) => { 
  try {
    const profile = await authService.restoreSession();
    return profile?.user ?? null;
  } 
  catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

interface AuthState {
  user: User | null;
  status: SessionStatus;
  busy: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "checking",
  busy: false, 
  error: null 
};

const authSlice = createSlice({
  name: "auth", 
  initialState,
  reducers: {
    sessionExpired(state) { 
      state.user = null; 
      state.status = "guest"; 
    },
  },

  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
          state.busy = true;
          state.error = null; 
      })
      .addCase(login.fulfilled, (state, action) => {
          state.busy = false;
          state.user = action.payload; 
          state.status = "authenticated";
      })
      .addCase(login.rejected, (state, action) => {
          state.busy = false;
          state.error = action.payload ?? "Login failed";
      })

      .addCase(logout.pending, state => {
          state.busy = true;
          state.error = null;
      })
      .addCase(logout.fulfilled, state => {
          state.busy = false; 
          state.user = null; 
          state.status = "guest";
      })
      .addCase(logout.rejected, (state, action) => {
          state.busy = false; 
          state.error = action.payload ?? "Logout failed";
      })

      .addCase(restoreSession.pending, (state) => {
        state.status = "checking";
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "guest";
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.user = null;
        state.status = "error";
        state.error = action.payload ?? "Could not check your session.";
      })
  },
});
export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
