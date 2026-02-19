import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function OrdersDoubleLineChart({ ordersSeries = [] }) {
  const { labels, spendData, ordersData } = useMemo(() => {
    // ordersSeries format from backend:
    // [{ _id: "2026-02-01", orderCount: 2, spendTotal: 1200 }, ...]
    const labels = ordersSeries.map((x) => x._id);
    const spendData = ordersSeries.map((x) => Number(x.spendTotal || 0));
    const ordersData = ordersSeries.map((x) => Number(x.orderCount || 0));
    return { labels, spendData, ordersData };
  }, [ordersSeries]);

  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: "Spend (R)",
          data: spendData,
          borderColor: "rgba(122,167,255,1)",
          backgroundColor: "rgba(122,167,255,0.2)",
          tension: 0.35,
          pointRadius: 2,
          yAxisID: "ySpend",
        },
        {
          label: "Orders",
          data: ordersData,
          borderColor: "rgba(255,255,255,0.75)",
          backgroundColor: "rgba(255,255,255,0.2)",
          tension: 0.35,
          pointRadius: 2,
          yAxisID: "yOrders",
        },
      ],
    };
  }, [labels, spendData, ordersData]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "rgba(230,237,247,0.9)" } },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          ticks: { color: "rgba(230,237,247,0.8)" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        ySpend: {
          position: "left",
          ticks: { color: "rgba(230,237,247,0.8)" },
          grid: { color: "rgba(255,255,255,0.06)" },
          title: { display: true, text: "Spend (R)", color: "rgba(230,237,247,0.75)" },
        },
        yOrders: {
          position: "right",
          ticks: { color: "rgba(230,237,247,0.8)", precision: 0 },
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Orders", color: "rgba(230,237,247,0.75)" },
        },
      },
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Purchases (Last 30 Days)</div>
      <div style={{ height: 340 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
