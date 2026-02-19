import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Logged in user id from localStorage
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  async function fetchAnalytics(signal) {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${baseUrl}/dashboard/analytics?userId=${encodeURIComponent(userId)}`,
        { signal }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");

      // Convert backend ordersSeries to recharts format
      const series = (json.ordersSeries || []).map((d) => ({
        date: d._id,
        orders: Number(d.orderCount || 0),
        spend: Number(d.spendTotal || 0),
      }));

      setData(series);
      setBreakdown(json.activityBreakdown || []);
      setRecent(json.recentActivity || []);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    const controller = new AbortController();
    if (userId) fetchAnalytics(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, baseUrl]);

  // Auto-refresh every 8s (keeps chart updated after purchases)
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const interval = setInterval(() => fetchAnalytics(controller.signal), 8000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Optional: instant refresh if you dispatch this event after checkout success:
  // window.dispatchEvent(new Event("orderCreated"));
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const onOrderCreated = () => fetchAnalytics(controller.signal);

    window.addEventListener("orderCreated", onOrderCreated);
    return () => {
      controller.abort();
      window.removeEventListener("orderCreated", onOrderCreated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const totals = useMemo(() => {
    const totalSpend = data.reduce((sum, d) => sum + (Number(d.spend) || 0), 0);
    const totalOrders = data.reduce((sum, d) => sum + (Number(d.orders) || 0), 0);
    const avgOrderValue = totalOrders ? totalSpend / totalOrders : 0;
    return { totalSpend, totalOrders, avgOrderValue };
  }, [data]);

  if (!userId) {
    return <div style={{ padding: 20 }}>Please login to view your dashboard.</div>;
  }

  return (
    <div className="dashWrap">
      <div className="dashHeader">
        <h1>Your Activity Dashboard</h1>
        <p>Orders & activity for the last 30 days</p>
      </div>

      {error && <div className="dashError">{error}</div>}

      <div className="dashGrid">
        <div className="dashCard">
          <h2>Total Spend</h2>
          <div className="dashStat">R{totals.totalSpend.toFixed(2)}</div>
          <small className="dashMuted">Last 30 days</small>
        </div>

        <div className="dashCard">
          <h2>Total Orders</h2>
          <div className="dashStat">{totals.totalOrders}</div>
          <small className="dashMuted">Last 30 days</small>
        </div>

        <div className="dashCard">
          <h2>Avg Order Value</h2>
          <div className="dashStat">R{totals.avgOrderValue.toFixed(2)}</div>
          <small className="dashMuted">Last 30 days</small>
        </div>
      </div>

      <div className="dashCard">
        <h2>Purchases Over Time</h2>
        <p className="dashMuted">Spend (R) and Orders per day</p>

        <div className="dashChart">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(v) => `R${Number(v).toFixed(0)}`}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tickFormatter={(v) => `${v}`}
              />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "spend") return [`R${Number(value).toFixed(2)}`, "Spend"];
                  if (name === "orders") return [Number(value), "Orders"];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />

              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spend"
                name="Spend"
                strokeWidth={2}
                dot={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {loading && <div className="dashLoading">Refreshing…</div>}
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
