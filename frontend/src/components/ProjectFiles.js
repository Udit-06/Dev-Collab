import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProjectFiles({ projectId }) {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const res = await api.get(`/files/project/${projectId}`);
    setFiles(res.data);
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await api.post(`/files/upload/${projectId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setFile(null);
    loadFiles();
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-4">Project Files</h3>

      <form onSubmit={handleUpload} className="flex gap-3 mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>

      <div className="space-y-2">
        {files.map((item) => (
          <a
            key={item.id}
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block p-3 border rounded hover:bg-gray-50"
          >
            {item.fileName}
          </a>
        ))}
      </div>
    </div>
  );
}