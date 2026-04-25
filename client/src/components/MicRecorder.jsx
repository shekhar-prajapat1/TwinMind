import { useRef, useEffect, useState } from "react";

export default function MicRecorder({ isRecording, onToggleRecording, onChunk }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => stopRecording();
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 🎧 Audio visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;

      source.connect(analyzer);
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyzerRef.current) return;

        analyzerRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / bufferLength;

        setAudioLevel(average);
        requestAnimationFrame(updateLevel);
      };

      updateLevel();

      // 🎤 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onChunk(event.data);
        }
      };

      mediaRecorder.start();

      // 🔥 OPTIMIZED CHUNKING (10 sec)
      intervalRef.current = setInterval(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.requestData(); // ✅ no stop/start needed
        }
      }, 10000); // ⚡ 10 seconds

    } catch (error) {
      console.error("Mic error:", error);
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setAudioLevel(0);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={onToggleRecording}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isRecording ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {isRecording ? (
            <div style={{ width: '12px', height: '12px', background: 'var(--bg)', borderRadius: '2px' }} />
          ) : (
            <div style={{ width: '12px', height: '12px', background: 'var(--bg)', borderRadius: '50%' }} />
          )}
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          {isRecording ? 'Recording. Click to stop.' : 'Stopped. Click to resume.'}
        </span>
      </div>
    </div>
  );
}