export interface User {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  role: "user" | "admin";
}

export interface ApiMessageResponse { 
  message: string 
}

export interface LoginValues { 
  email: string; 
  password: string 
}

export interface RegisterValues extends LoginValues {
  username: string 
}

export interface VerifyEmailValues { 
  verificationId: string;
  otp: string 
}

export interface LoginResponse extends ApiMessageResponse {
  user: User;
  expiresAt: string;
}

export interface UserResponse extends ApiMessageResponse {
  user: User;
  expiresAt: string;
}

export type VerificationResponse = ApiMessageResponse;

export interface RegisterResponse extends ApiMessageResponse {
  user: Omit<User, "id"> 
  verificationId: string;
}

export interface ResetPasswordValues {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AdminUserListResponse {
  users: {
    _id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    verified: boolean;
    profilePicture?: string | null;
    age?: number | null;
    condition?: string | null;
    weight?: number | null;
    gender?: string | null;
    city?: string | null;
    bio?: string | null;
  }[];
}

export interface UserProfile {
  age: number | null;
  condition: "good" | "bad" | "excellent" | "average" | null;
  weight: number | null;
  gender: string | null;
  city: string;
  bio: string;
  profilePicture: string | null;
}

export interface UserResponse extends ApiMessageResponse {
  user: User;
  profile: UserProfile;
  expiresAt: string;
}

export type SessionStatus = "checking" | "authenticated" | "guest" | "error";


export type AdminUser = AdminUserListResponse["users"][number];

export type AdminUserEditValues = {
  role: "user" | "admin";
  age: number | null;
  condition: string;
  weight: number | null;
  gender: string;
  city: string;
  bio: string;
};

export type AdminUserUpdateResponse = {
  message: string;
  user: AdminUser;
};


export type SendVerificationOtpResponse = {
  message: string;
  verificationId: string | null;
};