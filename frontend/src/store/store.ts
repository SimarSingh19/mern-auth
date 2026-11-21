import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import adminUsersReducer from "./slices/adminUsersSlice";

export const store = configureStore({
    reducer: { 
        auth: authReducer,
        profile: profileReducer,
        adminUsers: adminUsersReducer
    } 
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;