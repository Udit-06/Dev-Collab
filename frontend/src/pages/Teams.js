import React, { useEffect, useState } from "react";
import { createTeam, getTeams, inviteToTeam } from "../api/teamApi";
import { getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import CardSkeleton from "../components/CardSkeleton";
import { useToast } from "../context/ToastContext";

function Teams() {
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [inviteEmails, setInviteEmails] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [profileRes, teamsRes] = await Promise.all([getProfile(), getTeams()]);
      setUser(profileRes.data);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load teams", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    const res = await getTeams();
    setTeams(res.data || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      showToast("Team name is required", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await createTeam({ teamName: teamName.trim() });
      setTeamName("");
      showToast("Team created successfully", "success");
      await loadTeams();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create team",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteChange = (teamId, value) => {
    setInviteEmails((prev) => ({
      ...prev,
      [teamId]: value,
    }));
  };

  const handleInvite = async (teamId) => {
    const email = inviteEmails[teamId];

    if (!email || !email.trim()) {
      showToast("Please enter an email", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await inviteToTeam(teamId, email.trim());

      setInviteEmails((prev) => ({
        ...prev,
        [teamId]: "",
      }));

      showToast("User invited successfully", "success");
      await loadTeams();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to invite user",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Teams"
      subtitle="Create teams and invite members into shared workspaces"
      user={user}
    >
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Create Team
        </h2>

        {loading ? (
          <PageLoader label="Loading teams..." />
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Team Name"
              className="flex-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
            >
              {submitting ? "Processing..." : "Create Team"}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-10 text-center text-gray-500 dark:text-slate-400">
          No teams found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.teamId}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{team.teamName}</h2>

              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Owner ID: {team.ownerId}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                Members: {team.memberIds?.length || 0}
              </p>

              <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                <h3 className="text-base font-semibold mb-3 text-slate-900 dark:text-white">
                  Invite Member
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter user email"
                    className="flex-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                    value={inviteEmails[team.teamId] || ""}
                    onChange={(e) => handleInviteChange(team.teamId, e.target.value)}
                  />

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleInvite(team.teamId)}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-3 rounded-2xl font-medium"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Teams;