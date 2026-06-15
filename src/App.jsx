import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./App.css";

const STORAGE_KEY = "lifeos_records";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

const emptyForm = {
  sleep: "",
  energy: "",
  procrastination: "",
  phone: "",
};

function App() {
  const today = getToday();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [isEditingToday, setIsEditingToday] = useState(false);

  useEffect(() => {
    const saved = loadRecords();
    // sort newest first for display
    saved.sort((a, b) => b.date.localeCompare(a.date));
    setRecords(saved);

    const todayRecord = saved.find((r) => r.date === today);
    if (todayRecord) {
      setForm({
        sleep: String(todayRecord.sleep),
        energy: String(todayRecord.energy),
        procrastination: String(todayRecord.procrastination),
        phone: String(todayRecord.phone),
      });
      setIsEditingToday(true);
    }
  }, []);

  const todayRecord = records.find((r) => r.date === today);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    const entry = {
      date: today,
      sleep: Math.round(Number(form.sleep) * 10) / 10 || 0,
      energy: Math.round(Number(form.energy)) || 0,
      procrastination: Math.round(Number(form.procrastination)) || 0,
      phone: Math.round(Number(form.phone) * 10) / 10 || 0,
    };

    // don't save empty records
    if (!entry.sleep && !entry.energy && !entry.procrastination && !entry.phone) {
      return;
    }

    const existingIdx = records.findIndex((r) => r.date === today);
    let updated;
    if (existingIdx >= 0) {
      updated = [...records];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...records];
    }
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setRecords(updated);
    saveRecords(updated);
    setIsEditingToday(true);
  };

  const handleDelete = (date) => {
    const updated = records.filter((r) => r.date !== date);
    setRecords(updated);
    saveRecords(updated);
    if (date === today) {
      setForm({ ...emptyForm });
      setIsEditingToday(false);
    }
  };

  // Last 30 days for chart, oldest first
  const chartData = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((r) => ({
      ...r,
      label: formatDate(r.date),
    }));

  // streak
  const streak = (() => {
    if (records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let d = new Date(today + "T00:00:00");
    for (const r of sorted) {
      const expected = d.toISOString().slice(0, 10);
      if (r.date === expected) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  return (
    <div className="app">
      <header className="header">
        <h1>LifeOS</h1>
        <p className="subtitle">个人观测站 · 先看，再懂，后变</p>
      </header>

      {/* Today Card */}
      <section className="card">
        <div className="card-head">
          <h2>
            {today} 记录
            {isEditingToday && (
              <span className="badge-saved">已记录</span>
            )}
          </h2>
          {streak > 1 && (
            <span className="streak">🔥 连续 {streak} 天</span>
          )}
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">💤 睡眠（小时）</span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={form.sleep}
              onChange={handleChange("sleep")}
              placeholder="例: 7.5"
            />
          </label>
          <label className="field">
            <span className="field-label">⚡ 精力（1-10）</span>
            <input
              type="number"
              min="1"
              max="10"
              value={form.energy}
              onChange={handleChange("energy")}
              placeholder="1=疲惫 10=充沛"
            />
          </label>
          <label className="field">
            <span className="field-label">🐌 拖延（1-10）</span>
            <input
              type="number"
              min="1"
              max="10"
              value={form.procrastination}
              onChange={handleChange("procrastination")}
              placeholder="1=高效 10=完全不想动"
            />
          </label>
          <label className="field">
            <span className="field-label">📱 手机（小时）</span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="例: 4"
            />
          </label>
        </div>

        <button className="btn-save" onClick={handleSave}>
          {isEditingToday ? "更新今日记录" : "保存今日记录"}
        </button>
      </section>

      {/* Today summary */}
      {todayRecord && (
        <section className="card card-summary">
          <h2>今日快照</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-num">{todayRecord.sleep}h</span>
              <span className="summary-label">睡眠</span>
            </div>
            <div className="summary-item">
              <span className="summary-num energy">{todayRecord.energy}</span>
              <span className="summary-label">精力 /10</span>
            </div>
            <div className="summary-item">
              <span className="summary-num procrastination">
                {todayRecord.procrastination}
              </span>
              <span className="summary-label">拖延 /10</span>
            </div>
            <div className="summary-item">
              <span className="summary-num phone">{todayRecord.phone}h</span>
              <span className="summary-label">手机</span>
            </div>
          </div>
        </section>
      )}

      {/* Chart */}
      {chartData.length >= 3 && (
        <section className="card">
          <h2>趋势（近 30 天）</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                fontSize={12}
                tick={{ fill: "var(--text)" }}
              />
              <YAxis fontSize={12} tick={{ fill: "var(--text)" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#6366f1"
                name="睡眠(h)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22c55e"
                name="精力"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="procrastination"
                stroke="#ef4444"
                name="拖延"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="phone"
                stroke="#f59e0b"
                name="手机(h)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* History */}
      <section className="card">
        <h2>历史记录</h2>
        {records.length === 0 ? (
          <p className="empty">还没有记录，开始第一条吧 👆</p>
        ) : (
          <div className="history-list">
            <div className="history-header">
              <span>日期</span>
              <span>睡眠</span>
              <span>精力</span>
              <span>拖延</span>
              <span>手机</span>
              <span />
            </div>
            {records.map((r) => (
              <div
                key={r.date}
                className={`history-row ${r.date === today ? "today" : ""}`}
              >
                <span className="col-date">{r.date}</span>
                <span>{r.sleep}h</span>
                <span>{r.energy}</span>
                <span>{r.procrastination}</span>
                <span>{r.phone}h</span>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(r.date)}
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
