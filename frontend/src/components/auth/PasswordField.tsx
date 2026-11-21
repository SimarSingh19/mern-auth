import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
interface PasswordFieldProps {
  id: string; 
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete: "current-password" | "new-password";
}
export default function PasswordField({ id, label, registration, error, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div className="mb-3">
        <label className="form-label" htmlFor={id}>{label}</label>
        <div className="input-group">
          <input id={id} type={visible ? "text" : "password"} autoComplete={autoComplete}
            className={`form-control ${error ? "is-invalid" : ""}`} {...registration} />
          <button className="btn btn-outline-secondary" type="button" aria-pressed={visible}
            onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button>
        </div>
        {error && <div className="invalid-feedback d-block" id={`${id}-error`}>{error}</div>}
      </div>
    </>
  )
}
