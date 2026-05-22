import React, { useEffect, useRef, useState } from "react";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = "http://localhost:8080";

function Profile() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now());

  const [selectedFile, setSelectedFile] = useState(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetData, setResetData] = useState({
    token: "",
    newPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setUser({
        id: res.data.id || "",
        name: res.data.name || "",
        email: res.data.email || "",
        profileImage: res.data.profileImage || "",
      });
      setForgotEmail(res.data.email || "");
      setImageVersion(Date.now());
    } catch (error) {
      console.error(error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      const payload = {
        name: user.name,
        email: user.email,
      };

      const res = await updateProfile(payload);
      setUser((prev) => ({
        ...prev,
        ...res.data,
      }));
      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to update profile",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast("Please choose an image first", "warning");
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadProfilePicture(selectedFile);

      setUser((prev) => ({
        ...prev,
        ...res.data,
        profileImage: res.data.profileImage || prev.profileImage,
      }));

      setImageVersion(Date.now());
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showToast("Profile picture uploaded successfully", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to upload profile picture",
        "error"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      showToast("Email is required", "warning");
      return;
    }

    try {
      const res = await forgotPassword(forgotEmail.trim());
      showToast(
        typeof res.data === "string"
          ? `Reset token generated: ${res.data}`
          : "Password reset token generated",
        "info"
      );
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to generate reset token",
        "error"
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(resetData);
      setResetData({
        token: "",
        newPassword: "",
      });
      showToast("Password reset successful", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Reset password failed",
        "error"
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingAccount(true);
      await deleteAccount();
      localStorage.removeItem("token");
      showToast("Account deleted successfully", "success");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to delete account",
        "error"
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const buildProfileImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return `${imagePath}${imagePath.includes("?") ? "&" : "?"}v=${imageVersion}`;
    }
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${normalizedPath}${normalizedPath.includes("?") ? "&" : "?"}v=${imageVersion}`;
  };

  const profileImageUrl = buildProfileImageUrl(user.profileImage);

  if (loading) {
    return (
      <AppShell
        title="Profile"
        subtitle="Manage your account settings and personal information"
        user={user}
      >
        <PageLoader label="Loading profile..." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Manage your account settings and personal information"
      user={user}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  onError={() =>
                    setUser((prev) => ({
                      ...prev,
                      profileImage: "",
                    }))
                  }
                  className="w-28 h-28 rounded-full object-cover border border-gray-200 dark:border-slate-700 mb-4"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-600 dark:text-slate-300 mb-4">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.name || "User"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {user.email}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                User ID: {user.id}
              </p>
            </div>

            <form onSubmit={handleImageUpload} className="mt-6">
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Upload profile picture
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl mb-4"
              />
              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-3 rounded-2xl font-medium"
              >
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Edit Profile
            </h2>

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
                >
                  {savingProfile ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">
                Forgot Password
              </h2>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-medium"
                >
                  Generate Reset Token
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">
                Reset Password
              </h2>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    name="token"
                    value={resetData.token}
                    onChange={handleResetChange}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={resetData.newPassword}
                    onChange={handleResetChange}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-medium"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-3 text-rose-600 dark:text-rose-400">
              Delete Account
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              This action permanently removes your account and cannot be undone.
            </p>

            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
            >
              {deletingAccount ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Profile;