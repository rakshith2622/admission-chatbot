export default function VoiceInput({ onResult }) {
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      onResult(event.results[0][0].transcript);
    };
  };

  return (
    <button
      onClick={startListening}
      className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-md"
    >
      🎤
    </button>
  );
}
