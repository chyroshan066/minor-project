// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useAuthStore } from "@/store/authStore";
// import { MessageCircle, X, Send, Bot } from "lucide-react";

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

// const DentaBot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to bottom on new message
//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages, isLoading]);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     // 1. Prepare the user message
//     const userMessage: Message = { role: "user", content: input };
//     const currentInput = input;

//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsLoading(true);

//     try {
//       const { accessToken } = useAuthStore.getState();

//       const { data } = await axios.post("/api/chat", {
//         message: currentInput,
//         history: [...messages, userMessage].slice(-6),
//         token: accessToken,
//       });

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: data.reply },
//       ]);
//     } catch (error: any) {
//       console.error("Chat Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           content:
//             "I'm having trouble connecting to the clinic database. Please check if you are logged in.",
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50 font-sans">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
//       >
//         {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
//       </button>

//       {isOpen && (
//         <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
//           <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
//             <div className="bg-white/20 p-2 rounded-lg">
//               <Bot size={20} />
//             </div>
//             <div>
//               <h3 className="font-bold text-sm">DentaBot AI</h3>
//               <p className="text-[10px] text-blue-100">
//                 Arthonyx Smart Assistant
//               </p>
//             </div>
//           </div>

//           <div
//             ref={scrollRef}
//             className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
//           >
//             {messages.length === 0 && (
//               <div className="text-center py-10">
//                 <p className="text-gray-400 text-sm italic">
//                   Ask me about appointments, patients, or dental procedures!
//                 </p>
//               </div>
//             )}

//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`max-w-[80%] p-3 rounded-2xl text-sm ${
//                     msg.role === "user"
//                       ? "bg-blue-600 text-white rounded-tr-none"
//                       : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none"
//                   }`}
//                 >
//                   {msg.content}
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
//                   <div className="flex gap-1">
//                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
//                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
//                     <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <form
//             onSubmit={handleSendMessage}
//             className="p-4 bg-white border-t flex gap-2"
//           >
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Type your message..."
//               className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
//             />
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"
//             >
//               <Send size={18} />
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DentaBot;






