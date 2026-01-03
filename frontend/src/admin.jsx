import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8001/admin";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const [pdfs, setPdfs] = useState([]);
  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("admin_password");

  // ---------- AUTO LOGIN ----------
  useEffect(() => {
    if (token) {
      setLogged(true);
      fetchPDFs(token);
    }
  }, []);

  // ---------- LOGIN ----------
  const login = () => {
    if (!password.trim()) {
      alert("Enter admin password");
      return;
    }
    localStorage.setItem("admin_password", password);
    setLogged(true);
    fetchPDFs(password);
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("admin_password");
    setLogged(false);
    setPassword("");
    setPdfs([]);
    setLogs([]);
  };

  // ---------- FETCH PDFs ----------
  const fetchPDFs = async (pwd = token) => {
    try {
      const res = await fetch(`${API}/list-pdfs`, {
        headers: { "x-admin-password": pwd }
      });
      const data = await res.json();
      setPdfs(data.pdfs || []);
    } catch {
      alert("Failed to fetch PDFs");
    }
  };

  // ---------- UPLOAD ----------
  const uploadPDF = () => {
    if (!file) return alert("Choose a PDF");

    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(0);
      setFile(null);
      logAction("UPLOAD", file.name);
      fetchPDFs();
    };

    xhr.onerror = () => alert("Upload failed");

    xhr.open("POST", `${API}/upload-pdf`);
    xhr.setRequestHeader("x-admin-password", token);
    xhr.send(form);
  };

  // ---------- DELETE ----------
  const deletePDF = async (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    await fetch(`${API}/delete-pdf/${name}`, {
      method: "DELETE",
      headers: { "x-admin-password": token }
    });

    logAction("DELETE", name);
    fetchPDFs();
  };

  // ---------- LOG ACTION ----------
  const logAction = (action, file) => {
    setLogs((prev) => [
      {
        action,
        file,
        time: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  // ================= LOGIN PAGE =================
  if (!logged) {
    return (
      <div style={styles.page}>
        <h2>🔐 Admin Login</h2>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={login} style={styles.btn}>
          Login
        </button>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div style={styles.page}>
      <h2>🛠 Admin Dashboard</h2>

      <button onClick={logout} style={styles.logout}>
        Logout
      </button>

      {/* UPLOAD */}
      <div style={styles.card}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={uploadPDF} style={styles.btn}>
          Upload PDF
        </button>

        {progress > 0 && (
          <div style={styles.progressWrap}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* PDF LIST */}
      <div style={styles.card}>
        <h3>📄 Uploaded PDFs</h3>
        {pdfs.length === 0 && <p>No PDFs found</p>}
        {pdfs.map((p) => (
          <div key={p} style={styles.row}>
            {p}
            <button onClick={() => deletePDF(p)} style={styles.del}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* LOGS */}
      <div style={styles.card}>
        <h3>📊 Activity Logs</h3>
        {logs.length === 0 && <p>No activity yet</p>}
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>File</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td>{l.action}</td>
                <td>{l.file}</td>
                <td>{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    background: "#0f0f0f",
    color: "#fff",
    minHeight: "100vh",
    padding: 40,
    fontFamily: "system-ui"
  },
  input: {
    padding: 10,
    fontSize: 16,
    marginBottom: 10
  },
  btn: {
    padding: "8px 16px",
    cursor: "pointer",
    marginLeft: 10
  },
  logout: {
    background: "crimson",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 20
  },
  card: {
    background: "#1a1a1a",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8
  },
  del: {
    background: "crimson",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
  progressWrap: {
    background: "#333",
    height: 8,
    marginTop: 10,
    borderRadius: 6
  },
  progressBar: {
    height: "100%",
    background: "lime",
    borderRadius: 6,
    transition: "width 0.3s"
  },
  table: {
    width: "100%",
    marginTop: 10,
    borderCollapse: "collapse"
  }
};
