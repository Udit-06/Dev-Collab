import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../api/projectApi";
import { getTeams } from "../api/teamApi";
import { getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import CardSkeleton from "../components/CardSkeleton";
import { useToast } from "../context/ToastContext";

function Projects() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    deadline: "",
    teamId: "",
  });

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [profileRes, projectsRes, teamsRes] = await Promise.all([
        getProfile(),
        getProjects(),
        getTeams(),
      ]);

      setUser(profileRes.data);
      setProjects(projectsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data || []);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "",
      deadline: "",
      teamId: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (editingId) {
        await updateProject(editingId, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          deadline: formData.deadline || null,
        });
        showToast("Project updated successfully", "success");
      } else {
        if (!formData.teamId) {
          showToast("Please select a team", "warning");
          return;
        }

        await createProject({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          deadline: formData.deadline || null,
          team: {
            teamId: Number(formData.teamId),
          },
        });

        showToast("Project created successfully", "success");
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Operation failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "",
      deadline: project.deadline || "",
      teamId: project.team?.teamId ? String(project.team.teamId) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      showToast("Project deleted", "success");
      await fetchProjects();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to delete project",
        "error"
      );
    }
  };

  const getStatusClasses = (status) => {
    if (status === "Completed") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    }
    if (status === "In Progress") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    }
    return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <AppShell
      title="Projects"
      subtitle="Create, manage and track your project workspace"
      user={user}
    >
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingId ? "Edit Project" : "Create Project"}
        </h2>

        {loading ? (
          <PageLoader label="Loading form..." />
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <div className="xl:col-span-1">
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              />
            </div>

            <div className="xl:col-span-1">
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
              />
            </div>

            {!editingId && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Team
                </label>
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="xl:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
              >
                {submitting ? "Saving..." : editingId ? "Update Project" : "Create Project"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <CardSkeleton count={6} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-10 text-center text-gray-500 dark:text-slate-400">
          No projects found. Create your first project to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{project.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClasses(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{project.description}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Team: {project.team?.teamName || "Unknown Team"}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Deadline: {project.deadline || "Not set"}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-2xl text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Projects;