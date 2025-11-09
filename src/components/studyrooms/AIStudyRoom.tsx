// AI-Powered Live Virtual Study Rooms with AI Chat - Fixed Version with WebRTC
import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Clock,
  Target,
  Zap,
  Eye,
  EyeOff,
  MessageSquare,
  Share2,
  Settings,
  LogOut,
  Award,
  Flame,
  Coffee,
  Brain,
  AlertCircle,
  CheckCircle,
  User as UserIcon,
  Bot,
  Sparkles,
  Send,
  Plus,
  X,
  Play,
  Pause,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { db } from "../../config/firebase";
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp, query, where, addDoc, getDocs } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface StudyRoomUser {
  userId: string;
  username: string;
  photo?: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  focusScore: number;
  studyMinutes: number;
  isFocused: boolean;
  lastActivity: Date;
}

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  maxParticipants: number;
  currentParticipants: number;
  users: StudyRoomUser[];
  pomodoroMinutes: number;
  breakMinutes: number;
  isInBreak: boolean;
  sessionStartTime: Date;
  createdBy: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  time: Date;
}

interface AIChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const AIStudyRoom: React.FC = () => {
  const user = realTimeAuth.getCurrentUser();
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Room creation
  const [newRoom, setNewRoom] = useState({
    name: "",
    topic: "",
    maxParticipants: 6,
    pomodoroMinutes: 25,
    breakMinutes: 5,
  });
  
  // Media state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  
  // WebRTC state - use refs to avoid re-render issues
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  // Focus detection
  const [focusScore, setFocusScore] = useState(100);
  const [isFocused, setIsFocused] = useState(true);
  const [studyMinutes, setStudyMinutes] = useState(0);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  
  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'group' | 'ai'>('group');
  
