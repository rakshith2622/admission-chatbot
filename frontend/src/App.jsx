import { useState } from "react";

console.log("🔥 App.jsx is running");

export default function App() {
  const [question, setQuestion] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [fullAnswer, setFullAnswer] = useState("");
  const [showFull, setShowFull] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------- ASK QUESTION ----------
  const askQuestion = async () => {
    console.log("🟢 ASK button clicked");

    if (!question.trim()) {
      console.warn("⚠️ Question is empty");
      return;
    }

    setLoading(true);
    setShortAnswer("");
    setFullAnswer("");
    setShowFull(false);

    try {
      const res = await fetch("http://127.0.0.1:8001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: question })
      });

      console.log("📡 Fetch response status:", res.status);

      const data = await res.json();
      console.log("✅ Backend JSON:", data);

      setShortAnswer(data.short_answer || "No short answer received.");
      setFullAnswer(data.full_answer || "");
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setShortAnswer("❌ Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- VOICE INPUT ----------
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      setQuestion(event.results[0][0].transcript);
    };
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎓 Admission Chatbot</h1>

      <textarea
        style={styles.input}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your admission question..."
      />

      <div style={{ marginTop: "12px" }}>
        <button onClick={askQuestion} style={styles.button}>
          {loading ? "Loading..." : "Ask"}
        </button>

        <button onClick={startVoiceInput} style={styles.voiceButton}>
          🎤 Voice
        </button>
      </div>

      {loading && <p style={{ marginTop: "10px" }}>⏳ Fetching answer...</p>}

      {(shortAnswer || fullAnswer) && (
        <div style={styles.answerBox}>
          <div style={styles.toggleRow}>
            <button
              onClick={() => setShowFull(false)}
              style={!showFull ? styles.activeToggle : styles.toggle}
            >
              Short Answer
            </button>

            {fullAnswer && (
              <button
                onClick={() => setShowFull(true)}
                style={showFull ? styles.activeToggle : styles.toggle}
              >
                Full Details
              </button>
            )}
          </div>

          {!showFull && <pre style={styles.text}>{shortAnswer}</pre>}
          {showFull && <pre style={styles.text}>{fullAnswer}</pre>}
        </div>
      )}
    </div>
  );
}

// ---------- STYLES ----------
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    padding: "40px",
    fontFamily: "system-ui"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    minHeight: "90px",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#ffffff",
    color: "#000000",
    borderRadius: "6px",
    border: "none"
  },
  button: {
    padding: "10px 18px",
    fontSize: "16px",
    marginRight: "10px",
    cursor: "pointer"
  },
  voiceButton: {
    padding: "10px 18px",
    fontSize: "16px",
    cursor: "pointer"
  },
  answerBox: {
    marginTop: "25px",
    background: "#ffffff",
    color: "#000",
    padding: "15px",
    borderRadius: "6px"
  },
  toggleRow: {
    marginBottom: "10px"
  },
  toggle: {
    padding: "6px 12px",
    marginRight: "6px",
    cursor: "pointer"
  },
  activeToggle: {
    padding: "6px 12px",
    marginRight: "6px",
    cursor: "pointer",
    background: "#000",
    color: "#fff"
  },
  text: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.6"
  }
};
