import React, { useState, useContext } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import uploadImage from "../utils/uploadImage";
import { useUserAuth } from "../hooks/useUserAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProfilePhotoSelector from "../components/Inputs/ProfilePhotoSelector";

const Profile = () => {
  useUserAuth();

  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [profilePic, setProfilePic] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.profileImageUrl || "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setError("Please enter current password");
        return;
      }
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }
    }

    setLoading(true);

    try {
      let imageUrl = profileImageUrl;

      if (profilePic) {
        const imgRes = await uploadImage(profilePic);
        imageUrl = imgRes.imageUrl || "";
      }

      const profileRes = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        { name, profileImageUrl: imageUrl },
      );
      updateUser(profileRes.data.user);

      if (currentPassword && newPassword) {
        await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, {
          currentPassword,
          newPassword,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      toast.success("Profile updated successfully");

      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="mt-5 flex justify-center">
        <div className="form-card w-full md:w-[600px]">
          <h2 className="text-xl font-medium mb-5">My Profile</h2>

          <form onSubmit={handleSubmit}>
            <ProfilePhotoSelector
              image={profilePic}
              setImage={setProfilePic}
              existingImage={profileImageUrl}
            />

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Your name"
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                placeholder="Enter current password"
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm new password"
              />
            </div>

            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

            <button
              type="submit"
              className="btn-primary mt-5"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
