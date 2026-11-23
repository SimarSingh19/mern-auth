import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import PasswordField from "../components/auth/PasswordField";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schema/authSchema";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    typeof location.state?.email === "string"
      ? location.state.email.trim()
      : "";

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ otp, newPassword }: ResetPasswordFormValues) => {
    try {
      const data = await authService.resetPassword({ email, otp, newPassword });

      toast.success(data.message);
      navigate("/login", { replace: true });
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  };

  if (!email) {
    return (
      <div className="form-content">
        <h2>Reset your password</h2>
        <p>Enter your email first to request a reset code.</p>
        <Link to="/forgot-password" replace>Request a reset code</Link>
      </div>
    );
  }

  return (
    <div className="form-content">
      <h2>Reset your password</h2>
      <p>Enter the 6-digit code from your email and choose a new password.</p>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <div>
            <label htmlFor="otp">Reset code</label>
            <input
              id="otp"
              className="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-invalid={Boolean(errors.otp)}
              aria-describedby={errors.otp ? "otp-error" : undefined}
              {...register("otp")}
            />
            {errors.otp && (<p className="field-error" id="otp-error">{errors.otp.message}</p>)}
          </div>

          <PasswordField
            id="newPassword"
            label="New password"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          {errors.root?.message && <p role="alert">{errors.root.message}</p>}

          <button type="submit">{isSubmitting ? "Resetting…" : "Reset password"}</button>
        </fieldset>
      </form>

      <footer>
        <Link to="/forgot-password">Request a new code</Link>
      </footer>
    </div>
  )
}
