'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Phone, Mic, MicOff, VideoOff, MessageSquare, Send, Users, Shield, Copy, Check, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface P2PWebRTCRoomProps {
  initialRoomId?: string;
  autoJoin?: boolean;
}

export default function P2PWebRTCRoom({ initialRoomId = 'interview-101', autoJoin = false }: P2PWebRTCRoomProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [peerId] = useState(() => `peer_${Math.random().toString(36).substring(2, 7)}`);
  const [joined, setJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [connectionState, setConnectionState] = useState<'idle' | 'signaling' | 'connected' | 'disconnected'>('idle');
  const [activePeerCount, setActivePeerCount] = useState(1);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const lastSignalTimeRef = useRef<number>(0);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetPeerIdRef = useRef<string | null>(null);

  // Helper to create synthetic video stream if physical camera fails or is denied
  const createMockVideoStream = useCallback((): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    let angle = 0;
    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`WebRTC Participant (${peerId})`, 40, 60);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Room ID: ${roomId}`, 40, 90);
      ctx.fillText(`P2P Video Channel Active`, 40, 120);

      // Animated pulsing circle
      ctx.beginPath();
      ctx.arc(320, 280, 50 + Math.sin(angle) * 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 280, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();

      angle += 0.05;
      requestAnimationFrame(draw);
    };
    draw();

    const stream = canvas.captureStream(30);

    // Add silent audio track fallback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      osc.connect(dst);
      osc.start();
      const audioTrack = dst.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
        stream.addTrack(audioTrack);
      }
    } catch {}

    return stream;
  }, [peerId, roomId]);

  // Clean peer connection teardown
  const closePeerConnection = useCallback(() => {
    if (dataChannelRef.current) {
      try { dataChannelRef.current.close(); } catch {}
      dataChannelRef.current = null;
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    targetPeerIdRef.current = null;
  }, []);

  // Handle remote peer leaving room
  const handlePeerLeft = useCallback((leftPeerId?: string) => {
    closePeerConnection();
    setConnectionState('idle');
    setActivePeerCount(1);
    setMessages(prev => [
      ...prev,
      { sender: 'System', text: `Peer ${leftPeerId ? `(${leftPeerId})` : ''} left the meeting room.`, time: new Date() }
    ]);
  }, [closePeerConnection]);

  // Handle Leave Room API & Beacon cleanup
  const sendLeaveSignal = useCallback(() => {
    try {
      const payload = JSON.stringify({ roomId, type: 'leave', senderId: peerId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/ds/webrtc/signal', payload);
      } else {
        fetch('/api/ds/webrtc/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }, [peerId, roomId]);

  // Handle WebRTC Peer Connection setup
  const initPeerConnection = useCallback((targetPeerId: string) => {
    if (pcRef.current && targetPeerIdRef.current === targetPeerId) {
      return pcRef.current;
    }

    // Close any previous connection
    closePeerConnection();
    targetPeerIdRef.current = targetPeerId;

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    // Attach local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnectionState('connected');
      }
    };

    // Handle ICE Candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && targetPeerId) {
        await fetch('/api/ds/webrtc/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            type: 'ice-candidate',
            senderId: peerId,
            targetId: targetPeerId,
            data: event.candidate,
          })
        }).catch(() => {});
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setConnectionState('disconnected');
      } else if (pc.connectionState === 'disconnected') {
        handlePeerLeft(targetPeerId);
      }
    };

    // Handle incoming DataChannel
    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = (e) => {
        setMessages(prev => [...prev, { sender: 'Peer', text: e.data, time: new Date() }]);
      };
      dataChannelRef.current = receiveChannel;
    };

    return pc;
  }, [closePeerConnection, handlePeerLeft, peerId, roomId]);

  // Create WebRTC Offer with Concurrency/Polite-Peer check
  const createOffer = useCallback(async (targetPeerId: string) => {
    const pc = initPeerConnection(targetPeerId);

    // Create DataChannel for chat
    const dc = pc.createDataChannel('chat');
    dc.onmessage = (e) => {
      setMessages(prev => [...prev, { sender: 'Peer', text: e.data, time: new Date() }]);
    };
    dataChannelRef.current = dc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await fetch('/api/ds/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'offer',
        senderId: peerId,
        targetId: targetPeerId,
        data: offer,
      })
    }).catch(() => {});
    setConnectionState('signaling');
  }, [initPeerConnection, peerId, roomId]);

  // Handle incoming Offer (Polite Peer Pattern to avoid glare concurrency collisions)
  const handleOfferSignal = useCallback(async (offer: RTCSessionDescriptionInit, senderId: string) => {
    const isPolite = peerId > senderId; // Deterministic tie-breaker
    let pc = pcRef.current;

    // Check collision
    if (pc && pc.signalingState !== 'stable') {
      if (!isPolite) {
        // Impolite peer ignores incoming offer glare
        return;
      }
      // Polite peer rolls back local offer to accept incoming offer
      await Promise.all([
        pc.setLocalDescription({ type: 'rollback' }),
        pc.setRemoteDescription(new RTCSessionDescription(offer))
      ]);
    } else {
      pc = initPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await fetch('/api/ds/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'answer',
        senderId: peerId,
        targetId: senderId,
        data: answer,
      })
    }).catch(() => {});
    setConnectionState('signaling');
  }, [initPeerConnection, peerId, roomId]);

  // Handle incoming Answer
  const handleAnswerSignal = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (pcRef.current && pcRef.current.signalingState === 'have-local-offer') {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setConnectionState('connected');
    }
  }, []);

  // Handle incoming ICE Candidate
  const handleIceCandidateSignal = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current && pcRef.current.remoteDescription) {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('ICE candidate addition skipped:', err);
      }
    }
  }, []);

  // Join Room & Initialize Media
  const handleJoin = useCallback(async () => {
    setJoined(true);
    setConnectionState('signaling');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
    } catch {
      const mockStream = createMockVideoStream();
      localStreamRef.current = mockStream;
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // Register presence in room
    const res = await fetch('/api/ds/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'join',
        senderId: peerId,
      })
    });

    const data = await res.json();
    setMessages(prev => [...prev, { sender: 'System', text: `Joined interview room "${roomId}"`, time: new Date() }]);

    // Deterministic Concurrency Check: If peer exists and our ID < peerId, we create the offer
    if (data.peers && data.peers.length > 0) {
      setActivePeerCount(data.peers.length + 1);
      const existingPeer = data.peers[0];
      if (peerId < existingPeer) {
        await createOffer(existingPeer);
      }
    }
  }, [createMockVideoStream, createOffer, peerId, roomId]);

  // Polling loop for WebRTC Signaling exchange & Heartbeat
  useEffect(() => {
    if (!joined) return;

    const pollSignals = async () => {
      try {
        const res = await fetch(`/api/ds/webrtc/signal?roomId=${roomId}&peerId=${peerId}&since=${lastSignalTimeRef.current}`);
        if (!res.ok) return;

        const data = await res.json();
        const signals = data.signals || [];
        const peers = data.peers || [];

        setActivePeerCount(peers.length + 1);

        for (const sig of signals) {
          lastSignalTimeRef.current = Math.max(lastSignalTimeRef.current, sig.timestamp);

          if (sig.type === 'offer') {
            await handleOfferSignal(sig.data, sig.senderId);
          } else if (sig.type === 'answer') {
            await handleAnswerSignal(sig.data);
          } else if (sig.type === 'ice-candidate') {
            await handleIceCandidateSignal(sig.data);
          } else if (sig.type === 'leave') {
            handlePeerLeft(sig.senderId);
          } else if (sig.type === 'join' && peerId < sig.senderId) {
            // Newly joined peer detected: deterministic offer creation
            await createOffer(sig.senderId);
          }
        }
      } catch (e) {
        console.error('[WebRTC Polling Error]', e);
      }
    };

    pollingTimerRef.current = setInterval(pollSignals, 1000);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [joined, roomId, peerId, handleOfferSignal, handleAnswerSignal, handleIceCandidateSignal, handlePeerLeft, createOffer]);

  // Handle Tab Unload / Leave Cleanup
  useEffect(() => {
    const onUnload = () => {
      sendLeaveSignal();
    };

    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
    };
  }, [sendLeaveSignal]);

  // Auto-join if requested via prop
  useEffect(() => {
    if (autoJoin && !joined) {
      handleJoin();
    }
  }, [autoJoin, joined, handleJoin]);

  const handleLeave = () => {
    sendLeaveSignal();
    closePeerConnection();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
    setJoined(false);
    setConnectionState('idle');
    setActivePeerCount(1);
    setMessages([]);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput.trim();

    // Send via DataChannel if open
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(msgText);
      } catch (err) {
        console.warn('DataChannel send error:', err);
      }
    }

    setMessages(prev => [...prev, { sender: 'You', text: msgText, time: new Date() }]);
    setChatInput('');
  };

  const copyRoomLink = () => {
    const fullUrl = `${window.location.origin}/interview/${roomId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col min-h-[600px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <Video className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">WebRTC P2P Interview Room</h2>
              <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300 border-slate-700 font-mono">
                {roomId}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 gap-1">
                <Users className="w-3 h-3" />
                {activePeerCount} in room
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Direct encrypted Peer-to-Peer audio, video, and data channels.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={copyRoomLink}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Link' : 'Copy Meet Link'}
          </Button>

          {!joined ? (
            <Button onClick={handleJoin} className="bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs px-4">
              Join Room Now
            </Button>
          ) : (
            <Button onClick={handleLeave} variant="destructive" className="text-xs gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Leave Room
            </Button>
          )}
        </div>
      </div>

      {/* Main Video & Chat Grid */}
      {!joined ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/50">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Ready to join meeting?</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Click &quot;Join Room Now&quot; to initialize WebRTC signaling, acquire camera/microphone, and connect with peer.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 w-48 font-mono"
              placeholder="Room ID"
            />
            <Button onClick={handleJoin} className="bg-orange-600 hover:bg-orange-500 text-white text-xs">
              Connect to Room
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Video Grid */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* Local Participant */}
              <div className="bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800/80 group aspect-video md:aspect-auto flex items-center justify-center">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full text-xs text-white flex items-center gap-1.5 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> You (Local)
                </div>

                <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-full text-white backdrop-blur transition-colors ${
                      isAudioMuted ? 'bg-rose-600' : 'bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-full text-white backdrop-blur transition-colors ${
                      isVideoMuted ? 'bg-rose-600' : 'bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remote Participant */}
              <div className="bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800/80 flex items-center justify-center aspect-video md:aspect-auto">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {connectionState !== 'connected' && (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-500/30 animate-pulse">
                      {connectionState === 'disconnected' ? (
                        <UserX className="w-8 h-8 text-rose-400" />
                      ) : (
                        <Users className="w-8 h-8 text-orange-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium mb-1">
                      {connectionState === 'disconnected' ? 'Participant Left' : 'Waiting for remote participant...'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {connectionState === 'disconnected'
                        ? 'Peer disconnected or left room'
                        : 'Signaling via STUN & Concurrency Protocol'}
                    </p>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full text-xs text-white flex items-center gap-1.5 border border-slate-800">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionState === 'connected'
                        ? 'bg-emerald-500'
                        : connectionState === 'disconnected'
                        ? 'bg-rose-500'
                        : 'bg-amber-500 animate-ping'
                    }`}
                  />
                  {connectionState === 'connected' ? 'Remote Peer' : connectionState === 'disconnected' ? 'Peer Disconnected' : 'Connecting...'}
                </div>
              </div>
            </div>
          </div>

          {/* WebRTC DataChannel P2P Chat */}
          <div className="lg:col-span-1 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col h-[400px] lg:h-auto">
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">RTC DataChannel Chat</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                P2P Encrypted
              </Badge>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[85%] text-xs ${
                      msg.sender === 'You'
                        ? 'bg-orange-600 text-white rounded-br-none'
                        : msg.sender === 'System'
                        ? 'bg-slate-800 text-slate-400 text-[11px] italic mx-auto rounded-full'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender !== 'System' && (
                    <span className="text-[10px] text-slate-500 mt-1 mx-1">
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message over P2P DataChannel..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <Button size="sm" onClick={sendMessage} className="bg-orange-600 hover:bg-orange-500 text-white">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
