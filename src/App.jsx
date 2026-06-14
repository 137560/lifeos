import { useState, useEffect } from "react";

function App() {
  const [sleep, setSleep] = useState("");
  const [fatigue, setFatigue] = useState("");
  const [procrastination, setProcrastination] = useState("");

  const [records, setRecords] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("todayRecord");

    if (saved) {
      const data = JSON.parse(saved);

      setSleep(data.sleep || "");
      setFatigue(data.fatigue || "");
      setProcrastination(data.procrastination || "");
    }

    const history = localStorage.getItem("records");

    if (history) {
      setRecords(JSON.parse(history));
    }
  }, []);

  const score =
    (Number(sleep) || 0) * 10 -
    (Number(fatigue) || 0) * 3 -
    (Number(procrastination) || 0) * 3;

  const saveRecord = () => {
    const record = {
      date: new Date().toLocaleDateString(),
      sleep,
      fatigue,
      procrastination,
      score,
    };

    localStorage.setItem(
      "todayRecord",
      JSON.stringify(record)
    );

    const newRecords = [...records, record];

    setRecords(newRecords);

    localStorage.setItem(
      "records",
      JSON.stringify(newRecords)
    );

    alert("保存成功");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>LifeOS</h1>

      <h2>今日记录</h2>

      <div>
        <p>睡眠时长（小时）</p >
        <input
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
        />
      </div>

      <div>
        <p>疲劳程度（1-10）</p >
        <input
          value={fatigue}
          onChange={(e) => setFatigue(e.target.value)}
        />
      </div>

      <div>
        <p>拖延程度（1-10）</p >
        <input
          value={procrastination}
          onChange={(e) => setProcrastination(e.target.value)}
        />
      </div>

      <br />

      <button onClick={saveRecord}>
        保存今日记录
      </button>

      <hr />

      <h2>分析结果</h2>

      <p>睡眠：{sleep} 小时</p >
      <p>疲劳：{fatigue}</p >
      <p>拖延：{procrastination}</p >

      <h3>状态分：{score}</h3>

      <hr />

      <h2>历史记录</h2>

      {records.length === 0 ? (
        <p>暂无记录</p >
      ) : (
        records.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>日期：{item.date}</p >
            <p>睡眠：{item.sleep}</p >
            <p>疲劳：{item.fatigue}</p >
            <p>拖延：{item.procrastination}</p >
            <p>状态分：{item.score}</p >
          </div>
        ))
      )}
    </div>
  );
}

export default App;