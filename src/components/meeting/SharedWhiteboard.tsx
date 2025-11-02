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
  Upload,
  Trash2,
  Users,
  MousePointer,
  Minus,
} from 'lucide-react';
import { meetingWhiteboardService } from '../../services/meetingWhiteboardService';
import { realTimeAuth } from '../../utils/realTimeAuth';

interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

interface DrawingPath {
  id: string;
  tool: 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text';
  points: DrawingPoint[];
  color: string;
  size: number;
  userId: string;
  userName: string;
  timestamp: Date;
  text?: string;
  textPosition?: { x: number; y: number };
}

interface WhiteboardState {
  paths: DrawingPath[];
  background: string;
  zoom: number;
  panX: number;
  panY: number;
}

interface SharedWhiteboardProps {
  sessionId?: string;
  isReadOnly?: boolean;
  className?: string;
}

export const SharedWhiteboard: React.FC<SharedWhiteboardProps> = ({
  sessionId,
  isReadOnly = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'select'>('pen');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    paths: [],
    background: '#ffffff',
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#000080', '#008000', '#800000'
  ];

  const sizes = [1, 2, 3, 5, 8, 12, 16, 20];

  // Get current user from auth
  const [currentUser, setCurrentUser] = React.useState<{ id: string; name: string }>({
    id: 'user_123',
    name: 'Current User',
  });
  
  // Track if we're syncing from remote to avoid infinite loops
  const [isSyncingFromRemote, setIsSyncingFromRemote] = useState(false);
  const [isHost, setIsHost] = useState(false);
  // Track the last path ID we sent to avoid processing our own updates
  const lastSentPathIdRef = useRef<string | null>(null);

  React.useEffect(() => {
    const user = realTimeAuth.getCurrentUser();
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.displayName || user.email || 'User',
      });
    }
  }, []);

  // Subscribe to whiteboard updates when sessionId is provided
  useEffect(() => {
    if (!sessionId) return;

    let isProcessing = false;

    // Subscribe to whiteboard updates
    const unsubscribe = meetingWhiteboardService.subscribeToWhiteboard(
      sessionId,
      (whiteboardState) => {
        if (whiteboardState && !isSyncingFromRemote && !isProcessing) {
          // Check if this update is from our own action (ignore if the last path matches what we sent)
          if (whiteboardState.paths.length > 0) {
            const lastPath = whiteboardState.paths[whiteboardState.paths.length - 1];
            const isOurUpdate = lastPath && lastPath.id === lastSentPathIdRef.current;
            
            // If it's our update, reset the ref and don't process (we already have it locally)
            if (isOurUpdate) {
              lastSentPathIdRef.current = null;
              return;
            }
          }
          
          isProcessing = true;
          setIsSyncingFromRemote(true);
          
          console.log('📝 Receiving whiteboard update:', whiteboardState.paths.length, 'paths');
          
          setWhiteboardState(prev => {
            // Only update if paths are actually different to avoid unnecessary redraws
            const pathsChanged = JSON.stringify(prev.paths) !== JSON.stringify(whiteboardState.paths);
            const backgroundChanged = prev.background !== whiteboardState.background;
            
            if (pathsChanged || backgroundChanged) {
              console.log('✅ Updating whiteboard state with', whiteboardState.paths.length, 'paths');
              return {
                ...prev,
                paths: whiteboardState.paths,
                background: whiteboardState.background,
              };
            }
            return prev;
          });
          
          setTimeout(() => {
            setIsSyncingFromRemote(false);
            isProcessing = false;
          }, 100);
        }
      }
    );

    // Check if user is host for undo permissions
    if (sessionId) {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        import('../../config/firebase').then(({ db }) => {
          const meetingRef = doc(db, 'videoMeetings', sessionId);
          getDoc(meetingRef).then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const user = realTimeAuth.getCurrentUser();
              setIsHost(data.hostId === user?.id);
            }
          }).catch((error) => {
            console.error('Error checking host status:', error);
          });
        });
      });
    }

    return () => {
      unsubscribe();
      meetingWhiteboardService.unsubscribeFromWhiteboard(sessionId);
    };
  }, [sessionId]);

  useEffect(() => {
    redrawCanvas();
  }, [whiteboardState]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = whiteboardState.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(whiteboardState.zoom, whiteboardState.zoom);
    ctx.translate(whiteboardState.panX, whiteboardState.panY);

    // Draw all paths
    whiteboardState.paths.forEach(path => {
      drawPath(ctx, path);
    });

    ctx.restore();
  }, [whiteboardState]);

  const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    switch (path.tool) {
      case 'pen':
      case 'eraser':
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

      case 'rectangle':
        if (path.points.length >= 2) {
          const start = path.points[0];
          const end = path.points[path.points.length - 1];
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.strokeRect(start.x, start.y, width, height);
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

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: ((e.clientX - rect.left) * scaleX - whiteboardState.panX) / whiteboardState.zoom,
      y: ((e.clientY - rect.top) * scaleY - whiteboardState.panY) / whiteboardState.zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;

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
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date(),
    };

    setCurrentPath(newPath);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || isReadOnly) return;

    const point = getCanvasPoint(e);
    
    if (tool === 'pen' || tool === 'eraser') {
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
    if (!isDrawing || !currentPath) return;

    setIsDrawing(false);
    
    // Add completed path to whiteboard state locally first
    setWhiteboardState(prev => ({
      ...prev,
      paths: [...prev.paths, currentPath],
    }));

    // Sync to Firestore if sessionId is provided
    if (sessionId && !isReadOnly) {
      try {
        lastSentPathIdRef.current = currentPath.id;
        console.log('📤 Sending path to whiteboard:', currentPath.id);
        await meetingWhiteboardService.addPath(sessionId, currentPath);
        console.log('✅ Path sent successfully');
      } catch (error) {
        console.error('❌ Error syncing path to whiteboard:', error);
        lastSentPathIdRef.current = null;
      }
    }

    setCurrentPath(null);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !textPosition) return;

    const textPath: DrawingPath = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tool: 'text',
      points: [],
      color,
      size,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date(),
      text: textInput,
      textPosition,
    };

    // Add text path locally first
    setWhiteboardState(prev => ({
      ...prev,
      paths: [...prev.paths, textPath],
    }));

    // Sync to Firestore if sessionId is provided
    if (sessionId && !isReadOnly) {
      try {
        lastSentPathIdRef.current = textPath.id;
        await meetingWhiteboardService.addPath(sessionId, textPath);
      } catch (error) {
        console.error('Error syncing text path to whiteboard:', error);
        lastSentPathIdRef.current = null;
      }
    }

    setTextInput('');
    setTextPosition(null);
    setShowTextInput(false);
  };

  const clearCanvas = async () => {
    // Clear locally first
    setWhiteboardState(prev => ({
      ...prev,
      paths: [],
    }));

    // Sync to Firestore if sessionId is provided
    if (sessionId && !isReadOnly) {
      try {
        await meetingWhiteboardService.clearCanvas(sessionId);
      } catch (error) {
        console.error('Error clearing whiteboard:', error);
      }
    }
  };

  const undo = async () => {
    if (whiteboardState.paths.length === 0) return;

    const lastPath = whiteboardState.paths[whiteboardState.paths.length - 1];
    const isLastPathOwner = lastPath.userId === currentUser.id;

    // Only allow undo if user is host or drew the last path
    if (!isHost && !isLastPathOwner) {
      alert('You can only undo your own drawings');
      return;
    }

    // Undo locally first
    setWhiteboardState(prev => ({
      ...prev,
      paths: prev.paths.slice(0, -1),
    }));

    // Sync to Firestore if sessionId is provided
    if (sessionId && !isReadOnly) {
      try {
        await meetingWhiteboardService.undoLastPath(sessionId);
      } catch (error) {
        console.error('Error undoing path:', error);
        // Revert local state on error
        setWhiteboardState(prev => ({
          ...prev,
          paths: [...prev.paths, lastPath],
        }));
      }
    }
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Render current drawing path
  useEffect(() => {
    if (currentPath) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw everything
      redrawCanvas();

      // Draw current path
      ctx.save();
      ctx.scale(whiteboardState.zoom, whiteboardState.zoom);
      ctx.translate(whiteboardState.panX, whiteboardState.panY);
      drawPath(ctx, currentPath);
      ctx.restore();
    }
  }, [currentPath, redrawCanvas, whiteboardState.zoom, whiteboardState.panX, whiteboardState.panY]);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Toolbar - Hidden in read-only mode */}
      {!isReadOnly && (
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Tools */}
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={() => setTool('select')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'select'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Select"
              >
                <MousePointer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'pen'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Pen"
              >
                <Pen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'eraser'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('line')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'line'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Line"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('rectangle')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'rectangle'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Rectangle"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('circle')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'circle'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('text')}
                className={`p-2 rounded-lg transition-colors ${
                  tool === 'text'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                title="Text"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                        className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                          color === c ? 'border-blue-500' : 'border-gray-300 dark:border-slate-600'
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
                className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
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
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Clear"
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
            {sessionId && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <Users className="w-4 h-4" />
                <span className="text-sm">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-96"
          style={{ cursor: isReadOnly ? 'default' : 'crosshair' }}
          onMouseDown={!isReadOnly ? handleMouseDown : undefined}
          onMouseMove={!isReadOnly ? handleMouseMove : undefined}
          onMouseUp={!isReadOnly ? handleMouseUp : undefined}
          onMouseLeave={!isReadOnly ? handleMouseUp : undefined}
        />

        {/* Text Input Modal */}
        {showTextInput && textPosition && (
          <div
            className="absolute bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 shadow-lg z-10"
            style={{
              left: textPosition.x * whiteboardState.zoom + whiteboardState.panX,
              top: textPosition.y * whiteboardState.zoom + whiteboardState.panY,
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              className="w-48 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyPress={(e) => {
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

        {isReadOnly && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Read-only mode</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