  const aiChatEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load rooms
  useEffect(() => {
    const roomsRef = collection(db, 'studyRooms');
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionStartTime: doc.data().sessionStartTime?.toDate() || new Date(),
      })) as StudyRoom[];
      setRooms(roomsData);
    });
    return () => unsubscribe();
  }, []);

  // Sync current room
  useEffect(() => {
    if (!currentRoom) return;
    
    const roomRef = doc(db, 'studyRooms', currentRoom.id);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = {
          id: snapshot.id,
          ...snapshot.data(),
          sessionStartTime: snapshot.data().sessionStartTime?.toDate() || new Date(),
        } as StudyRoom;
        setCurrentRoom(roomData);
      }
    });
    
    return () => unsubscribe();
  }, [currentRoom?.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatMode === 'ai') {
      aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, messages, chatMode]);

  // Ensure remote videos are playing when streams update
  useEffect(() => {
    if (remoteStreams.size > 0) {
      console.log("🎬 Remote streams updated, count:", remoteStreams.size);
      
      remoteStreams.forEach((stream, userId) => {
        const videoElement = remoteVideoRefs.current.get(userId);
        if (videoElement && stream) {
          console.log(`🎥 Updating remote video for ${userId}`);
          videoElement.srcObject = stream;
          videoElement.play().catch(err => {
            console.error(`❌ Error playing remote video for ${userId}:`, err);
          });
        }
      });
    }
  }, [remoteStreams]);

  // Ensure local video is playing when stream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log("🎥 Setting up local video with stream:", localStream.getTracks());
      console.log("🎥 Video tracks active:", localStream.getVideoTracks().map(t => ({ id: t.id, enabled: t.enabled, readyState: t.readyState })));
      console.log("🎥 Video ref current:", localVideoRef.current);
      
      localVideoRef.current.srcObject = localStream;
      
      // Ensure it's muted and plays inline
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;
      localVideoRef.current.autoplay = true;
      
      // Add event listeners to track video state
      localVideoRef.current.onloadedmetadata = () => {
        console.log("📹 Video metadata loaded");
      };
      
      localVideoRef.current.onplay = () => {
        console.log("▶️ Video started playing");
      };
      
      localVideoRef.current.onerror = (e) => {
        console.error("❌ Video error:", e);
      };
      
      // Try to play
      const playVideo = async () => {
        if (localVideoRef.current) {
          try {
            await localVideoRef.current.play();
            console.log("✅ Local video play() succeeded");
            console.log("📊 Video state:", {
              paused: localVideoRef.current.paused,
              readyState: localVideoRef.current.readyState,
              videoWidth: localVideoRef.current.videoWidth,
              videoHeight: localVideoRef.current.videoHeight
            });
          } catch (error) {
            console.error("❌ Error playing local video:", error);
          }
        }
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(playVideo, 100);
    } else {
      console.log("⚠️ Missing requirements:", { 
        hasStream: !!localStream, 
        hasRef: !!localVideoRef.current,
        isCameraOn 
      });
    }
  }, [localStream, isCameraOn]);

  // Focus detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const focused = !document.hidden;
      setIsFocused(focused);
      if (!focused) {
        setFocusScore(prev => Math.max(0, prev - 5));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || !currentRoom) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return currentRoom.isInBreak ? currentRoom.pomodoroMinutes * 60 : currentRoom.breakMinutes * 60;
        }
        return prev - 1;
      });
      
      // Increment study minutes
      if (!currentRoom.isInBreak) {
        setStudyMinutes(prev => prev + (1 / 60));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, currentRoom]);

  // WebRTC configuration
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { 
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  // Create peer connection for a user
  const createPeerConnection = async (userId: string, isInitiator: boolean) => {
    console.log(`🔗 Creating peer connection for ${userId}, initiator: ${isInitiator}`);
    
    const pc = new RTCPeerConnection(iceServers);
    
    // Add local stream tracks
    if (localStream) {
      console.log(`📤 Adding ${localStream.getTracks().length} tracks to peer connection`);
      localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, localStream);
        console.log(`✅ Added ${track.kind} track:`, track.id);
      });
    } else {
      console.warn("⚠️ No local stream available to add tracks");
    }
    
    // Add screen share tracks if sharing
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        pc.addTrack(track, screenStream);
      });
    }
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log(`📥 Received ${event.track.kind} track from ${userId}:`, event.track.id);
      console.log(`📥 Track state:`, { enabled: event.track.enabled, readyState: event.track.readyState });
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        let stream = newStreams.get(userId);
        
        if (!stream) {
          console.log(`🆕 Creating new MediaStream for ${userId}`);
          stream = new MediaStream();
          newStreams.set(userId, stream);
        }
        
        // Add the track if it doesn't exist
        if (!stream.getTracks().find(t => t.id === event.track.id)) {
          stream.addTrack(event.track);
          console.log(`✅ Added ${event.track.kind} track to remote stream. Total tracks:`, stream.getTracks().length);
        } else {
          console.log(`⚠️ Track already exists in stream`);
        }
        
        return newStreams;
      });
    };
    
    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && currentRoom) {
        await addDoc(collection(db, `studyRooms/${currentRoom.id}/iceCandidates`), {
          candidate: event.candidate.toJSON(),
          from: user?.id,
          to: userId,
          timestamp: serverTimestamp()
        });
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`🔌 Connection state for ${userId}:`, pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        console.log(`✅ Successfully connected to ${userId}`);
      } else if (pc.connectionState === 'failed') {
        console.error(`❌ Connection failed with ${userId}`);
      } else if (pc.connectionState === 'disconnected') {
        console.warn(`⚠️ Disconnected from ${userId}`);
      }
    };
    
    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state for ${userId}:`, pc.iceConnectionState);
    };
    
    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log(`📡 Signaling state for ${userId}:`, pc.signalingState);
    };
    
    // Store in ref
    peerConnectionsRef.current.set(userId, pc);
    
    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (currentRoom) {
        await addDoc(collection(db, `studyRooms/${currentRoom.id}/offers`), {
          offer: {
            type: offer.type,
            sdp: offer.sdp
          },
          from: user?.id,
          to: userId,
          timestamp: serverTimestamp()
        });
      }
    }
    
    return pc;
  };

  // Listen for offers
  useEffect(() => {
    if (!currentRoom || !user) return;
    
    const offersRef = collection(db, `studyRooms/${currentRoom.id}/offers`);
    const q = query(offersRef, where('to', '==', user.id));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const fromUserId = data.from;
          
          console.log(`Received offer from ${fromUserId}`);
          
          let pc = peerConnectionsRef.current.get(fromUserId);
          if (!pc) {
            pc = await createPeerConnection(fromUserId, false);
          }
          
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          await addDoc(collection(db, `studyRooms/${currentRoom.id}/answers`), {
            answer: {
              type: answer.type,
              sdp: answer.sdp
            },
            from: user.id,
            to: fromUserId,
            timestamp: serverTimestamp()
          });
          
          // Delete the offer
          await deleteDoc(change.doc.ref);
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentRoom?.id, user?.id]);

  // Listen for answers
  useEffect(() => {
    if (!currentRoom || !user) return;
    
    const answersRef = collection(db, `studyRooms/${currentRoom.id}/answers`);
    const q = query(answersRef, where('to', '==', user.id));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const fromUserId = data.from;
          
          console.log(`Received answer from ${fromUserId}`);
          
          const pc = peerConnectionsRef.current.get(fromUserId);
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          
          // Delete the answer
          await deleteDoc(change.doc.ref);
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentRoom?.id, user?.id]);

  // Listen for ICE candidates
  useEffect(() => {
    if (!currentRoom || !user) return;
    
    const candidatesRef = collection(db, `studyRooms/${currentRoom.id}/iceCandidates`);
    const q = query(candidatesRef, where('to', '==', user.id));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const fromUserId = data.from;
          
          const pc = peerConnectionsRef.current.get(fromUserId);
          if (pc && data.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
          
          // Delete the candidate
          await deleteDoc(change.doc.ref);
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentRoom?.id, user?.id]);

  // Screen sharing with proper renegotiation
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      console.log("🛑 Stopping screen share");
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          console.log("⏹️ Stopping screen track:", track.id);
          track.stop();
        });
        setScreenStream(null);
        
        // Replace screen tracks back with camera tracks
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          console.log("🔄 Replacing screen with camera track:", videoTrack?.id);
          
          for (const [userId, pc] of peerConnectionsRef.current.entries()) {
            const senders = pc.getSenders();
            const videoSender = senders.find(s => s.track?.kind === 'video');
            
            if (videoSender && videoTrack) {
              try {
                await videoSender.replaceTrack(videoTrack);
                console.log(`✅ Replaced screen with camera for ${userId}`);
                
                // Renegotiate after track change
                await renegotiateConnection(userId, pc);
              } catch (error) {
                console.error(`❌ Error replacing track for ${userId}:`, error);
              }
            }
          }
        }
      }
      
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        console.log("🖥️ Starting screen share");
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            cursor: 'always',
            displaySurface: 'monitor' 
          } as any,
          audio: false
        });
        
        console.log("✅ Got screen share stream:", stream.getVideoTracks());
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        // Display screen share in local view
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play().catch(err => console.error("Screen video play error:", err));
        }
        
        // Replace camera track with screen track in all peer connections
        const screenTrack = stream.getVideoTracks()[0];
        console.log("📤 Replacing camera with screen track for all peers");
        
        for (const [userId, pc] of peerConnectionsRef.current.entries()) {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          
          if (videoSender) {
            try {
              await videoSender.replaceTrack(screenTrack);
              console.log(`✅ Replaced camera with screen for ${userId}`);
              
              // Renegotiate after track change
              await renegotiateConnection(userId, pc);
            } catch (error) {
              console.error(`❌ Error replacing track for ${userId}:`, error);
            }
          } else {
            // No video sender exists, add the screen track
            pc.addTrack(screenTrack, stream);
            console.log(`➕ Added screen track for ${userId}`);
            
            // Renegotiate after adding track
            await renegotiateConnection(userId, pc);
          }
        }
        
        // Handle screen share stop (user clicks "Stop Sharing")
        screenTrack.onended = () => {
          console.log("⏹️ Screen share ended by user");
          toggleScreenShare();
        };
      } catch (error) {
        console.error('❌ Error starting screen share:', error);
        if ((error as Error).name === 'NotAllowedError') {
          alert('Screen sharing permission denied.');
        } else {
          alert('Could not start screen sharing. Please check permissions.');
        }
      }
    }
  };

  // Helper function to renegotiate connection after track changes
  const renegotiateConnection = async (userId: string, pc: RTCPeerConnection) => {
    if (!currentRoom || !user) return;
    
    try {
      console.log(`🔄 Renegotiating connection with ${userId}`);
      
      // Create new offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send the new offer
      await addDoc(collection(db, `studyRooms/${currentRoom.id}/offers`), {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        },
        from: user.id,
        to: userId,
        timestamp: serverTimestamp(),
        renegotiation: true
      });
      
      console.log(`✅ Renegotiation offer sent to ${userId}`);
    } catch (error) {
      console.error(`❌ Error renegotiating with ${userId}:`, error);
    }
  };

  const createRoom = async () => {
    if (!user) return;
    
    const roomId = `room_${Date.now()}`;
    const room: StudyRoom = {
      id: roomId,
      name: newRoom.name || "Untitled Study Room",
      topic: newRoom.topic || "General Study",
      maxParticipants: newRoom.maxParticipants,
      currentParticipants: 0,
      users: [],
      pomodoroMinutes: newRoom.pomodoroMinutes,
      breakMinutes: newRoom.breakMinutes,
      isInBreak: false,
      sessionStartTime: new Date(),
      createdBy: user.id,
    };

    await setDoc(doc(db, 'studyRooms', roomId), {
      ...room,
      sessionStartTime: serverTimestamp(),
    });

    setShowCreateForm(false);
    setNewRoom({ name: "", topic: "", maxParticipants: 6, pomodoroMinutes: 25, breakMinutes: 5 });
  };

  const joinRoom = async (room: StudyRoom) => {
    if (!user) return;
    
    // Start media with improved settings
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log("✅ Got media stream:", stream.getTracks());
      setLocalStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);
      
      // Ensure video plays with multiple attempts
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        
        // Try to play immediately
        try {
          await localVideoRef.current.play();
          console.log("✅ Video playing");
        } catch (err) {
          console.log("⚠️ Initial play failed, retrying...", err);
          // Retry after a short delay
          setTimeout(async () => {
            try {
              await localVideoRef.current?.play();
              console.log("✅ Video playing (retry succeeded)");
            } catch (retryErr) {
              console.error("❌ Video play failed after retry:", retryErr);
            }
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Error accessing media:", error);
      
      if (error.name === 'NotAllowedError') {
        alert('Camera/Microphone access denied. You can still join the room, but others won\'t see or hear you.\n\nTo enable:\n1. Click the camera icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page and try again');
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found. You can still join the room without video/audio.');
      } else {
        alert('Could not access camera/microphone. You can still join the room, but video/audio will be disabled.');
      }
      
      setIsCameraOn(false);
      setIsMicOn(false);
    }
    
    // Join room
    const newUser: StudyRoomUser = {
      userId: user.id,
      username: user.username || user.email || 'Anonymous',
      photo: user.photoURL || '',
      isCameraOn: isCameraOn,
      isMicOn: isMicOn,
      focusScore: 100,
      studyMinutes: 0,
      isFocused: true,
      lastActivity: new Date(),
    };
    
    const roomRef = doc(db, 'studyRooms', room.id);
    await updateDoc(roomRef, {
      users: [...room.users, newUser],
      currentParticipants: room.currentParticipants + 1,
    });
    
    setCurrentRoom(room);
    setTimeRemaining(room.pomodoroMinutes * 60);
    setIsRunning(true);
    
    // Create peer connections with existing users
    console.log("👥 Creating peer connections with", room.users.length, "existing users");
    for (const existingUser of room.users) {
      if (existingUser.userId !== user.id) {
        console.log("🔗 Creating peer connection with:", existingUser.username, existingUser.userId);
        await createPeerConnection(existingUser.userId, true);
      }
    }
    console.log("✅ All peer connections created, total:", peerConnectionsRef.current.size);
  };

  const leaveRoom = async () => {
    if (!currentRoom || !user) return;
    
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }
    
    // Stop screen share
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    setRemoteStreams(new Map());
    
    // Clear video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    
    const updatedUsers = currentRoom.users.filter(u => u.userId !== user.id);
    const roomRef = doc(db, 'studyRooms', currentRoom.id);
    
    if (updatedUsers.length === 0) {
      await deleteDoc(roomRef);
    } else {
      await updateDoc(roomRef, {
        users: updatedUsers,
        currentParticipants: updatedUsers.length,
      });
    }
    
    setCurrentRoom(null);
    setStudyMinutes(0);
    setFocusScore(100);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsRunning(false);
  };

  const toggleCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    } else {
      // Try to enable camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        if (localStream) {
          const videoTrack = stream.getVideoTracks()[0];
          localStream.addTrack(videoTrack);
        } else {
          setLocalStream(stream);
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream || stream;
          localVideoRef.current.play().catch(err => console.error("Video play error:", err));
        }
        
        setIsCameraOn(true);
      } catch (error) {
        console.error("Error enabling camera:", error);
        alert("Could not enable camera. Please check permissions.");
      }
    }
  };

  const toggleMic = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      // Try to enable mic
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        if (localStream) {
          const audioTrack = stream.getAudioTracks()[0];
          localStream.addTrack(audioTrack);
        } else {
          setLocalStream(stream);
        }
        
        setIsMicOn(true);
      } catch (error) {
        console.error("Error enabling microphone:", error);
        alert("Could not enable microphone. Please check permissions.");
      }
    }
  };

  // Listen for group chat messages
  useEffect(() => {
    if (!currentRoom) return;
    
    const messagesRef = collection(db, `studyRooms/${currentRoom.id}/messages`);
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          sender: data.sender,
          text: data.text,
          time: data.timestamp?.toDate() || new Date()
        });
      });
      msgs.sort((a, b) => a.time.getTime() - b.time.getTime());
      setMessages(msgs);
    });
    
    return () => unsubscribe();
  }, [currentRoom?.id]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentRoom || !user) return;
    
    try {
      await addDoc(collection(db, `studyRooms/${currentRoom.id}/messages`), {
        sender: user.username || user.email || 'Anonymous',
        text: messageInput,
        timestamp: serverTimestamp(),
        userId: user.id
      });
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    
    const userMessage = aiInput.trim();
    setAiInput("");
    
    // Add user message
    const newUserMsg: AIChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, newUserMsg]);
    
    setIsAiLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-pro";
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const context = `You are a helpful study assistant in a virtual study room. The current study topic is: ${currentRoom?.topic || 'general studying'}. Provide helpful, concise answers to help the user with their studies.`;
      
      const result = await model.generateContent(context + "\n\nUser: " + userMessage);
      const response = await result.response;
      const aiResponse = response.text();
      
      const newAiMsg: AIChatMessage = {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, newAiMsg]);
    } catch (error: any) {
      console.error("AI Error:", error);
      
      let errorMessage = "Sorry, I'm having trouble responding right now. Please try again.";
      
      if (error.message === "GEMINI_API_KEY_MISSING") {
        errorMessage = "⚠️ AI Chat is not configured. Please add your Gemini API key to the .env file:\n\nVITE_GOOGLE_AI_API_KEY=your_api_key_here\n\nGet your free API key from: https://makersuite.google.com/app/apikey";
      } else if (error.message?.includes("API key")) {
        errorMessage = "⚠️ Invalid API key. Please check your VITE_GOOGLE_AI_API_KEY in the .env file.";
      } else if (error.message?.includes("quota")) {
        errorMessage = "⚠️ API quota exceeded. Please check your Gemini API usage limits.";
      }
      
      const errorMsg: AIChatMessage = {
        role: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Please login to access Study Rooms</h2>
        </div>
      </div>
    );
  }

  // Show room interface if in a room
  if (currentRoom) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{currentRoom.name}</h2>
              <p className="text-sm text-gray-400">{currentRoom.topic}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pomodoro Timer */}
              <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-mono font-bold text-white">{formatTime(timeRemaining)}</span>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  {isRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                </button>
              </div>
              
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div className={`grid gap-4 h-full ${
              currentRoom.users.length === 1 ? 'grid-cols-1' :
              currentRoom.users.length === 2 ? 'grid-cols-2' :
              currentRoom.users.length <= 4 ? 'grid-cols-2 grid-rows-2' :
              'grid-cols-3 grid-rows-2'
            }`}>
              {/* Local user */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                {/* Always render video element to maintain ref */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Show placeholder when camera is off */}
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <UserIcon className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-medium">{user?.username || 'You'}</span>
                  {!isMicOn && <MicOff className="w-4 h-4 text-red-400" />}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 px-2 py-1 rounded-md">
                  <Flame className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">{focusScore}%</span>
                </div>
              </div>

              {/* Screen share view - always visible when anyone is sharing */}
              {isScreenSharing && screenStream && (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video col-span-2">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 px-3 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      You are sharing your screen
                    </span>
                  </div>
                </div>
              )}

              {/* Other participants */}
              {currentRoom.users.filter(u => u.userId !== user?.id).map((participant) => {
                const remoteStream = remoteStreams.get(participant.userId);
                const hasVideo = remoteStream && remoteStream.getVideoTracks().length > 0;
                const hasAudio = remoteStream && remoteStream.getAudioTracks().length > 0;
                
                console.log(`👤 Participant ${participant.username}:`, {
                  hasStream: !!remoteStream,
                  hasVideo,
                  hasAudio,
                  trackCount: remoteStream?.getTracks().length || 0
                });
                
                return (
                <div key={participant.userId} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                  {/* Always render video element for remote streams */}
                  {remoteStream && (
                    <video
                      ref={(el) => {
                        if (el && remoteStream) {
                          console.log(`🎥 Setting remote video for ${participant.username}`);
                          el.srcObject = remoteStream;
                          el.autoplay = true;
                          el.playsInline = true;
                          
                          // Try to play
                          el.play().then(() => {
                            console.log(`✅ Remote video playing for ${participant.username}`);
                          }).catch(err => {
                            console.error(`❌ Remote video play error for ${participant.username}:`, err);
                          });
                          
                          remoteVideoRefs.current.set(participant.userId, el);
                        }
                      }}
                      autoPlay
                      playsInline
                      className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
                    />
                  )}
                  
                  {/* Show placeholder when no video */}
                  {!hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      {participant.photo ? (
                        <img src={participant.photo} alt={participant.username} className="w-24 h-24 rounded-full" />
                      ) : (
                        <UserIcon className="w-16 h-16 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <span className="text-white text-sm font-medium">{participant.username}</span>
                    {!participant.isMicOn && <MicOff className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 px-2 py-1 rounded-md">
                    <Flame className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">{participant.focusScore}%</span>
                  </div>
                  {participant.isFocused ? (
                    <div className="absolute top-3 left-3 bg-green-600 p-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-red-600 p-1 rounded-full">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Stats */}
            <div className="p-4 space-y-3 border-b border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Study Time</span>
                <span className="text-white font-semibold">{Math.floor(studyMinutes)} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Participants</span>
                <span className="text-white font-semibold">{currentRoom.users.length}/{currentRoom.maxParticipants}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Avg Focus</span>
                <span className="text-white font-semibold">
                  {Math.round(currentRoom.users.reduce((acc, u) => acc + u.focusScore, 0) / currentRoom.users.length)}%
                </span>
              </div>
            </div>

            {/* Chat Mode Tabs */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={() => setChatMode('group')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    chatMode === 'group' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Group Chat
                </button>
                <button
                  onClick={() => setChatMode('ai')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    chatMode === 'ai' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  AI Chat
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMode === 'group' ? (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-400">{msg.sender}</span>
                        <span className="text-xs text-gray-500">
                          {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.text}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <>
                  {aiMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Ask me anything about your studies!</p>
                    </div>
                  )}
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      } px-3 py-2 rounded-lg`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-gray-700 px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={aiChatEndRef} />
                </>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              {chatMode === 'group' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                    placeholder="Ask AI a question..."
                    disabled={isAiLoading}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  <button
                    onClick={sendAiMessage}
                    disabled={isAiLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
              title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {isCameraOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
            </button>
            
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
              title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6 text-white" /> : <Monitor className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room list view
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-500" />
            AI Study Rooms
          </h1>
          <p className="text-gray-400">Join or create a study room with live video, AI chat, and focus tracking</p>
        </div>

        {/* Create Room Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showCreateForm ? 'Cancel' : 'Create Room'}
        </button>

        {/* Create Room Form */}
        {showCreateForm && (
          <div className="mb-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create Study Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., Math Study Group"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Study Topic</label>
                <input
                  type="text"
                  value={newRoom.topic}
                  onChange={(e) => setNewRoom({ ...newRoom, topic: e.target.value })}
                  placeholder="e.g., Calculus Chapter 5"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: Number(e.target.value) })}
                    min="2"
                    max="10"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Study Time (min)</label>
                  <input
                    type="number"
                    value={newRoom.pomodoroMinutes}
                    onChange={(e) => setNewRoom({ ...newRoom, pomodoroMinutes: Number(e.target.value) })}
                    min="15"
                    max="60"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Break (min)</label>
                  <input
                    type="number"
                    value={newRoom.breakMinutes}
                    onChange={(e) => setNewRoom({ ...newRoom, breakMinutes: Number(e.target.value) })}
                    min="5"
                    max="15"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={createRoom}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {/* Room List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{room.topic}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Participants</span>
                  <span className="text-white font-medium">{room.currentParticipants}/{room.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Study Duration</span>
                  <span className="text-white font-medium">{room.pomodoroMinutes} min</span>
                </div>
              </div>
              
              <button
                onClick={() => joinRoom(room)}
                disabled={room.currentParticipants >= room.maxParticipants}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {room.currentParticipants >= room.maxParticipants ? 'Room Full' : 'Join Room'}
              </button>
            </div>
          ))}
        </div>

        {rooms.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No active study rooms. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
};
