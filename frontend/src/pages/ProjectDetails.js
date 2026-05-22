import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProjectById,
  getProjectMembers,
  getProjectTasks,
  getProjectFiles,
  uploadProjectFile,
} from "../api/projectApi";
import { createTask } from "../api/taskApi";
import { getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import { useToast } from "../context/ToastContext";
import ChatBox from "../components/ChatBox";

function ProjectDetails() {
  const { projectId } = useParams();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: "",
    assignedUserId: "",
  });

  useEffect(() => {
    loadPage();
  }, [projectId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const [profileRes, projectRes, membersRes, taskRes, fileRes] = await Promise.all([
        getProfile(),
        getProjectById(projectId),
        getProjectMembers(projectId),
        getProjectTasks(projectId),
        getProjectFiles(projectId),
      ]);

      setUser(profileRes.data);
      setProject(projectRes.data);
      setMembers(membersRes.data || []);
      setTasks(taskRes.data || []);
      setFiles(fileRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load project details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = (e) => {
    setTaskForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      setCreatingTask(true);

      await createTask(projectId, {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: taskForm.status,
        dueDate: taskForm.dueDate || null,
        assignedUser: taskForm.assignedUserId
          ? { id: Number(taskForm.assignedUserId) }
          : null,
      });

      setTaskForm({
        title: "",
        description: "",
        priority: "",
        status: "",
        dueDate: "",
        assignedUserId: "",
      });

      showToast("Task created successfully", "success");
      await loadPage();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to create task",
        "error"
      );
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast("Please choose a file", "warning");
      return;
    }

    try {
      setUploading(true);
      await uploadProjectFile(projectId, selectedFile);
      setSelectedFile(null);
      showToast("File uploaded successfully", "success");
      await loadPage();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message ||
          error?.response?.data ||
          "File upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleNotification = (notification) => {
    showToast(notification.message || "New notification received", "info");
  };

  if (loading) {
    return (
      <AppShell title="Project Details" subtitle="Loading project workspace..." user={user}>
        <PageLoader label="Loading project details..." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project?.title || "Project Details"}
      subtitle="Track tasks, members, files, and project discussion in one place"
      user={user}
      rightContent={
        <Link
          to="/projects"
          className="hidden sm:inline-flex items-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Back to Projects
        </Link>
      }
    >
      {project && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
          <div className="mb-6 sm:hidden">
            <Link to="/projects" className="text-blue-600 font-medium">
              ← Back to Projects
            </Link>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {project.title}
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-6">{project.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Status</p>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{project.status}</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Team</p>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{project.team?.teamName || "Unknown Team"}</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Deadline</p>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{project.deadline || "Not set"}</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Members</p>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{members.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">Tasks</h2>

          <form
            onSubmit={handleCreateTask}
            className="border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 rounded-3xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Create Task</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                placeholder="Task title"
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              />

              <select
                name="assignedUserId"
                value={taskForm.assignedUserId}
                onChange={handleTaskChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl"
              >
                <option value="">Assign member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="description"
              value={taskForm.description}
              onChange={handleTaskChange}
              placeholder="Task description"
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl mb-4"
              rows="3"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                name="priority"
                value={taskForm.priority}
                onChange={handleTaskChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              >
                <option value="">Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <select
                name="status"
                value={taskForm.status}
                onChange={handleTaskChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl"
                required
              >
                <option value="">Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                type="date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskChange}
                className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl"
              />
            </div>

            <button
              type="submit"
              disabled={creatingTask}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
            >
              {creatingTask ? "Creating..." : "Create Task"}
            </button>
          </form>

          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">No tasks for this project.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950"
                >
                  <div className="flex justify-between items-center mb-2 gap-3">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{task.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-slate-400">{task.status}</span>
                  </div>

                  <p className="text-gray-600 dark:text-slate-300 mb-2">{task.description}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Priority: {task.priority}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Due Date: {task.dueDate || "Not set"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Assigned To: {task.assignedUser?.name || "Unassigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-slate-900 dark:text-white">Files</h2>

          <form onSubmit={handleUpload} className="mb-6">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-2xl mb-4"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-medium"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </form>

          {files.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">No files uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 dark:border-slate-800 rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-slate-950 transition"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{file.fileName}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{file.fileType || "Unknown type"}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {file.fileSize ? `${Math.round(file.fileSize / 1024)} KB` : ""}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {user ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <ChatBox
            username={user.name}
            userId={user.id}
            roomId={String(projectId)}
            onNotification={handleNotification}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading chat...</p>
        </div>
      )}
    </AppShell>
  );
}

export default ProjectDetails;