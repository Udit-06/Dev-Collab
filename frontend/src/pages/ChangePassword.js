import React, { useEffect, useState } from "react";
import { changePassword, getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import { useToast } from "../context/ToastContext";

function ChangePassword() {
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setUser(res.data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load user details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword) {
      showToast("Both password fields are required", "warning");
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "warning");
      return;
    }

    try {
      setSaving(true);
      await changePassword(formData);
      setFormData({
        oldPassword: "",
        newPassword: "",
      });
      showToast("Password changed successfully", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to change password",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell
        title="Change Password"
        subtitle="Update your account password securely"
        user={user}
      >
        <PageLoader label="Loading account..." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Change Password"
      subtitle="Update your account password securely"
      user={user}
    >
      <div className="max-w-3xl">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white">
            Password Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Use a strong password you do not reuse elsewhere.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                placeholder="Enter current password"
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
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Avoid using your old password, name, email, or simple number patterns.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
            >
              {saving ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default ChangePassword;