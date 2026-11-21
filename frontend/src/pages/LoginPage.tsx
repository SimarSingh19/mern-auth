import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../schema/authSchema";
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/slices/authSlice";
import PasswordField from "../components/auth/PasswordField";
import { getErrorMessage } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });
  const onSubmit = async (values: LoginFormValues) => {
  try {
    const user = await dispatch(login(values)).unwrap();

    navigate(
      user.role === "admin" ? "/admin/dashboard" : "/dashboard",
      { replace: true },
    );
  } catch (error) {
  if (
    error === "EMAIL_NOT_VERIFIED" ||
    error === "Please verify your email"
  ) {
    navigate("/verify-email", {
      state: { email: values.email },
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
      <h2>Sign in to your account</h2>

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
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

          <PasswordField
            id="password"
            label="Password"
            registration={register("password")}
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <Link className="forgot-link" to="/forgot-password">
            Forgot password?
          </Link>

          {errors.root?.message && <p role="alert">{errors.root.message}</p>}

          <button type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </fieldset>
      </form>

      <footer>
        New here? <Link to="/register">Create an account</Link>
      </footer>
    </div>
  )
}
