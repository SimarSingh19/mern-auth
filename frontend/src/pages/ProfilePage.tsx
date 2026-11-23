import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loadProfile, saveProfile } from "../store/slices/profileSlice";
import type { UserProfile } from "../types/auth.types";

type ProfileFormValues = {
  age: number | null;
  condition: NonNullable<UserProfile["condition"]> | "";
  weight: number | null;
  gender: string;
  city: string;
  bio: string;
};

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data, busy, error } = useAppSelector((state) => state.profile);

  const { register, handleSubmit, reset, formState: { isDirty, dirtyFields } } = useForm<ProfileFormValues>({
    defaultValues: {
      age: null,
      condition: "",
      weight: null,
      gender: "",
      city: "",
      bio: "",
    },
  });

  //   useEffect(() => {
  //     void dispatch(loadProfile()).then((action) => {
  //       if (loadProfile.fulfilled.match(action)) {
  //         const profile = action.payload;

  //         reset({
  //           age: profile.age,
  //           condition: profile.condition ?? "",
  //           weight: profile.weight,
  //           gender: profile.gender ?? "",
  //           city: profile.city,
  //           bio: profile.bio,
  //         });
  //       }
  //     });
  //   }, [dispatch, reset]);

  useEffect(() => {
    void dispatch(loadProfile());
  }, [dispatch]);

  const hasProfile = data != null;
  const { age, condition, weight, gender, city, bio } = data ?? {};

  useEffect(() => {
    if (!hasProfile) return;

    reset({
      age: age ?? null,
      condition: condition ?? "",
      weight: weight ?? null,
      gender: gender ?? "",
      city: city ?? "",
      bio: bio ?? "",
    });
  }, [hasProfile, age, condition, weight, gender, city, bio, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!isDirty && !selectedFile) return;

    const formData = new FormData();

    if (dirtyFields.age) {
      formData.set("age", values.age == null ? "" : String(values.age));
    }

    if (dirtyFields.weight) {
      formData.set(
        "weight",
        values.weight == null ? "" : String(values.weight),
      );
    }

    if (dirtyFields.condition) {
      formData.set("condition", values.condition ?? "");
    }

    if (dirtyFields.gender) {
      formData.set("gender", values.gender ?? "");
    }

    if (dirtyFields.city) {
      formData.set("city", values.city ?? "");
    }

    if (dirtyFields.bio) {
      formData.set("bio", values.bio ?? "");
    }

    if (selectedFile) {
      formData.set("profilePicture", selectedFile);
    }

    const result = await dispatch(saveProfile(formData));

    if (saveProfile.fulfilled.match(result)) {
      setSelectedFile(null);

      const canvas = document.getElementById("editProfileCanvas");

      canvas
        ?.querySelector<HTMLButtonElement>('[data-bs-dismiss="offcanvas"]')
        ?.click();
    }
  };

  return (
    <section className="profile-editor">
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p role="status">Loading profile…</p>}

      {data && (
        <>
          <div className="profile-upload">
            {data.profilePicture && (
              <img
                src={data.profilePicture}
                alt="Your profile"
                width={80}
                height={80}
              />
            )}

            <label htmlFor="profilePicture">Profile picture</label>
            <input
              id="profilePicture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="form-control"
              disabled={busy}
              onChange={(event) => {
                setSelectedFile(event.currentTarget.files?.[0] ?? null);
              }}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={busy}>
              <div className="profile-fields">
                <div>
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    min={1}
                    max={120}
                    {...register("age", {
                      setValueAs: (value) =>
                        value === "" || value == null ? null : Number(value),
                    })}
                  />
                </div>

                <div>
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    min={1}
                    max={500}
                    step="any"
                    {...register("weight", {
                      setValueAs: (value) =>
                        value === "" || value == null ? null : Number(value),
                    })}
                  />
                </div>

                <div>
                  <label htmlFor="condition">Condition</label>
                  <select id="condition" {...register("condition")}>
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="bad">Bad</option>
                    <option value="excellent">Excellent</option>
                    <option value="average">Average</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" {...register("gender")}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div data-wide>
                  <label htmlFor="city">City</label>
                  <input id="city" {...register("city")} />
                </div>

                <div data-wide>
                  <label htmlFor="bio">Bio</label>
                  <textarea id="bio" rows={3} {...register("bio")} />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || (!isDirty && !selectedFile)}
              >
                {busy ? "Please wait…" : "Save profile"}
              </button>
            </fieldset>
          </form>
        </>
      )}
    </section>
  )
}
