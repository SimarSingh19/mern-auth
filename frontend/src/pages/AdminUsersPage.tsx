import { useEffect, useRef, useState } from "react";
import EditUserModal from "../components/admin/EditUserModal";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";
import type { AdminUser } from "../types/auth.types";
import { Link } from "react-router-dom";

import UserSearch from "../components/admin/UserSearch";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const [filters, setFilters] = useState({
    name: "",
    age: "",
  });

  const filteredUsers = users.filter((user) => {
    const matchesName = user.username.toLowerCase().includes(filters.name);
    const matchesAge = filters.age === "" || (user.age != null && user.age === Number(filters.age));
    return matchesName && matchesAge;
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await authService.getAdminUsers();
        setUsers(data);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, []);

  function updateUserInTable(updatedUser: AdminUser) {
    setUsers((currentUsers) =>
        currentUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      ),
    );
  }

  async function confirmDelete() {
    if (!deletingUser || deleting) return;

    const userId = deletingUser._id;

    setDeleting(true);
    setDeleteError("");

    try {
      await authService.deleteAdminUser(userId);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId),
      );

      cancelButtonRef.current?.click();
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="admin-dashboard">
      <header className="members-header">
        <div>
          <Link to="/admin/dashboard" className="members-back"><span aria-hidden="true">←</span> Back to dashboard</Link>
          <h1>Members</h1>
        </div>
        {!loading && !error && (<span className="members-count">{users.length} members</span>)}
      </header>

      <UserSearch onSearch={setFilters} />
      <section className="admin-card members-card">
        <div className="members-toolbar">
          <h2 id="admin-users-heading">All users</h2>
        </div>
        {loading && <p role="status">Loading users…</p>}
        {error && (<div className="alert alert-danger" role="alert">{error}</div>)}

        {!loading && !error && users.length > 0 && (
          <div className="admin-table-scroll table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Verified</th>
                  <th scope="col">Age</th>
                  <th scope="col">Condition</th>
                  <th scope="col">Weight (kg)</th>
                  <th scope="col">Gender</th>
                  <th scope="col">City</th>
                  <th scope="col">Bio</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-5 text-secondary">
                      {users.length === 0 ? "No users found." : "No members match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <th scope="row">
                        <div className="d-flex align-items-center gap-2">
                          {user.profilePicture && (
                            <img src={user.profilePicture} width={40} height={40} className="rounded-circle object-fit-cover"/>
                          )}
                          <span>{user.username}</span>
                        </div>
                      </th>

                      <td>{user.email}</td>
                      <td className="text-capitalize">{user.role}</td>
                      <td>
                        <span className="admin-badge" data-verified={user.verified ? "true" : "false"}>{user.verified ? "Yes" : "No"}</span>
                      </td>
                      <td>{user.age ?? "—"}</td>
                      <td className="text-capitalize">{user.condition || "—"}</td>
                      <td>{user.weight ?? "—"}</td>
                      <td className="text-capitalize">{user.gender?.replace(/_/g, " ") || "—"}</td>
                      <td>{user.city || "—"}</td>
                      <td>{user.bio || "—"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" data-bs-toggle="modal"
                            data-bs-target="#editUserModal" disabled={deleting} onClick={() => setEditingUser({ ...user })}>
                            Edit
                          </button>

                          <button type="button" className="btn btn-outline-danger btn-sm" data-bs-toggle="modal"
                            data-bs-target="#deleteUserModal" disabled={deleting}
                            onClick={() => {setDeletingUser(user);setDeleteError("")}}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <EditUserModal user={editingUser} onUpdated={updateUserInTable} />
      <div className="modal fade" id="deleteUserModal" tabIndex={-1} aria-labelledby="deleteUserModalTitle"
        aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5" id="deleteUserModalTitle">Delete user?</h2>
            </div>
            <div className="modal-body">
              <p className="mb-0">Permanently delete <strong>{deletingUser?.username}</strong>?</p>
              {deleteError && (<div className="alert alert-danger mt-3 mb-0" role="alert">{deleteError}</div>)}
            </div>
            <div className="modal-footer">
              <button ref={cancelButtonRef} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" disabled={deleting || !deletingUser} onClick={() => void confirmDelete()}>
                {deleting ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}