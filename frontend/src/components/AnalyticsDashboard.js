import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import api from "../api/axios";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/analytics/dashboard").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading analytics...</p>;

  const taskStatusData = [
    { name: "Completed", value: stats.completedTasks },
    { name: "In Progress", value: stats.inProgressTasks },
    { name: "To Do", value: stats.todoTasks },
  ];

  const productivityData = Object.entries(stats.productivityByMember).map(([name, value]) => ({
    name,
    completed: value,
  }));

  return (
    <div className="p-6 grid gap-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Completed Tasks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskStatusData} dataKey="value" outerRadius={100} label>
                {taskStatusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Team Productivity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Project Progress</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stats.projectProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="projectName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completedTasks" fill="#0088FE" />
            <Bar dataKey="totalTasks" fill="#FFBB28" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}