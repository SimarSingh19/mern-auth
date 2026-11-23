import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateAdminUser, clearUpdateError } from "../../store/slices/adminUsersSlice";
import type { AdminUser, AdminUserEditValues } from "../../types/auth.types";

type Props = {
  user: AdminUser | null;
  onUpdated: (user: AdminUser) => void;
};

export default function EditUserModal({ user, onUpdated }: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const dispatch = useAppDispatch();
  const { updating, error } = useAppSelector((state) => state.adminUsers);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<AdminUserEditValues>();

  useEffect(() => {
    dispatch(clearUpdateError());

    if (user) {
      reset({
        role: user.role,
        age: user.age ?? null,
        condition: user.condition ?? "",
        weight: user.weight ?? null,
        gender: user.gender ?? "",
        city: user.city ?? "",
        bio: user.bio ?? "",
      });
    }
  }, [user, reset, dispatch]);

  async function onSubmit(values: AdminUserEditValues) {
    if (!user || !isDirty || updating) return;

    const result = await dispatch(
      updateAdminUser({
        userId: user._id,
        values,
      }),
    );

    if (updateAdminUser.fulfilled.match(result)) {
      onUpdated(result.payload.user);
      toast.success(result.payload.message);
      cancelButtonRef.current?.click();
    }
  }

  return (
    <div
      className="modal fade"
      id="editUserModal"
      tabIndex={-1}
      aria-labelledby="editUserModalTitle"
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="editUserModalTitle">Edit {user?.username}</h2>
          </div>

          <div className="modal-body">
            {error && (<div className="alert alert-danger" role="alert">{error}</div>)}

            <form id="editUserForm" onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={updating}>
                <div className="mb-3">
                  <label htmlFor="editRole" className="form-label">Role</label>

                  <select
                    id="editRole"
                    className="form-select"
                    {...register("role")}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="editAge" className="form-label">Age</label>

                    <input
                      id="editAge"
                      type="number"
                      step="1"
                      className="form-control"
                      {...register("age", {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                  </div>

                  <div className="col-sm-6 mb-3">
                    <label htmlFor="editWeight" className="form-label">Weight (kg)</label>

                    <input
                      id="editWeight"
                      type="number"
                      step="any"
                      className="form-control"
                      {...register("weight", {
                        setValueAs: (value) =>
                          value === "" ? null : Number(value),
                      })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="editCondition" className="form-label">Condition</label>

                  <select
                    id="editCondition"
                    className="form-select"
                    {...register("condition")}
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="bad">Bad</option>
                    <option value="excellent">Excellent</option>
                    <option value="average">Average</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="editGender" className="form-label">Gender</label>

                  <select
                    id="editGender"
                    className="form-select"
                    {...register("gender")}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="editCity" className="form-label">City</label>

                  <input id="editCity" className="form-control" {...register("city")}/>
                </div>

                <div className="mb-3">
                  <label htmlFor="editBio" className="form-label">Bio</label>

                  <textarea
                    id="editBio"
                    rows={5}
                    className="form-control"
                    {...register("bio")}
                  />
                </div>
              </fieldset>
            </form>
          </div>

          <div className="modal-footer">
            <button
              ref={cancelButtonRef}
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="editUserForm"
              className="btn btn-primary"
              disabled={!user || updating || !isDirty}
            >
              {updating ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
