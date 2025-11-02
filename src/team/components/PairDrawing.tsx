import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Palette,
  RotateCcw,
  Download,
  Trash2,
  Users,
  MousePointer,
  Minus,
  MessageSquare,
  History,
  Save,
  ArrowLeft,
  Triangle,
  MoveRight,
  Highlighter,
  PaintBucket,
  X,
  UserPlus,
  Eye,
  Edit3,
} from 'lucide-react';
import { pairDrawingService } from '../../utils/pairDrawingService';
import { realTimeAuth } from '../../utils/realTimeAuth';
import {
  PairDrawingSession,
  DrawingPath,
  DrawingPoint,
  DrawingTool,
} from '../types/pairDrawingTypes';

interface PairDrawingProps {
  teamId: string;
  sessionId?: string;
  onClose?: () => void;
}

export const PairDrawing: React.FC<PairDrawingProps> = ({
  teamId,
  sessionId: initialSessionId,
  onClose,
}) => {
  const [sessions, setSessions] = useState<PairDrawingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PairDrawingSession | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  
  // UI state
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = realTimeAuth.getCurrentUser();

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#000080', '#008000', '#800000',
    '#FFFFFF'
  ];

  const sizes = [1, 2, 3, 5, 8, 12, 16, 20, 24, 32];

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [teamId]);

  // Subscribe to session updates
  useEffect(() => {
    if (initialSessionId) {
      joinExistingSession(initialSessionId);
    }
  }, [initialSessionId]);

  useEffect(() => {
    if (!currentSession) return;

    const unsubscribe = pairDrawingService.subscribeToSession(
      currentSession.id,
      (updatedSession) => {
        if (updatedSession) {
          setCurrentSession(updatedSession);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentSession?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.chat]);

  // Redraw canvas when session updates
  useEffect(() => {
    if (currentSession) {
      redrawCanvas();
    }
  }, [currentSession?.canvasData]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const fetchedSessions = await pairDrawingService.getTeamSessions(teamId, false);
      setSessions(fetchedSessions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newSessionTitle.trim()) {
      setError('Please enter a session title');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating drawing session with:', { teamId, newSessionTitle, newSessionDescription });

      const session = await pairDrawingService.createSession(
        teamId,
        newSessionTitle,
        newSessionDescription.trim() || undefined
      );

      console.log('Session created successfully:', session);

      setCurrentSession(session);
      setNewSessionTitle('');
      setNewSessionDescription('');
      setShowCreateSession(false);
      await loadSessions();
    } catch (err: any) {
      console.error('Error creating drawing session:', err);
      setError(err.message || 'Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinExistingSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await pairDrawingService.joinSession(sessionId);
      const session = await pairDrawingService.getSession(sessionId);
      setCurrentSession(session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async () => {
    if (!currentSession) return;

    try {
      await pairDrawingService.leaveSession(currentSession.id);
      setCurrentSession(null);
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    const confirmed = window.confirm('Are you sure you want to end this session? This will disconnect all participants.');
    if (!confirmed) return;

    try {
      await pairDrawingService.endSession(currentSession.id);
      setCurrentSession(null);
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const redrawCanvas = useCallback(() => {
    if (!currentSession) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasData = currentSession.canvasData;

    // Clear canvas
    ctx.fillStyle = canvasData.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(canvasData.zoom, canvasData.zoom);
    ctx.translate(canvasData.panX, canvasData.panY);

    // Draw all paths
    canvasData.paths.forEach(path => {
      drawPath(ctx, path);
    });

    ctx.restore();

    // Draw cursors
    if (currentSession.settings.showCursors) {
      drawCursors(ctx);
    }
  }, [currentSession]);

  const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length === 0 && path.tool !== 'text') return;

    ctx.save();
    ctx.strokeStyle = path.color;
    ctx.fillStyle = path.fillColor || path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = path.opacity || 1;

    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else if (path.tool === 'highlighter') {
      ctx.globalAlpha = 0.3;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    switch (path.tool) {
      case 'pen':
      case 'eraser':
      case 'highlighter':
        if (path.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'line':
        if (path.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          ctx.lineTo(path.points[path.points.length - 1].x, path.points[path.points.length - 1].y);
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          
          // Draw line
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const headLength = path.size * 5;
          
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - headLength * Math.cos(angle - Math.PI / 6),
            end.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(
            end.x - headLength * Math.cos(angle + Math.PI / 6),
            end.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.strokeRect(start.x, start.y, width, height);
          if (path.fillColor) {
            ctx.fillRect(start.x, start.y, width, height);
          }
        }
        break;

      case 'circle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          if (path.fillColor) {
            ctx.fill();
          }
        }
        break;

      case 'triangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          ctx.beginPath();
          ctx.moveTo(start.x + width / 2, start.y);
          ctx.lineTo(start.x, start.y + height);
          ctx.lineTo(start.x + width, start.y + height);
          ctx.closePath();
          ctx.stroke();
          if (path.fillColor) {
            ctx.fill();
          }
        }
        break;

      case 'text':
        if (path.text && path.textPosition) {
          ctx.fillStyle = path.color;
          ctx.font = `${path.size * 4}px Arial`;
          ctx.fillText(path.text, path.textPosition.x, path.textPosition.y);
        }
        break;
    }

    ctx.restore();
  };

  const drawCursors = (ctx: CanvasRenderingContext2D) => {
    if (!currentSession || !user) return;

    Object.entries(currentSession.cursors).forEach(([userId, cursor]) => {
      if (userId === user.id) return; // Don't draw own cursor

      ctx.save();
      
      // Draw cursor pointer
      ctx.fillStyle = cursor.color;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw username label
      ctx.fillStyle = 'white';
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 2;
      ctx.font = '12px Arial';
      const textWidth = ctx.measureText(cursor.userName).width;
      
      ctx.strokeRect(cursor.x + 12, cursor.y - 8, textWidth + 8, 18);
      ctx.fillRect(cursor.x + 12, cursor.y - 8, textWidth + 8, 18);
      
      ctx.fillStyle = cursor.color;
      ctx.fillText(cursor.userName, cursor.x + 16, cursor.y + 4);

      ctx.restore();
    });
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas || !currentSession) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasData = currentSession.canvasData;

    return {
      x: ((e.clientX - rect.left) * scaleX - canvasData.panX) / canvasData.zoom,
      y: ((e.clientY - rect.top) * scaleY - canvasData.panY) / canvasData.zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentSession || !user) return;

    const participant = currentSession.participants[user.id];
    if (participant?.role !== 'drawer') return;

    const point = getCanvasPoint(e);

    if (tool === 'text') {
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    const newPath: DrawingPath = {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tool,
      points: [point],
      color,
      size,
      userId: user.id,
      userName: user.username || user.email,
      timestamp: new Date(),
    };

    setCurrentPath(newPath);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentSession || !user) return;

    const point = getCanvasPoint(e);

    // Update cursor position
    pairDrawingService.updateCursor(currentSession.id, point.x, point.y);

    if (!isDrawing || !currentPath) return;

    const participant = currentSession.participants[user.id];
    if (participant?.role !== 'drawer') return;

    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      setCurrentPath({
        ...currentPath,
        points: [...currentPath.points, point],
      });
    } else {
      // For shapes, only keep start and current point
      setCurrentPath({
        ...currentPath,
        points: [currentPath.points[0], point],
      });
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !currentPath || !currentSession) return;

    setIsDrawing(false);

    // Add completed path to server
    try {
      await pairDrawingService.addDrawingPath(currentSession.id, currentPath);
    } catch (err: any) {
      console.error('Error adding path:', err);
    }

    setCurrentPath(null);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !textPosition || !currentSession || !user) return;

    const textPath: DrawingPath = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tool: 'text',
      points: [],
      color,
      size,
      userId: user.id,
      userName: user.username || user.email,
      timestamp: new Date(),
      text: textInput,
      textPosition,
    };

    try {
      await pairDrawingService.addDrawingPath(currentSession.id, textPath);
      setTextInput('');
      setTextPosition(null);
      setShowTextInput(false);
    } catch (err: any) {
      console.error('Error adding text:', err);
    }
  };

  const clearCanvas = async () => {
    if (!currentSession) return;

    const confirmed = window.confirm('Are you sure you want to clear the canvas?');
    if (!confirmed) return;

    try {
      await pairDrawingService.clearCanvas(currentSession.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const undo = async () => {
    if (!currentSession) return;

    try {
      await pairDrawingService.undoLastPath(currentSession.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveSnapshot = async () => {
    if (!currentSession) return;

    const description = window.prompt('Enter a description for this snapshot (optional):');

    try {
      await pairDrawingService.saveSnapshot(currentSession.id, description || undefined);
      alert('Snapshot saved!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing_${currentSession?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !currentSession) return;

    try {
      await pairDrawingService.sendMessage(currentSession.id, chatMessage);
      setChatMessage('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const switchParticipantRole = async (participantId: string) => {
    if (!currentSession) return;

    try {
      await pairDrawingService.switchRole(currentSession.id, participantId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Render current drawing path (preview)
  useEffect(() => {
    if (currentPath) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw everything
      redrawCanvas();

      // Draw current path
      if (currentSession) {
        ctx.save();
        ctx.scale(currentSession.canvasData.zoom, currentSession.canvasData.zoom);
        ctx.translate(currentSession.canvasData.panX, currentSession.canvasData.panY);
        drawPath(ctx, currentPath);
        ctx.restore();
      }
    }
  }, [currentPath, redrawCanvas, currentSession]);

  // If viewing a specific session
  if (currentSession) {
    const currentUserParticipant = user ? currentSession.participants[user.id] : null;
    const isCreator = user?.id === currentSession.createdBy;
    const isDrawer = currentUserParticipant?.role === 'drawer';

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={leaveSession}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentSession.title}
                </h2>
                {currentSession.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentSession.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live</span>
              </div>

              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {Object.keys(currentSession.participants).length}
                </span>
              </button>

              {isCreator && (
                <button
                  onClick={endSession}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Drawing Toolbar */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Tools */}
                  <div className="flex items-center gap-1 mr-4">
                    <ToolButton icon={MousePointer} tool="select" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Pen} tool="pen" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Highlighter} tool="highlighter" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Eraser} tool="eraser" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />
                    <ToolButton icon={Minus} tool="line" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={MoveRight} tool="arrow" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Square} tool="rectangle" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Circle} tool="circle" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Triangle} tool="triangle" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                    <ToolButton icon={Type} tool="text" currentTool={tool} setTool={setTool} disabled={!isDrawer} />
                  </div>

                  {/* Color Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      disabled={!isDrawer}
                      title="Color"
                    >
                      <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300 dark:border-slate-600"
                        style={{ backgroundColor: color }}
                      />
                    </button>

                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {colors.map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                setColor(c);
                                setShowColorPicker(false);
                              }}
                              className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                                color === c ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 dark:border-slate-600'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-300 dark:border-slate-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Size:</span>
                    <select
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value))}
                      disabled={!isDrawer}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    >
                      {sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}px
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={undo}
                    disabled={!isDrawer}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title="Undo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveSnapshot}
                    disabled={!isDrawer}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title="Save Snapshot"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    title="History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearCanvas}
                    disabled={!isDrawer}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportCanvas}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!isDrawer && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded">
                  You are in view-only mode. Ask the session creator to make you a drawer to edit.
                </div>
              )}
            </div>

            {/* Canvas */}
            <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-slate-900/50">
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  width={currentSession.canvasData.width}
                  height={currentSession.canvasData.height}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg cursor-crosshair border border-gray-200 dark:border-slate-700"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />

                {/* Text Input Modal */}
                {showTextInput && textPosition && (
                  <div
                    className="absolute bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 shadow-lg z-10"
                    style={{
                      left: textPosition.x,
                      top: textPosition.y,
                    }}
                  >
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text..."
                      className="w-48 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTextSubmit();
                        } else if (e.key === 'Escape') {
                          setShowTextInput(false);
                          setTextPosition(null);
                          setTextInput('');
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleTextSubmit}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowTextInput(false);
                          setTextPosition(null);
                          setTextInput('');
                        }}
                        className="px-3 py-1 text-sm bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
              <button
                onClick={() => { setShowChat(true); setShowHistory(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  showChat
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </div>
              </button>
              <button
                onClick={() => { setShowChat(false); setShowHistory(false); setShowParticipants(true); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  showParticipants && !showChat && !showHistory
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </div>
              </button>
              {showHistory && (
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </div>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {showHistory ? (
                <HistoryPanel
                  session={currentSession}
                  onRestore={async (snapshotId) => {
                    try {
                      await pairDrawingService.restoreSnapshot(currentSession.id, snapshotId);
                      setShowHistory(false);
                    } catch (err: any) {
                      setError(err.message);
                    }
                  }}
                />
              ) : showChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentSession.chat.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} currentUserId={user?.id} />
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <ParticipantsPanel
                  session={currentSession}
                  currentUserId={user?.id}
                  isCreator={isCreator}
                  onSwitchRole={switchParticipantRole}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session List View
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pair Drawing Sessions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Collaborate on drawings in real-time with your team
            </p>
          </div>
          <button
            onClick={() => setShowCreateSession(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>New Session</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Pen className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active drawing sessions
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create a new session to start drawing with your team
            </p>
            <button
              onClick={() => setShowCreateSession(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create Your First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} onJoin={joinExistingSession} />
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create Drawing Session
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="e.g., Design Brainstorm"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  placeholder="What are you working on?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateSession(false);
                  setNewSessionTitle('');
                  setNewSessionDescription('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                disabled={loading || !newSessionTitle.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components

const ToolButton: React.FC<{
  icon: React.ElementType;
  tool: DrawingTool;
  currentTool: DrawingTool;
  setTool: (tool: DrawingTool) => void;
  disabled?: boolean;
}> = ({ icon: Icon, tool, currentTool, setTool, disabled }) => (
  <button
    onClick={() => setTool(tool)}
    disabled={disabled}
    className={`p-2 rounded-lg transition-colors ${
      tool === currentTool
        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
    } disabled:opacity-50`}
    title={tool}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const ChatMessage: React.FC<{
  message: any;
  currentUserId?: string;
}> = ({ message, currentUserId }) => {
  if (message.type === 'system') {
    return (
      <div className="text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
          {message.message}
        </span>
      </div>
    );
  }

  const isOwn = message.userId === currentUserId;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {message.userName}
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const SessionCard: React.FC<{
  session: PairDrawingSession;
  onJoin: (sessionId: string) => void;
}> = ({ session, onJoin }) => {
  const participantCount = Object.keys(session.participants).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {session.title}
          </h3>
          {session.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{participantCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Active</span>
          </div>
        </div>

        <button
          onClick={() => onJoin(session.id)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Join
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-gray-500">
        Created by {session.creatorName} • {new Date(session.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

const ParticipantsPanel: React.FC<{
  session: PairDrawingSession;
  currentUserId?: string;
  isCreator: boolean;
  onSwitchRole: (participantId: string) => void;
}> = ({ session, currentUserId, isCreator, onSwitchRole }) => {
  const participants = Object.values(session.participants);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: participant.color }}
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {participant.name}
                {participant.id === currentUserId && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">(You)</span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {participant.role === 'drawer' ? (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Drawer</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Viewer</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isCreator && participant.id !== currentUserId && (
            <button
              onClick={() => onSwitchRole(participant.id)}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              {participant.role === 'drawer' ? 'Make Viewer' : 'Make Drawer'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const HistoryPanel: React.FC<{
  session: PairDrawingSession;
  onRestore: (snapshotId: string) => void;
}> = ({ session, onRestore }) => {
  const snapshots = session.drawingHistory;

  if (snapshots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No snapshots saved yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {snapshots.reverse().map((snapshot) => (
        <div
          key={snapshot.id}
          className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {snapshot.description && (
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {snapshot.description}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                By {snapshot.userName}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(snapshot.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onRestore(snapshot.id)}
              className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
            >
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

