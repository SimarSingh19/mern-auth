import { Link, Outlet } from "react-router-dom";
export default function AuthLayout() {
  return(
    <main className="auth-shell container-fluid">
      <div className="row g-0 auth-panel">
        <aside className="col-lg-5 auth-story d-flex flex-column justify-content-between">
          <Link className="brand text-white" to="/login"><span className="brand-mark">A</span> Account</Link>
          <div className="story-copy"><span className="eyebrow">YOUR PERSONAL SPACE</span>
            <h1>A simple start.<br />A space for you.</h1>
            <p>Create your account, verify your email, and make yourself at home.</p>
            <div className="story-detail"><span className="status-dot" /> Email verified. Ready to go.</div>
          </div>
          <p className="small mb-0 story-footer">One account. Your own dashboard.</p>
        </aside>
        <section className="col-lg-7 form-panel"><Outlet /></section>
      </div>
    </main>
  )
}
