import api, {clearSession, setSessionExpiry} from "./api";
import type {ApiMessageResponse,LoginValues,LoginResponse,RegisterValues,RegisterResponse,VerifyEmailValues,VerificationResponse,UserResponse,
   ResetPasswordValues, AdminUserListResponse,
    AdminUserEditValues,
  AdminUserUpdateResponse,SendVerificationOtpResponse
} from "../types/auth.types";

export const authService = {
  register: async (values: RegisterValues) => {
    const response = await api.post<RegisterResponse>("/auth/register",values);
    return response.data;
  },

  verifyEmail: async (values: VerifyEmailValues) => {
    const response = await api.post<VerificationResponse>("/auth/verify-email",values);
    return response.data;
  },

  login: async (values: LoginValues) => {
    const response = await api.post<LoginResponse>("/auth/login",values);
    setSessionExpiry(response.data.expiresAt);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<UserResponse>("/auth/get-me");
    return response.data;
  },

  logout: async (allSessions = false) => {
    let endpoint = "/auth/logout";
    if (allSessions) {
      endpoint = "/auth/logout-all";
    }

    const response = await api.post<ApiMessageResponse>(endpoint);
    clearSession();
    return response.data;
  },

  restoreSession: async () => {
    const response = await api.get<UserResponse>("/auth/get-me");

    if (response.status === 204) {
      return null;
    }

    setSessionExpiry(response.data.expiresAt);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiMessageResponse>("/auth/forgot-password", {email});
    return response.data;
  },

  resetPassword: async (values: ResetPasswordValues) => {
    const response = await api.post<ApiMessageResponse>("/auth/reset-password", values);
    return response.data;
  },


  getAdminUsers: async () => {
    const response = await api.get<AdminUserListResponse>("/auth/admin/users");
    return response.data.users;
  },

  updateProfile: async (formData: FormData) => {
    const response = await api.patch("/auth/profile", formData);
    return response.data;
  },

  updateProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await api.patch<ApiMessageResponse & { profilePicture: string }>("/auth/profile/picture", formData);
    return response.data;
  },

  deleteAdminUser: async (userId: string) => {
    const response = await api.delete<{ message: string }>(`/auth/admin/users/${userId}`,);
    return response.data;
  },

  updateAdminUser: async (userId: string,values: AdminUserEditValues) => {
    const response = await api.patch<AdminUserUpdateResponse>(`/auth/admin/users/${userId}`,values);
    return response.data;
  },


  sendVerificationOtp: async (email: string) => {
    const response = await api.post<SendVerificationOtpResponse>("/auth/send-verification-otp",{email});
    return response.data;
  },
};