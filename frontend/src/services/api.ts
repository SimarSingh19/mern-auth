import axios from "axios";
import type { ApiMessageResponse } from "../types/auth.types";

const api = axios.create({
  baseURL: "/api",
  timeout: 30_000,
});

let logoutTimer: ReturnType<typeof setTimeout> | undefined;
let onSessionExpired: (() => void) | undefined;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export function clearSession() {
  clearTimeout(logoutTimer);
  logoutTimer = undefined;
}

function expireSession() {
  clearSession();
  onSessionExpired?.();
}

export function setSessionExpiry(expiresAt: string) {
  const timeLeft = Date.parse(expiresAt) - Date.now();

  if (!Number.isFinite(timeLeft) || timeLeft <= 0) {
    throw new Error("Session expired. Please sign in again.");
  }
  clearSession();
  logoutTimer = setTimeout(expireSession, timeLeft);
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (axios.isAxiosError<ApiMessageResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default api;