import { useEffect,useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { loadProfile } from "../store/slices/profileSlice";
import { getErrorMessage } from "../services/api";
import ProfilePage from "./ProfilePage";

import type { AdminUser } from "../types/auth.types";
import { authService } from "../services/authService";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const { user, busy: signingOut } = useAppSelector((state) => state.auth);
  const { data: profile, busy: profileBusy } = useAppSelector((state) => state.profile);

  const [error, setError] = useState("");
  const actionsDisabled = signingOut || profileBusy;

  useEffect(() => {
  if (user?.role !== "admin") {
    setSummaryLoading(false);
    return;
  }

  async function loadMembers() {
    try {
      const data = await authService.getAdminUsers();
      setUsers(data);
    } catch (error) {
      setSummaryError(getErrorMessage(error));
    } finally {
      setSummaryLoading(false);
    }
  }

  void loadMembers();
}, [user?.role]);

  const signOut = async (all: boolean) => {
    setError("");
    try {
      const message = await dispatch(logout(all)).unwrap();
      toast.success(message);
      navigate("/login", { replace: true });
    } catch (failed) {
      setError(typeof failed === "string" ? failed : getErrorMessage(failed));
    }
  };

  const refreshProfile = async () => {
    setError("");
    try {
      await dispatch(loadProfile()).unwrap();
      toast.success("Profile refreshed");
    } catch (failed) {
      setError(typeof failed === "string" ? failed : getErrorMessage(failed));
    }
  };

const summaryCards = [
  {
    label: "Total members",
    value: users.length,
    tone: "blue",
  },
  {
    label: "Age above 50",
    value: users.filter((user) => (user.age ?? 0) > 50).length,
    tone: "orange",
  },
  {
    label: "Admins",
    value: users.filter((user) => user.role === "admin").length,
    tone: "purple",
  },
  {
    label: "Users",
    value: users.filter((user) => user.role === "user").length,
    tone: "green",
  },
];

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-width">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              {user?.role === "admin" ? "A" : "U"}
            </span>
            {user?.role === "admin" ? "Admin Account" : "User Account"}
          </span>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-button"
              data-variant="primary"
              data-bs-toggle="offcanvas"
              data-bs-target="#editProfileCanvas"
              aria-controls="editProfileCanvas"
              disabled={signingOut}
            >
              Edit profile
            </button>

            <button
              type="button"
              className="dashboard-button"
              disabled={actionsDisabled}
              onClick={() => void signOut(false)}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-width">
         <div className="dashboard-welcome">
        <h1>Hello, {user?.username ?? "there"}.</h1>
        {user?.role === "admin" && (
          <Link
            to="/admin/users"
            className="dashboard-button"
            data-variant="primary"
          >
            View users
            <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
        {error && <p role="alert">{error}</p>}
        {user?.role === "admin" && (
  <section className="dashboard-summary" aria-label="Member statistics">
    {summaryError ? (
      <p className="alert alert-danger" role="alert">
        {summaryError}
      </p>
    ) : (
      summaryCards.map((card) => (
        <article key={card.label} data-tone={card.tone}>
          <h2>{card.label}</h2>
          <p>
            {summaryLoading ? "—" : card.value.toLocaleString("en-IN")}
          </p>
        </article>
      ))
    )}
  </section>
)}

        <div className="dashboard-grid">
          <section className="account-card" aria-labelledby="profile-details-heading">
            <header className="profile-heading">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Your profile"
                  width={64}
                  height={64}
                />
              ) : (
                <span className="avatar" aria-hidden="true">
                  {user?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              )}

              <div>
                <h2 id="profile-details-heading">Profile details</h2>
                <span data-verified={Boolean(user?.verified)}>
                  {user?.verified ? "Email verified" : "Email unverified"}
                </span>
              </div>
            </header>

            {!profile && profileBusy && <p role="status">Loading profile…</p>}

            <dl className="profile-details">
              <div>
                <dt>Username</dt>
                <dd>{user?.username ?? "—"}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{user?.email ?? "—"}</dd>
              </div>
              <div>
                <dt>Account ID</dt>
                <dd><code>{user?.id ?? "—"}</code></dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd data-capitalize>{user?.role ?? "—"}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{profile?.gender || "—"}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{profile?.age ?? "—"}</dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd>{profile?.weight == null ? "—" : `${profile.weight} kg`}</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd data-capitalize>{profile?.condition ?? "—"}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{profile?.city || "—"}</dd>
              </div>
              <div data-wide>
                <dt>Bio</dt>
                <dd>{profile?.bio || "—"}</dd>
              </div>
            </dl>

            <div className="dashboard-actions">
              <button
                type="button"
                className="dashboard-button"
                disabled={actionsDisabled}
                onClick={() => void refreshProfile()}
              >
                Refresh profile
              </button>
            </div>
          </section>

          <section className="account-card" aria-labelledby="sessions-heading">
            <h2 id="sessions-heading">Your sessions</h2>
            <p>Sign out of all devices where your account is logged in.</p>

            <button
              type="button"
              className="dashboard-button"
              data-variant="danger"
              disabled={actionsDisabled}
              onClick={() => void signOut(true)}
            >
              Sign out everywhere
            </button>
          </section>
        </div>
      </main>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="editProfileCanvas"
        aria-labelledby="editProfileCanvasTitle"
      >
        <div className="offcanvas-header">
          <h2 id="editProfileCanvasTitle">Edit profile</h2>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">
          <ProfilePage />
        </div>
      </div>
    </div>
  );
}