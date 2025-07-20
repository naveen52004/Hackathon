import React, { useState, useEffect } from "react";
import { 
  UserCircle,
  Sparkles,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Threads from "./Threads";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Threads WebGL Background */}
      <div className="absolute inset-0 z-0">
        <Threads
          color={[0.2, 0.5, 1.0]}
          amplitude={2.5}
          distance={0.3}
          enableMouseInteraction={false} // ✅ Disable mouse interaction
        />
      </div>

      {/* Additional Threads Layers for Depth */}
      <div className="absolute inset-0 z-5 opacity-40">
        <Threads
          color={[0.8, 0.3, 1.0]}
          amplitude={1.8}
          distance={0.2}
          enableMouseInteraction={false}
        />
      </div>

      <div className="absolute inset-0 z-10 opacity-25">
        <Threads
          color={[0.2, 1.0, 0.8]}
          amplitude={1.2}
          distance={0.1}
          enableMouseInteraction={false}
        />
      </div>

      {/* Ambient lighting */}
      <div className="absolute inset-0 z-15">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>

      {/* Cyberpunk Lightning Effects */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-ping opacity-60"
            style={{ 
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              backgroundColor: ['#3b82f6', '#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][i],
              boxShadow: `0 0 20px ${['#3b82f6', '#a855f7', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][i]}`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          />
        ))}
      </div>

      {/* Main Content Layer */}
      <div className={`relative z-30 flex flex-col min-h-screen p-6 sm:p-8 transition-all duration-2000 ${
        isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-16 opacity-0'
      }`}>
        
        {/* KAP Insights Flow Header */}
        <div className="flex flex-col items-center justify-center text-center mb-20">

          <div className="flex-1" />
          <div className="text-center relative">
            {/* Title glow effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse" />
            
            {/* KAP Insights title */}
            <h1 className="relative text-6xl justify font-black bg-gradient-to-r from-cyan-300 via-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4 filter drop-shadow-2xl">
              KAP • Insights
            </h1>
            
            {/* Flow subtitle */}
            <h2 className="relative text-4xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-6">
              Flow
            </h2>
            
            {/* Decorative elements */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse" />
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-purple-300 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            {/* <p className="text-gray-100/70 text-base font-medium tracking-[0.2em] uppercase">
              Intelligence Streaming Analytics Platform
            </p> */}
            
            {/* Status indicator */}
            {/* <div className="mt-4 flex justify-center items-center gap-2 text-green-300 text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="font-mono">NEURAL NETWORK ACTIVE</span>
            </div> */}
          </div>
          
          {/* User profile */}
        </div>

        {/* Navigation Options */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">
            
            {/* Chat Option */}
            <div
              onClick={() => handleNavigation('/chat')}
              className={`group relative cursor-pointer transform transition-all duration-1000 hover:scale-110 ${
                isLoaded ? 'animate-slideUp' : ''
              }`}
              style={{ 
                animationDelay: '0.2s',
                animationFillMode: 'both'
              }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-3xl opacity-0 group-hover:opacity-60 blur-3xl transition-all duration-700 transform group-hover:scale-125" />
              <div className="relative backdrop-blur-xl bg-black/20 rounded-3xl p-12 border border-white/10 shadow-2xl transform transition-all duration-700 group-hover:bg-black/30 group-hover:border-white/20 group-hover:shadow-3xl">
                <div className="mb-10 p-10 rounded-3xl bg-gradient-to-r from-blue-400/80 to-cyan-400/80 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 mx-auto w-fit shadow-2xl relative overflow-hidden">
                  <MessageCircle className="w-16 h-16 text-white drop-shadow-2xl relative z-10" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-white">Chat Interface</h3>
                  <p className="text-gray-200/80">Engage with the neural chat system</p>
                </div>
              </div>
            </div>

            {/* Dashboard Option */}
            <div
              onClick={() => handleNavigation('/dashboard')}
              className={`group relative cursor-pointer transform transition-all duration-1000 hover:scale-110 ${
                isLoaded ? 'animate-slideUp' : ''
              }`}
              style={{ 
                animationDelay: '0.4s',
                animationFillMode: 'both'
              }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-3xl opacity-0 group-hover:opacity-60 blur-3xl transition-all duration-700 transform group-hover:scale-125" />
              <div className="relative backdrop-blur-xl bg-black/20 rounded-3xl p-12 border border-white/10 shadow-2xl transform transition-all duration-700 group-hover:bg-black/30 group-hover:border-white/20 group-hover:shadow-3xl">
                <div className="mb-10 p-10 rounded-3xl bg-gradient-to-r from-purple-400/80 to-pink-400/80 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 mx-auto w-fit shadow-2xl relative overflow-hidden">
                  <BarChart3 className="w-16 h-16 text-white drop-shadow-2xl relative z-10" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-white">Analytics Dashboard</h3>
                  <p className="text-gray-200/80">Monitor performance metrics and insights</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home;
