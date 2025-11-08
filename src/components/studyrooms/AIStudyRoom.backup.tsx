// AI-Powered Live Virtual Study Rooms - World Class Implementation
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
} from "lucide-react";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { db } from "../../config/firebase";
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp, query, where } from "firebase/firestore";

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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Focus detection
  const [focusScore, setFocusScore] = useState(100);
  const [isFocused, setIsFocused] = useState(true);
  const [studyMinutes, setStudyMinutes] = useState(0);
  
  // Pomodoro timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isInBreak, setIsInBreak] = useState(false);
  
  // Chat
  const [messages, setMessages] = useState<Array<{sender: string; text: string; time: Date}>>([]);
  const [messageInput, setMessageInput] = useState("");

  // Load available rooms
  useEffect(() => {
    const roomsQuery = query(collection(db, 'studyRooms'));
    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionStartTime: doc.data().sessionStartTime?.toDate(),
      })) as StudyRoom[];
      setRooms(roomsData);
    });
    
    return () => unsubscribe();
  }, []);

  // AI Focus Detection
  useEffect(() => {
    if (!currentRoom || !isCameraOn) return;
    
    // Simulate AI focus detection (in production, use face detection ML)
    const interval = setInterval(() => {
      // Check if user is looking at screen
      const isLookingAtScreen = document.hasFocus();
      setIsFocused(isLookingAtScreen);
      
      // Update focus score
      setFocusScore(prev => {
        if (isLookingAtScreen) {
          return Math.min(100, prev + 2);
        } else {
          return Math.max(0, prev - 5);
        }
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentRoom, isCameraOn]);

  // Study time tracker
  useEffect(() => {
    if (!currentRoom) return;
    
    const interval = setInterval(() => {
      setStudyMinutes(prev => prev + 1);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [currentRoom]);

  // Pomodoro timer
  useEffect(() => {
    if (!currentRoom || timeRemaining === 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer ended
          setIsInBreak(!isInBreak);
          return isInBreak ? newRoom.pomodoroMinutes * 60 : newRoom.breakMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentRoom, timeRemaining]);

  const createRoom = async () => {
    if (!user || !newRoom.name.trim()) return;
    
    const roomRef = doc(collection(db, 'studyRooms'));
    const roomData: StudyRoom = {
      id: roomRef.id,
      name: newRoom.name,
      topic: newRoom.topic,
      maxParticipants: newRoom.maxParticipants,
      currentParticipants: 0,
      users: [],
      pomodoroMinutes: newRoom.pomodoroMinutes,
      breakMinutes: newRoom.breakMinutes,
      isInBreak: false,
      sessionStartTime: new Date(),
      createdBy: user.id,
    };
    
    await setDoc(roomRef, {
      ...roomData,
      sessionStartTime: serverTimestamp(),
    });
    
    setShowCreateForm(false);
    setNewRoom({ name: "", topic: "", maxParticipants: 6, pomodoroMinutes: 25, breakMinutes: 5 });
  };

  const joinRoom = async (room: StudyRoom) => {
    if (!user) return;
    
    // Start media (optional - user can join without camera/mic)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setLocalStream(stream);
      
      // Set video source immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        // Play video automatically
        localVideoRef.current.play().catch(err => console.error("Video play error:", err));
      }
      
      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (error: any) {
      console.error("Error accessing media:", error);
      
      // Show user-friendly message
      if (error.name === 'NotAllowedError') {
        alert('Camera/Microphone access denied. You can still join the room, but others won\'t see or hear you.\n\nTo enable:\n1. Click the camera icon in your browser address bar\n2. Allow camera and microphone access\n3. Refresh the page and try again');
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found. You can still join the room without video/audio.');
      } else {
        alert('Could not access camera/microphone. You can still join the room, but video/audio will be disabled.');
      }
      
      // Continue joining without media
      setIsCameraOn(false);
      setIsMicOn(false);
    }
    
    // Join room
    const newUser: StudyRoomUser = {
      userId: user.id,
      username: user.username || user.email || 'Anonymous',
      photo: user.photoURL || '',
      isCameraOn: true,
      isMicOn: true,
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
  };

  const leaveRoom = async () => {
    if (!currentRoom || !user) return;
    
    // Stop media
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Update room
    const updatedUsers = currentRoom.users.filter(u => u.userId !== user.id);
    const roomRef = doc(db, 'studyRooms', currentRoom.id);
    
    if (updatedUsers.length === 0) {
      // Delete room if empty
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
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    setMessages([...messages, {
      sender: user?.displayName || 'You',
      text: messageInput,
      time: new Date()
    }]);
    setMessageInput("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentRoom) {
    // Room selection screen
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">AI-Powered Study Rooms</h1>
          <p className="text-white/90">Study together with AI focus tracking and Pomodoro timer</p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Rooms</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Room
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Study Room</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., DSA Study Group"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  value={newRoom.topic}
                  onChange={(e) => setNewRoom({ ...newRoom, topic: e.target.value })}
                  placeholder="e.g., Dynamic Programming"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Study Time (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    value={newRoom.pomodoroMinutes}
                    onChange={(e) => setNewRoom({ ...newRoom, pomodoroMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Break Time (min)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={newRoom.breakMinutes}
                    onChange={(e) => setNewRoom({ ...newRoom, breakMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={createRoom}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{room.name}</h3>
              {room.topic && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{room.topic}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{room.currentParticipants}/{room.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{room.pomodoroMinutes}/{room.breakMinutes} min</span>
                </div>
              </div>
              
              <button
                onClick={() => joinRoom(room)}
                disabled={room.currentParticipants >= room.maxParticipants}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {room.currentParticipants >= room.maxParticipants ? 'Room Full' : 'Join Room'}
              </button>
            </div>
          ))}
          
          {rooms.length === 0 && !showCreateForm && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No active study rooms. Be the first to create one!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create First Room
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // In-room view
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{currentRoom.name}</h2>
            {currentRoom.topic && <p className="text-gray-400 text-sm">{currentRoom.topic}</p>}
          </div>
          
          {/* Pomodoro Timer */}
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isInBreak ? 'bg-green-600' : 'bg-blue-600'}`}>
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-mono text-xl">{formatTime(timeRemaining)}</span>
              <span className="text-white/80 text-sm">{isInBreak ? 'Break' : 'Focus'}</span>
            </div>
            
            {/* Focus Score */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">{focusScore}%</span>
              {isFocused ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-300" />
              )}
            </div>
            
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Leave
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
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <UserIcon className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-white text-sm font-medium">{user?.displayName || 'You'}</span>
                {!isMicOn && <MicOff className="w-4 h-4 text-red-400" />}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 px-2 py-1 rounded-md">
                <Flame className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-bold">{focusScore}%</span>
              </div>
            </div>

            {/* Other participants */}
            {currentRoom.users.filter(u => u.userId !== user?.id).map((participant) => (
              <div key={participant.userId} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                  {participant.photo ? (
                    <img src={participant.photo} alt={participant.username} className="w-24 h-24 rounded-full" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-500" />
                  )}
                </div>
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
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Stats */}
          <div className="p-4 space-y-3 border-b border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Study Time</span>
              <span className="text-white font-semibold">{studyMinutes} min</span>
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

          {/* Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            </div>
            
            <div className="p-4 border-t border-gray-700">
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
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isCameraOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>
          
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};