"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { X, Send, Stethoscope, Activity } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DentaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentInput = input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { accessToken } = useAuthStore.getState();

      const { data } = await axios.post("/api/chat", {
        message: currentInput,
        history: [...messages, userMessage].slice(-6),
        token: accessToken,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to the clinic database. Please check if you are logged in.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes db-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes db-ping {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes db-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        .db-dot-1 { animation: db-dot 1.3s ease-in-out 0.0s infinite; }
        .db-dot-2 { animation: db-dot 1.3s ease-in-out 0.2s infinite; }
        .db-dot-3 { animation: db-dot 1.3s ease-in-out 0.4s infinite; }
        .db-panel  { animation: db-slide-up 0.28s cubic-bezier(0.16,1,0.3,1) both; }
        .db-msg-in { animation: db-slide-up 0.18s ease both; }
        .db-input:focus {
          outline: none;
          border-color: #1e40af !important;
          box-shadow: 0 0 0 3px rgba(30,64,175,0.1);
        }
        .db-send:not(:disabled):hover  { transform: scale(1.07); }
        .db-send:not(:disabled):active { transform: scale(0.95); }
        .db-trigger { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .db-trigger:hover  { transform: scale(1.08); }
        .db-trigger:active { transform: scale(0.94); }
        .db-chip:hover { background: #dbeafe !important; border-color: #93c5fd !important; }
      `}</style>

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ── Floating Trigger ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="db-trigger"
          style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background: isOpen
              ? "linear-gradient(145deg, #dc2626, #b91c1c)"
              : "linear-gradient(145deg, #0f172a, #1d4ed8)",
            boxShadow: isOpen
              ? "0 6px 20px rgba(220,38,38,0.45)"
              : "0 6px 28px rgba(29,78,216,0.55), 0 2px 8px rgba(15,23,42,0.2)",
          }}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "rgba(29,78,216,0.35)",
              animation: "db-ping 2.2s ease-out infinite",
            }} />
          )}

          {/* Online dot */}
          {!isOpen && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 10, height: 10, borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid white",
              boxShadow: "0 0 6px rgba(34,197,94,0.7)",
            }} />
          )}

          {isOpen
            ? <X size={20} strokeWidth={2.5} />
            : <Stethoscope size={22} strokeWidth={1.7} />
          }
        </button>

        {/* ── Chat Panel ── */}
        {isOpen && (
          <div
            className="db-panel"
            style={{
              position: "absolute",
              bottom: 70,
              right: 0,
              width: 360,
              height: 520,
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "#f1f5f9",
              boxShadow: "0 24px 64px rgba(15,23,42,0.2), 0 8px 24px rgba(15,23,42,0.1), 0 0 0 1px rgba(148,163,184,0.18)",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)",
              padding: "16px 18px 14px",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Stethoscope size={21} color="white" strokeWidth={1.6} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
                    DentaBot AI
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#4ade80", display: "inline-block",
                      boxShadow: "0 0 6px rgba(74,222,128,0.9)",
                    }} />
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
                      Arthonyx Smart Assistant · Online
                    </span>
                  </div>
                </div>

                {/* LIVE badge */}
                <div style={{
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.28)",
                  borderRadius: 20, padding: "3px 9px",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Activity size={10} color="#4ade80" strokeWidth={2.5} />
                  <span style={{ color: "#4ade80", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                marginTop: 13, height: 1,
                background: "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, transparent 100%)",
              }} />

              {/* Topic chips */}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {["Appointments", "Patients", "Billing", "Procedures"].map((tag) => (
                  <span key={tag} style={{
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 20, padding: "2px 9px",
                    fontSize: 10, color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.02em",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              style={{
                flex: 1, overflowY: "auto",
                padding: "14px 13px",
                display: "flex", flexDirection: "column", gap: 11,
                background: "#f1f5f9", scrollBehavior: "smooth",
              }}
            >
              {/* Empty state */}
              {messages.length === 0 && (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "100%", gap: 10, paddingBottom: 24,
                }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 16,
                    background: "linear-gradient(145deg, #0f172a, #1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(29,78,216,0.35)",
                  }}>
                    <Stethoscope size={26} color="white" strokeWidth={1.5} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#1e293b", fontWeight: 600, fontSize: 14, margin: 0 }}>
                      How can I assist you today?
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 5, lineHeight: 1.5, maxWidth: 210 }}>
                      Ask me about appointments, patients, billing, or dental procedures.
                    </p>
                  </div>
                  {/* Quick prompts */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", padding: "0 8px" }}>
                    {["Today's appointments", "Unpaid invoices", "Add new patient"].map((q) => (
                      <button
                        key={q}
                        className="db-chip"
                        onClick={() => setInput(q)}
                        style={{
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "8px 14px",
                          fontSize: 12,
                          color: "#1e40af",
                          cursor: "pointer",
                          fontWeight: 500,
                          textAlign: "left",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "#1d4ed8", flexShrink: 0, display: "inline-block",
                        }} />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="db-msg-in"
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  {/* Bot avatar beside message */}
                  {msg.role === "assistant" && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(145deg, #0f172a, #1d4ed8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
                    }}>
                      <Stethoscope size={13} color="white" strokeWidth={1.8} />
                    </div>
                  )}

                  <div style={{
                    maxWidth: "75%",
                    padding: "10px 13px",
                    borderRadius: msg.role === "user"
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    ...(msg.role === "user"
                      ? {
                          background: "linear-gradient(145deg, #1e3a8a, #1d4ed8)",
                          color: "white",
                          boxShadow: "0 4px 14px rgba(29,78,216,0.28)",
                        }
                      : {
                          background: "white",
                          color: "#1e293b",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                        }),
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {isLoading && (
                <div className="db-msg-in" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(145deg, #0f172a, #1d4ed8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Stethoscope size={13} color="white" strokeWidth={1.8} />
                  </div>
                  <div style={{
                    background: "white", border: "1px solid #e2e8f0",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "11px 15px",
                    display: "flex", gap: 5, alignItems: "center",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                  }}>
                    {(["db-dot-1","db-dot-2","db-dot-3"] as const).map((cls) => (
                      <span key={cls} className={cls} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#1d4ed8", display: "inline-block",
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Input ── */}
            <div style={{
              padding: "11px 13px 13px",
              background: "white",
              borderTop: "1px solid #e2e8f0",
              flexShrink: 0,
            }}>
              <form
                onSubmit={handleSendMessage}
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <input
                  className="db-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your clinic…"
                  style={{
                    flex: 1,
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: 24,
                    padding: "9px 16px",
                    fontSize: 13,
                    color: "#1e293b",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="db-send"
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    border: "none", flexShrink: 0,
                    cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white",
                    transition: "all 0.15s",
                    background: isLoading || !input.trim()
                      ? "#cbd5e1"
                      : "linear-gradient(145deg, #1e3a8a, #1d4ed8)",
                    boxShadow: isLoading || !input.trim()
                      ? "none"
                      : "0 4px 14px rgba(29,78,216,0.38)",
                  }}
                >
                  <Send size={15} strokeWidth={2.2} />
                </button>
              </form>
              <p style={{
                textAlign: "center", fontSize: 10,
                color: "#94a3b8", marginTop: 8, letterSpacing: "0.02em",
              }}>
                Secured by Arthonyx · End-to-end encrypted
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DentaBot;