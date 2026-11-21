import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import type {
  AdminUserEditValues,
  AdminUserUpdateResponse,
} from "../../types/auth.types";

type UpdateUserPayload = {
  userId: string;
  values: AdminUserEditValues;
};

export const updateAdminUser = createAsyncThunk<
  AdminUserUpdateResponse,
  UpdateUserPayload,
  { rejectValue: string }
>(
  "adminUsers/updateUser",
  async ({ userId, values }, { rejectWithValue }) => {
    try {
      return await authService.updateAdminUser(userId, values);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

type AdminUsersState = {
  updating: boolean;
  error: string | null;
};

const initialState: AdminUsersState = {
  updating: false,
  error: null,
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    clearUpdateError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAdminUser.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload ?? "Could not update user.";
      });
  },
});

export const { clearUpdateError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;