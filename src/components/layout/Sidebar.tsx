import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  CheckSquare,
  StickyNote,
  MessageSquare,
  Brain,
  User,
  LogOut,
  X,
  BookOpen,
  Briefcase,
  Users,
  Video,
  MessageCircle,
  Clock,
  Calendar,
  Sparkles,
  Info,
  Target,
  FileText,
  Trophy,
  Zap,
  Code,
} from "lucide-react";
import { gsap } from "gsap";
import * as THREE from "three";
import { realTimeAuth } from "../../utils/realTimeAuth";
import { useCurrentRoute } from "../../hooks/useCurrentRoute";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useGlobalPomodoro } from "../../contexts/GlobalPomodoroContext";
import { ProfileService } from "../../services/profileService";
import { UserAvatar } from "../ui/UserAvatar";

interface SidebarProps {
  onLogout: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onLogout,
  isMobile = false,
  onCloseMobile,
}) => {
  const user = realTimeAuth.getCurrentUser();
  const navigate = useNavigate();
  const { activeView } = useCurrentRoute();
  const { showWidget, toggleEducation, currentSession } = useGlobalPomodoro();
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);

  // Fetch user profile photo
  useEffect(() => {
    const fetchUserProfilePhoto = async () => {
      if (user?.id) {
        try {
          const profile = await ProfileService.getProfileByUserId(user.id);
          if (profile?.photoURL) {
            setUserProfilePhoto(profile.photoURL);
          }
        } catch (error) {
          console.error("Error fetching user profile photo:", error);
        }
      }
    };

    fetchUserProfilePhoto();
  }, [user]);

  const menuItems = [
    { id: "files-notes", label: "Files and Short Notes", icon: FolderOpen, path: "/files-notes" },
    { id: "tasks", label: "To-Do List", icon: CheckSquare, path: "/tasks" },
    { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
    { id: "meetings", label: "Meetings", icon: Users, path: "/meetings" },
    { id: "journal", label: "Journal", icon: Sparkles, path: "/journal" },
    { id: "chat", label: "AI Assistant", icon: MessageSquare, path: "/chat" },
    { id: "tools", label: "Study Tools", icon: Brain, path: "/tools" },
    {
      id: "interview",
      label: "Interview Prep",
      icon: Briefcase,
      path: "/interview",
    },
    { id: "ai-assistant", label: "AI Learning Assistant", icon: Brain, path: "/ai-assistant", badge: "NEW" },
    { id: "predictive-dashboard", label: "Predictive Analytics", icon: Target, path: "/predictive-dashboard", badge: "AI" },
    { id: "study-rooms", label: "Study Rooms", icon: Video, path: "/study-rooms", badge: "NEW" },
    { id: "team", label: "Team Space", icon: Users, path: "/team" },
    { id: "community", label: "Community", icon: MessageCircle, path: "/community" },
    { id: "about", label: "About Us", icon: Info, path: "/about" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handlePomodoroClick = () => {
    showWidget();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getSessionLabel = () => {
    if (!currentSession || !currentSession.isActive) {
      return "Pomodoro Timer 🍅";
    }

    const timeStr = formatTime(currentSession.timeRemaining);
    const typeEmoji = 
      currentSession.type === 'work' ? '🎯' : 
      currentSession.type === 'shortBreak' ? '☕' : 
      '🌟';
    
    return `${typeEmoji} ${timeStr}`;
  };

  const getButtonStyle = () => {
    if (!currentSession || !currentSession.isActive) {
      return "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600";
    }

    if (currentSession.isPaused) {
      return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse";
    }

    switch (currentSession.type) {
      case 'work':
        return "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700";
      case 'shortBreak':
        return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600";
      case 'longBreak':
        return "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600";
      default:
        return "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600";
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js rotary phone effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      280 / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(280, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create rotary phone dial effect with numbers
    const rotors: THREE.Mesh[] = [];
    const rotorCount = 10;
    const dialRadius = 120;
    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    for (let i = 0; i < rotorCount; i++) {
      const rotorGeometry = new THREE.CylinderGeometry(10, 10, 18, 16);
      const rotorMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
      });
      const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);

      const angle = (i / rotorCount) * Math.PI * 2;
      rotor.position.set(
        Math.cos(angle) * dialRadius,
        Math.sin(angle) * dialRadius,
        0
      );
      rotor.rotation.z = Math.PI / 2;
      rotor.rotation.x = angle;

      scene.add(rotor);
      rotors.push(rotor);
      (rotor as any).baseAngle = angle;
      (rotor as any).rotationSpeed = 0.3 + Math.random() * 0.3;
      (rotor as any).pulseSpeed = 0.8 + Math.random() * 0.4;
      (rotor as any).number = numbers[i];
    }

    // Center hub (receiver)
    const hubGeometry = new THREE.CylinderGeometry(30, 30, 25, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.z = Math.PI / 2;
    hub.position.z = 8;
    scene.add(hub);

    // Inner number ring
    const numberRingGeometry = new THREE.TorusGeometry(dialRadius, 15, 8, 32);
    const numberRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const numberRing = new THREE.Mesh(numberRingGeometry, numberRingMaterial);
    scene.add(numberRing);

    // Connecting wires between rotors
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < rotorCount; i++) {
      const nextIndex = (i + 1) % rotorCount;
      const points = [
        new THREE.Vector3(
          Math.cos((i / rotorCount) * Math.PI * 2) * dialRadius,
          Math.sin((i / rotorCount) * Math.PI * 2) * dialRadius,
          0
        ),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos((nextIndex / rotorCount) * Math.PI * 2) * dialRadius,
          Math.sin((nextIndex / rotorCount) * Math.PI * 2) * dialRadius,
          0
        ),
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, wireMaterial);
      scene.add(line);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 300);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    camera.position.set(0, 0, 400);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate rotors
      rotors.forEach((rotor, i) => {
        const speed = (rotor as any).rotationSpeed;
        const pulse = (rotor as any).pulseSpeed;

        // Rotate around center
        const angle = (rotor as any).baseAngle + time * speed;
        rotor.position.x = Math.cos(angle) * dialRadius;
        rotor.position.y = Math.sin(angle) * dialRadius;

        // Spin on axis
        rotor.rotation.z += 0.02;
        rotor.rotation.y += 0.01;

        // Pulse scale
        const scale = 0.9 + Math.sin(time * pulse + i) * 0.1;
        rotor.scale.setScalar(scale);

        // Material pulse
        if (rotor.material instanceof THREE.MeshStandardMaterial) {
          rotor.material.emissiveIntensity = 0.3 + Math.sin(time * pulse * 2 + i) * 0.3;
          rotor.material.opacity = 0.6 + Math.sin(time * pulse + i) * 0.2;
        }
      });

      // Hub rotation
      hub.rotation.x += 0.01;
      hub.rotation.y += 0.015;

      // Mouse interaction with hub
      hub.position.x += (mouseX * 50 - hub.position.x) * 0.05;
      hub.position.y += (mouseY * 50 - hub.position.y) * 0.05;

      // Hub pulse
      const hubScale = 1 + Math.sin(time * 1.5) * 0.05;
      hub.scale.setScalar(hubScale);

      if (hub.material instanceof THREE.MeshStandardMaterial) {
        hub.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3;
      }

      // Number ring rotation
      numberRing.rotation.z += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = 280 / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(280, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      rotors.forEach((rotor) => {
        rotor.geometry.dispose();
        if (rotor.material instanceof THREE.Material) rotor.material.dispose();
      });
      hub.geometry.dispose();
      if (hub.material instanceof THREE.Material) hub.material.dispose();
      numberRing.geometry.dispose();
      if (numberRing.material instanceof THREE.Material) numberRing.material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-black h-full lg:h-screen shadow-2xl border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-500 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-90 relative" style={{ width: '100%', maxWidth: '100%', height: '100%', maxHeight: '100vh', zIndex: 30, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Three.js Rotary Phone Background - Hidden on mobile */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 right-0 w-[280px] h-full pointer-events-none opacity-20 dark:opacity-10 hidden lg:block"
        style={{ zIndex: 0 }}
      />

        {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header border-b border-gray-200 dark:border-gray-700 flex items-center justify-between lg:hidden backdrop-blur-sm bg-white/80 dark:bg-black/80 relative z-20">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105 min-w-0 flex-1 btn-touch group"
          >
            <img
              src="/SuperApp.png"
              alt="Super Study Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                console.error("Sidebar logo failed to load:", e);
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-responsive-base font-bold text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
                Super Study
              </span>
              <span className="text-responsive-xs text-gray-600 dark:text-gray-400 truncate">
                AI Powered Learning
              </span>
            </div>
          </button>
          <button
            onClick={onCloseMobile}
            className="btn-touch p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 transition-all duration-300 hover:scale-110"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Desktop Header */}
      <div
        className={`p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-black/50 dark:to-gray-900/50 ${
          isMobile ? "hidden lg:block" : ""
        } relative z-20 flex-shrink-0`}
      >
        <button
          onClick={() => handleNavigation("/dashboard")}
          className="text-left hover:opacity-80 transition-all duration-300 hover:scale-[1.02] w-full btn-touch group"
        >
          <div className="flex items-center space-x-3 mb-1">
            <div className="relative">
              <img
                src="/SuperApp.png"
                alt="Super Study Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  console.error("Desktop sidebar logo failed to load:", e);
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-display font-bold text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
                Super Study
              </h1>
              <p className="text-xs sm:text-sm font-body text-gray-500 dark:text-gray-400 font-medium">
                AI Powered Learning
              </p>
            </div>
          </div>
        </button>

        {/* Theme Toggle for Desktop */}
        <div className="mt-4 flex justify-center relative">
          <div className="relative z-30">
            <ThemeToggle variant="dropdown" showLabel={true} />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto overflow-x-hidden scroll-area-mobile relative z-20" style={{ padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)', flex: '1 1 0%', minHeight: 0, maxHeight: '100%', overflowY: 'auto' }}>
        <ul className="space-y-1 sm:space-y-2" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={(e) => {
                    handleNavigation(item.path);
                    // Rotary phone press animation
                    const target = e.currentTarget;
                    if (target) {
                      gsap.to(target, {
                        scale: 0.95,
                        duration: 0.15,
                        ease: "power2.out",
                        onComplete: () => {
                          if (target && document.body.contains(target)) {
                            gsap.to(target, {
                              scale: 1,
                              duration: 0.3,
                              ease: "back.out(2.5)",
                            });
                          }
                        }
                      });
                    }
                  }}
                  onMouseEnter={(e) => {
                    // Subtle lift effect on hover
                    gsap.to(e.currentTarget, {
                      y: -2,
                      duration: 0.2,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    // Return on leave
                    gsap.to(e.currentTarget, {
                      y: 0,
                      duration: 0.2,
                      ease: "power2.out",
                    });
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                  className={`btn-touch w-full flex items-center px-3 sm:px-4 py-3 text-left rounded-xl transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10 scale-105"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-800/80 dark:hover:to-gray-900/80 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:scale-[1.02] hover:-translate-y-0.5"
                  }`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full" 
                       style={{ transitionDuration: '0.7s' }} />
                  
                  {/* Background glow effect with morphing */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isActive ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10" : "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                  }`} 
                  style={{
                    backgroundSize: '200% 200%',
                    animation: isActive ? 'gradientShift 3s ease infinite' : 'none',
                  }} />
                  
                  {/* 3D top light effect */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon with 3D rotation */}
                  <div className="relative z-10 flex-shrink-0 mr-3"
                       style={{
                         transformStyle: 'preserve-3d',
                       }}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    } drop-shadow-sm`} />
                    {/* Icon glow */}
                    <div className={`absolute inset-0 w-5 h-5 rounded-full blur-sm transition-opacity duration-300 ${
                      isActive ? "opacity-100 bg-blue-500/50" : "opacity-0 group-hover:opacity-100 bg-blue-500/30"
                    }`} />
                  </div>
                  
                  <span className="font-heading font-medium text-responsive-sm truncate relative z-10">
                    {item.label}
                  </span>
                  
                  {/* Active indicator with pulse */}
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  )}
                  
                  {/* Hover arrow indicator */}
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-blue-500 dark:text-blue-400 text-sm">→</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Pomodoro Timer Button */}
        <div className="mt-4 px-1">
          <button
            onClick={handlePomodoroClick}
            className={`btn-touch w-full flex items-center px-3 sm:px-4 py-3 text-left rounded-lg transition-all ${getButtonStyle()} text-white shadow-md hover:shadow-lg relative overflow-hidden`}
          >
            {/* Progress bar background */}
            {currentSession && currentSession.isActive && (
              <div 
                className="absolute inset-0 bg-white/20 transition-all duration-1000"
                style={{ 
                  width: `${((currentSession.duration - currentSession.timeRemaining) / currentSession.duration) * 100}%` 
                }}
              />
            )}
            
            <Clock className={`w-5 h-5 mr-3 flex-shrink-0 relative z-10 ${currentSession?.isActive && !currentSession.isPaused ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            <span className="font-heading font-medium text-responsive-sm truncate relative z-10 font-mono">
              {getSessionLabel()}
            </span>
            
            {currentSession?.isPaused && (
              <span className="ml-auto text-xs relative z-10">⏸</span>
            )}
          </button>
        </div>
      </nav>

      {/* Footer with Profile and Sign Out - Visible on both mobile and desktop */}
      <div className="border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white dark:bg-black bg-gradient-to-t from-white/50 to-transparent dark:from-black/50 relative z-30 flex-shrink-0 safe-area-bottom" style={{ padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)', minHeight: 'auto', flexShrink: 0 }}>
        <button
          onClick={() => handleNavigation("/profile/edit")}
          className="w-full flex items-center mb-3 group hover:opacity-80 transition-all duration-300 hover:scale-[1.02] btn-touch"
        >
          <div className="mr-3 flex-shrink-0 transition-all duration-300 group-hover:scale-110">
            <UserAvatar
              photoURL={userProfilePhoto}
              name={user?.username || user?.email || "User"}
              size="sm"
              className="shadow-lg shadow-blue-500/30"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-responsive-sm font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {user?.username || "User"}
            </p>
            <p className="text-responsive-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </button>
        <button
          onClick={onLogout}
          className="btn-touch w-full flex items-center justify-center px-3 py-2.5 sm:py-2 text-responsive-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 hover:scale-[1.02] group border border-red-200 dark:border-red-800 font-medium"
          style={{ minHeight: '44px' }}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 transition-transform duration-300 group-hover:rotate-12" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
