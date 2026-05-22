import React, { useEffect, useState } from "react";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../api/taskApi";
import { getProjects } from "../api/projectApi";
import { getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import CardSkeleton from "../components/CardSkeleton";
import { useToast } from "../context/ToastContext";

function Tasks() {
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: "",
    assignedUserId: "",
  });

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [profileRes, tasksRes, projectsRes] = await Promise.all([
        getProfile(),
        getTasks(),
        getProjects(),
      ]);

      setUser(profileRes.data);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data || []);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildPayload = () => ({
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    status: formData.status,
    dueDate: formData.dueDate || null,
    assignedUser: formData.assignedUserId
      ? { id: Number(formData.assignedUserId) }
      : null,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "",
      status: "",
      dueDate: "",
      assignedUserId: "",
    });
    setProjectId("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (editingId) {
        await updateTask(editingId, buildPayload());
        showToast("Task updated successfully", "success");
      } else {
        if (!projectId) {
          showToast("Please select a project", "warning");
          return;
        }
        await createTask(projectId, buildPayload());
        showToast("Task created successfully", "success");
      }

      resetForm();
      await fetchTasks();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Task operation failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "",
      status: task.status || "",
      dueDate: task.dueDate || "",
      assignedUserId: task.assignedUser?.id ? String(task.assignedUser.id) : "",
    });
    setProjectId(task.project?.id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      showToast("Task deleted successfully", "success");
      await fetchTasks();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete task", "error");
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

  const getPriorityClasses = (priority) => {
    if (priority === "High") {
      return "text-rose-600 dark:text-rose-400";
    }
    if (priority === "Medium") {
      return "text-amber-600 dark:text-amber-400";
    }
    return "text-emerald-600 dark:text-emerald-400";
  };

  return (
    <AppShell
      title="Tasks"
      subtitle="Create, manage and track tasks efficiently"
      user={user}
    >
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingId ? "Edit Task" : "Create Task"}
        </h2>

        {loading ? (
          <PageLoader label="Loading task form..." />
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
                disabled={editingId}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              />
            </div>

            <div className="xl:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
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

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Assigned User Id
              </label>
              <input
                type="number"
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleChange}
                placeholder="Enter assigned user id"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl"
              />
            </div>

            <div className="xl:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
              >
                {submitting ? "Saving..." : editingId ? "Update Task" : "Create Task"}
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
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl p-10 text-center text-gray-500 dark:text-slate-400">
          No tasks found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClasses(task.status)}`}>
                  {task.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{task.description}</p>
              <p className={`text-sm mb-2 font-medium ${getPriorityClasses(task.priority)}`}>
                Priority: {task.priority}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Due Date: {task.dueDate || "Not set"}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                Assigned To: {task.assignedUser?.name || "Unassigned"}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Project: {task.project?.title || "No Project"}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
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

export default Tasks;