import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  // Replace this with your actual logged in user id source
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setError("");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/analytics?userId=${userId}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load");

        if (ignore) return;

        // convert ordersSeries to recharts format
        setData(
          (json.ordersSeries || []).map((d) => ({
            date: d._id,
            orders: d.orderCount,
            spend: d.spendTotal,
          }))
        );

        setBreakdown(json.activityBreakdown || []);
        setRecent(json.recentActivity || []);
      } catch (e) {
        if (!ignore) setError(e.message);
      }
    }

    if (userId) load();
    return () => (ignore = true);
  }, [userId]);

  if (!userId) return <div style={{ padding: 20 }}>Please login to view your dashboard.</div>;

  return (
    <div className="dashWrap">
      <div className="dashHeader">
        <h1>Your Activity Dashboard</h1>
        <p>Orders & activity for the last 30 days</p>
      </div>

      {error && <div className="dashError">{error}</div>}

      <div className="dashCard">
        <h2>Spending Over Time (R)</h2>
        <div className="dashChart">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `R${Number(v).toFixed(2)}`} />
              <Line type="monotone" dataKey="spend" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashGrid">
        <div className="dashCard">
          <h2>Activity Breakdown</h2>
          <ul className="dashList">
            {breakdown.map((b) => (
              <li key={b._id}>
                <span>{b._id}</span>
                <b>{b.count}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashCard">
          <h2>Recent Activity</h2>
          <ul className="dashList">
            {recent.map((a) => (
              <li key={a._id}>
                <span>{a.type}</span>
                <small>{new Date(a.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
