import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Send,
  Eye,
  EyeOff,
  X,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { flushSync } from "react-dom";
import { fetchDashboardData } from "../reducers/dashboardfetch";
import DynamicAutoCharts from "../charts/DynamicAutoChart";
import { setConfigData } from "../reducers/payload";
import { saveConfig } from "../reducers/Saveconfig";

const Chat = () => {
  // State management
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [finalPayload, setFinalPayload] = useState(null);
  const [dashboardResult, setDashboardResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [isNewThread, setIsNewThread] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // New state for save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const dashboarddata = useSelector((state) => state.dashboardData);

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [chartType, setChartType] = useState("");

  // Memoized values
  const canPreview = useMemo(() => Boolean(finalPayload), [finalPayload]);
  const canSend = useMemo(
    () => inputMessage.trim() && !isTyping,
    [inputMessage, isTyping]
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize chat
  useEffect(() => {
    if (!hasInitialized) {
      const timer = setTimeout(() => {
        const initialMessage = {
          id: Date.now(),
          text: "Hello! 👋 I'm your AI Assistant. I'm here to help you with any questions or tasks you might have. What would you like to talk about today?",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages([initialMessage]);
        setHasInitialized(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [hasInitialized]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    if (finalPayload) {
      dispatch(fetchDashboardData(finalPayload));
      dispatch(setConfigData(finalPayload));
    }
  }, [finalPayload, dispatch]);
  const dynamic_payload = useSelector((state) => state.payload.data);

  // Bot response fetching with streaming
  const fetchBotResponse = useCallback(
    async (inputMessage) => {
      try {
        const requestPayload = {
          user_message: inputMessage,
          isNewThread,
          thread_id: threadId,
        };

        const response = await fetch(
          "https://1719a856b571.ngrok-free.app/kapture/dashboard/payload",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify(requestPayload),
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let partialChunk = "";
        let botMessageId = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsTyping(false);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const combined = partialChunk + chunk;
          const lines = combined.split("\n");
          partialChunk = "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
              const data = JSON.parse(line);

              if (data.type === "threadID") {
                setThreadId(data.content);
                setIsNewThread(false);
              }

              if (data.type === "text" && data.content) {
                if (!botMessageId) {
                  const botMessage = {
                    id: Date.now() + Math.random(),
                    text: data.content,
                    sender: "bot",
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  };
                  botMessageId = botMessage.id;
                  fullText = data.content;
                  setMessages((prev) => [...prev, botMessage]);
                  setIsTyping(false);
                } else {
                  fullText += data.content;
                  flushSync(() => {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === botMessageId
                          ? { ...msg, text: fullText }
                          : msg
                      )
                    );
                  });
                }
              }
              let payloadData = "";
              if (data.type === "payload") {
                payloadData = data.content;
              }

              if (data.type === "chart" && Array.isArray(data.content)) {
                setChartType(data.content[0]);
              }

              if (payloadData?.keyToFieldList) {
                setFinalPayload(payloadData);
                setDashboardResult(null);
              }
            } catch (err) {
              console.error("JSON parse error:", err);
              if (i === lines.length - 1) partialChunk = line;
            }
          }
        }
      } catch (error) {
        console.error("Bot response error:", error);
        setIsTyping(false);

        // Add error message
        const errorMessage = {
          id: Date.now(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [isNewThread, threadId]
  );

  // Event handlers
  const handleSendMessage = useCallback(() => {
    if (!canSend) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);

    fetchBotResponse(currentMessage);
  }, [canSend, inputMessage, fetchBotResponse]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handlePreview = () => {
    if (!finalPayload) return;
    setShowPreview((prev) => !prev);
  };

  // Modified save handler to show modal
  const handleSaveConfig = () => {
    if (!finalPayload) return;
    setShowSaveModal(true);
  };

  // New function to handle the actual save with dashboard name
  const handleConfirmSave = async () => {
    if (!dashboardName.trim()) {
      alert("Please enter a dashboard name");
      return;
    }

    setIsSaving(true);
    try {
      // Include the dashboard name in the save config
      await dispatch(
        saveConfig({
          payload: JSON.stringify(finalPayload),
          chart_type: chartType,
          thread_id: threadId,
          dashboardName: dashboardName.trim(), // Add the dashboard name
        })
      );

      // Close modal and reset form
      setShowSaveModal(false);
      setDashboardName("");

      // Optional: Show success message
      alert("Dashboard saved successfully!");
    } catch (error) {
      console.error("Error saving dashboard:", error);
      alert("Error saving dashboard. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetThread = useCallback(() => {
    setThreadId("");
    setIsNewThread(true);
    setMessages([]);
    setHasInitialized(false);
    setFinalPayload(null);
    setDashboardResult(null);
    setShowPreview(false);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex">
      {/* Main Chat Section */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          showPreview ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Assistant</h1>
              <p className="text-xs text-slate-400">Ready to help you</p>
            </div>
          </div>
          <button
            onClick={resetThread}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
            title="Reset conversation"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.sender === "user" ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl shadow-lg ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white ml-auto"
                      : "bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>
                </div>
                <div
                  className={`text-xs text-slate-500 mt-2 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-slate-400 text-sm">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50">
          <div className="relative bg-slate-700/50 rounded-2xl border border-slate-600/50 focus-within:border-emerald-500/50 transition-colors duration-200">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 pr-24 bg-transparent text-white placeholder-slate-400 resize-none rounded-2xl focus:outline-none"
              placeholder="Type your message..."
              rows={1}
              disabled={isTyping}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {canPreview && (
                <button
                  onClick={handlePreview}
                  className={`p-2 rounded-xl transition-colors duration-200 ${
                    showPreview
                      ? "bg-blue-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-white"
                  }`}
                  title="Toggle dashboard preview"
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}

              <button
                onClick={handleSendMessage}
                disabled={!canSend}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  canSend
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg hover:shadow-emerald-500/25"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }`}
                title="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="w-1/2 bg-white border-l border-slate-300 flex flex-col">
          {/* Preview Header */}
          <div className="bg-slate-100 border-b border-slate-200 p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Dashboard Preview
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveConfig}
                disabled={!finalPayload}
                className="px-3 py-3 bg-[#00407a] text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                Save Dashboard
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-slate-200 rounded-md"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading dashboard data...</p>
                </div>
              </div>
            ) : dashboarddata ? (
              <div className="h-full w-full">
                <DynamicAutoCharts
                  apiResponse={dashboarddata}
                  api_payload={dynamic_payload}
                  chartType={chartType}
                />
              </div>
            ) : finalPayload ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600">
                    Click preview to load dashboard data
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-600">
                    Generate dashboard data from chat to see preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Dashboard Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Header with gradient */}
            <div className="relative p-6 pb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-t-2xl opacity-10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl shadow-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Save Dashboard
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Give your dashboard a memorable name
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
                  disabled={isSaving}
                >
                  <X
                    size={20}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-6">
              <div className="mb-8">
                <label
                  htmlFor="dashboardName"
                  className="block text-sm font-semibold text-slate-700 mb-3"
                >
                  Dashboard Name *
                </label>
                <div className="relative">
                  <input
                    id="dashboardName"
                    type="text"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder="e.g., Sales Performance Q4, Marketing Analytics..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 placeholder-slate-400 transition-all duration-200 bg-slate-50/50 hover:bg-white"
                    disabled={isSaving}
                    autoFocus
                    maxLength={50}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span
                      className={`text-xs ${
                        dashboardName.length > 40
                          ? "text-orange-500"
                          : "text-slate-400"
                      }`}
                    >
                      {dashboardName.length}/50
                    </span>
                  </div>
                </div>
                {dashboardName.trim() && dashboardName.length < 3 && (
                  <p className="text-xs text-orange-500 mt-2 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Name should be at least 3 characters long
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={
                    !dashboardName.trim() ||
                    dashboardName.length < 3 ||
                    isSaving
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl hover:from-blue-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Save Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
