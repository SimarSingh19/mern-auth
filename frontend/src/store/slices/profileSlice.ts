import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import type { UserProfile } from "../../types/auth.types";
import { logout, sessionExpired } from "./authSlice";

export const loadProfile = createAsyncThunk<UserProfile, void, {rejectValue: string}>("profile/load",async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.profile;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const saveProfile = createAsyncThunk<UserProfile, FormData, { rejectValue: string }>("profile/save", async (values, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(values);
    return response.profile;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const uploadProfilePicture = createAsyncThunk<string, File, { rejectValue: string }>("profile/uploadPicture",async (file, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfilePicture(file);
      return response.profilePicture;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

interface ProfileState {
  data: UserProfile | null;
  busy: boolean;
  error: string | null;
  requestId: string | null;
}

const initialState: ProfileState = {
  data: null,
  busy: false,
  error: null,
  requestId: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(loadProfile.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.data = action.payload;
        })
        .addCase(saveProfile.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId || !state.data) return;
            Object.assign(state.data, action.payload);
        })
        .addCase(uploadProfilePicture.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId || !state.data) return;
            state.data.profilePicture = action.payload;
        })
        .addCase(logout.fulfilled, () => initialState)
        .addCase(sessionExpired, () => initialState)

        .addMatcher((action) =>
            loadProfile.pending.match(action) || saveProfile.pending.match(action) || uploadProfilePicture.pending.match(action),(state, action) => {
                state.busy = true;
                state.error = null;
                state.requestId = action.meta.requestId;
            },
        )
        .addMatcher((action) => 
            loadProfile.rejected.match(action) || saveProfile.rejected.match(action) || uploadProfilePicture.rejected.match(action),(state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.error = action.payload ?? "Something went wrong.";
            },
        )
      .addMatcher((action) =>
          loadProfile.settled(action) || saveProfile.settled(action) || uploadProfilePicture.settled(action), (state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.busy = false;
                state.requestId = null;
            },
        );
    },
});

export default profileSlice.reducer;