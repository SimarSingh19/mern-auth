import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { registerSchema } from "../schema/authSchema";
import type { RegisterFormValues } from "../schema/authSchema";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";
import PasswordField from "../components/auth/PasswordField";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const data = await authService.register(values);
      toast.success(data.message);
      navigate("/verify-email", {
        state: { email: data.user.email, verificationId: data.verificationId },
      });
    } catch (error) {
      setError("root", { message: getErrorMessage(error) });
    }
  };

  return (
    <div className="form-content">
      <h2>Create your account</h2>
      <p>We’ll send a code to verify your email address.</p>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
              {...register("username")}
            />
            {errors.username && (<p className="field-error" id="username-error">{errors.username.message}</p>)}
          </div>

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
            {errors.email && (<p className="field-error" id="email-error">{errors.email.message}</p>)}
          </div>

          <PasswordField
            id="password"
            label="Password"
            registration={register("password")}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          {errors.root?.message && <p role="alert">{errors.root.message}</p>}

          <button type="submit">{isSubmitting ? "Creating account…" : "Create account"}</button>
        </fieldset>
      </form>

      <footer>
        Already have an account? <Link to="/login">Sign in</Link>
      </footer>
    </div>
  )
}
