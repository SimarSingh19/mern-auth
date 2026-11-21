import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {forgotPasswordSchema, type ForgotPasswordFormValues} from "../schema/authSchema";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import axios from "axios";

export default function ForgotPasswordPage() {
const navigate = useNavigate();

  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {email: ""},
  });

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    try {
      const data = await authService.forgotPassword(email);
      toast.success(data.message);
      navigate("/reset-password", { state: { email } });
    } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.data?.code === "EMAIL_NOT_VERIFIED"
        ) {
          navigate("/verify-email", {
            state: { email: email },
          });

          return;
        }

        setError("root", {
          message: getErrorMessage(error),
        });
      }
  };

  return (
    <div className="form-content">
        <h2>Forgot your password?</h2>
        <p>Enter your email address to request a password reset code.</p>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting}>
            <div>
                <label htmlFor="email">Email address</label>
                <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                />
                {errors.email && (
                <p className="field-error" id="email-error">
                    {errors.email.message}
                </p>
                )}
            </div>

            {errors.root?.message && <p role="alert">{errors.root.message}</p>}

            <button type="submit">
                {isSubmitting ? "Sending…" : "Send reset code"}
            </button>
            </fieldset>
            <p className="text-center mt-3">Email verify nahi ki?{" "} 
              <Link to="/verify-email" state={{ email: watch("email") ?? "" }}>Verify email</Link>
            </p>
        </form>

        <footer>
            <Link to="/login">Back to sign in</Link>
        </footer>
    </div>
  );
}