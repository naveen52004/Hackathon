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

  //   // Dashboard data fetching
  //   const fetchDashboardData = useCallback(async (payload) => {
  //     try {
  //       setPreviewLoading(true);
  //       const today = new Date();
  //       const startOfDay = new Date(
  //         today.getFullYear(),
  //         today.getMonth(),
  //         today.getDate()
  //       );
  //       const endOfDay = new Date(
  //         today.getFullYear(),
  //         today.getMonth(),
  //         today.getDate(),
  //         23,
  //         59,
  //         59,
  //         999
  //       );

  //       const enhancedPayload = {
  //         ...payload,
  //         filter: {
  //           startDate: startOfDay.getTime(),
  //           endDate: endOfDay.getTime(),
  //           notFetchEmpData: false,
  //         },
  //       };

  //       const res = await fetch(
  //         "https://democrm.kapturecrm.com/ms/dashboard/performance-dashboard",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic ZGVtb2NybTpEZW1vY3JtJDMyMQ==",
  //           },
  //           body: JSON.stringify(enhancedPayload),
  //           credentials: "include",
  //         }
  //       );

  //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //       const data = await res.json();
  //       setDashboardResult(data);
  //     } catch (err) {
  //       console.error("Dashboard fetch error:", err);
  //       setDashboardResult({ error: err.message });
  //     } finally {
  //       setPreviewLoading(false);
  //     }
  //   }, []);

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
          "https://f5bec5671aab.ngrok-free.app/kapture/dashboard/payload",
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

  const handleSaveConfig = () => {
    if (!finalPayload) return;
    dispatch(
      saveConfig({
        payload: JSON.stringify(finalPayload),
        chart_type: chartType,
        thread_id: threadId,
      })
    );
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
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
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
              <div className="h-full">
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
    </div>
  );
};

export default Chat;
