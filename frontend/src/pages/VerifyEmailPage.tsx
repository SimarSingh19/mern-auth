import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { verifyEmailSchema } from "../schema/authSchema";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";

type VerifyEmailFormValues = {
  otp: string;
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state;

  const [email, setEmail] = useState(
    typeof routeState?.email === "string" ? routeState.email : "",
  );

  const [verificationId, setVerificationId] = useState(
    typeof routeState?.verificationId === "string"
      ? routeState.verificationId
      : "",
  );

  const [sending, setSending] = useState(false);
  const [error, setErrorMessage] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

const {
  register,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm<VerifyEmailFormValues>({
  resolver: zodResolver(verifyEmailSchema),
  defaultValues: { otp: "" },
});

async function sendOtp() {
  if (sending || isSubmitting || secondsLeft > 0) return;

  if (!email.trim()) {
    setErrorMessage("Please enter your email.");
    return;
  }

  setSending(true);
  setErrorMessage("");

  try {
    const data = await authService.sendVerificationOtp(email.trim());

    toast.success(data.message);

    if (data.verificationId) {
      setVerificationId(data.verificationId);
      reset({ otp: "" });
      setSecondsLeft(10);
    }
  } catch (error) {
  if (
    axios.isAxiosError<{ retryAfterSeconds?: number }>(error) &&
    error.response?.status === 429
  ) {
    setErrorMessage("");
    setSecondsLeft(error.response.data.retryAfterSeconds ?? 10);
    return;
  }

  setErrorMessage(getErrorMessage(error));
} finally {
    setSending(false);
  }
}

async function onSubmit(values: VerifyEmailFormValues) {
  if (!verificationId || sending) return;

  setErrorMessage("");

  try {
    const data = await authService.verifyEmail({
      verificationId,
      otp: values.otp,
    });

    toast.success(data.message);
    navigate("/login", { replace: true });
  } catch (error) {
    setErrorMessage(getErrorMessage(error));
  }
}

  return (
    <div className="form-content">
      <span className="eyebrow text-primary">VERIFY YOUR EMAIL</span>
      <h2>Email verification</h2>

      <p className="text-secondary mb-4">
        Request a verification code, then enter the 6-digit OTP from your email.
        It expires after 10 minutes.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="verificationEmail" className="form-label">
          Email address
        </label>

        <input
          id="verificationEmail"
          type="email"
          autoComplete="email"
          className="form-control"
          value={email}
          disabled={sending || isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value);
            setVerificationId("");
            setErrorMessage("");
            reset({ otp: "" });
          }}
        />
      </div>

{secondsLeft > 0 ? (
  <p className="text-center text-secondary mb-4" role="status">
    Resend OTP in {secondsLeft}s
  </p>
) : (
  <button
    type="button"
    className="btn btn-outline-primary w-100 mb-4"
    disabled={sending || isSubmitting || !email.trim()}
    onClick={() => void sendOtp()}
  >
    {sending ? "Sending…" : verificationId ? "Resend OTP" : "Send OTP"}
  </button>
)}

      {verificationId && (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={sending || isSubmitting}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`form-control ${errors.otp ? "is-invalid" : ""}`}
                {...register("otp")}
              />

              <div className="invalid-feedback">
                {errors.otp?.message}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              {isSubmitting ? "Verifying…" : "Verify email"}
            </button>
          </fieldset>
        </form>
      )}

      <p className="small text-secondary mt-3">
  Check your spam folder too. You can request another code after 10 seconds.
</p>

      <p className="text-center mt-4 mb-0">
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}