import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square } from "lucide-react";

const VoiceRecorder = ({
  onTranscriptionComplete,
  disabled = false,
  apiEndpoint = "https://9c3df7aa9036.ngrok-free.app/api/voice-to-text",
  className = "",
  size = 18,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processRecording();
        cleanupRecording();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Microphone access denied. Please allow microphone access to use voice recording."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `recording_${timestamp}.webm`;

      formData.append("file", audioBlob, filename);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const transcribedText = result.text || result || "";

      if (transcribedText.trim()) {
        // Call the callback function with the transcribed text
        onTranscriptionComplete(transcribedText);
      } else {
        alert("No speech detected. Please try again.");
      }
    } catch (error) {
      console.error("Voice conversion failed:", error);
      alert(
        "Failed to convert voice to text. Please check your connection and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  const handleToggleRecording = () => {
    if (disabled) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Recording Status Component
  const RecordingStatus = () => {
    if (!isRecording && !isProcessing) return null;

    return <div></div>;
  };

  return (
    <div className={`relative ${className}`}>
      <RecordingStatus />
      <button
        onClick={handleToggleRecording}
        disabled={disabled || isProcessing}
        className={`p-2 rounded-xl transition-all duration-200 ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/25"
            : isProcessing
            ? "bg-blue-600 text-white cursor-not-allowed"
            : disabled
            ? "bg-slate-600 text-slate-400 cursor-not-allowed"
            : "bg-slate-600 text-white hover:bg-slate-500"
        }`}
        title={
          disabled
            ? "Voice recording disabled"
            : isRecording
            ? "Stop recording"
            : isProcessing
            ? "Processing..."
            : "Start voice recording"
        }
      >
        {isRecording ? <MicOff size={size} /> : <Mic size={size} />}
      </button>
    </div>
  );
};

export default VoiceRecorder;
