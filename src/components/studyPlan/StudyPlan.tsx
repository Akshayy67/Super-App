import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { BookOpen, Plus, List, FileText, Sparkles } from "lucide-react";
import { StudyPlanList } from "./StudyPlanList";
import { NewStudyPlanForm } from "./NewStudyPlanForm";
import { StudyPlanDetails } from "./StudyPlanDetails";
import { StudyPlan } from "../../types/studyPlan";
import { studyPlanService } from "../../utils/studyPlanService";
import { realTimeAuth } from "../../utils/realTimeAuth";

type Tab = "list" | "new" | "details";

export const StudyPlanManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ planId?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const isManualSelection = useRef(false);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  useEffect(() => {
    // Skip if this is a manual selection to prevent flickering
    if (isManualSelection.current) {
      isManualSelection.current = false;
      return;
    }

    // Check if we're on the "new" route by checking the pathname
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const isNewRoute = lastSegment === 'new' && pathSegments[pathSegments.length - 2] === 'study-plans';
    
    // Handle "new" route first
    if (isNewRoute) {
      setActiveTab("new");
      setSelectedPlan(null);
      return;
    }

    // Get planId from URL path parameter (only if not "new")
    const planId = params.planId;
    
    if (planId && plans.length > 0 && !loading) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        // Only update if it's a different plan
        setSelectedPlan((prev) => {
          if (prev?.id === plan.id) return prev;
          return plan;
        });
        setActiveTab((prev) => prev !== "details" ? "details" : prev);
        return;
      }
    }
    
    // Default to list if no planId
    if (!planId) {
      setActiveTab("list");
      setSelectedPlan(null);
    }
  }, [params.planId, location.pathname, plans, loading]);

  const loadPlans = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userPlans = await studyPlanService.getPlans(user.id);
      setPlans(userPlans);
    } catch (error) {
      console.error("Error loading study plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = async (planId: string) => {
    try {
      // Get the newly created plan directly from service
      const newPlan = await studyPlanService.getPlan(user!.id, planId);
      
      if (newPlan) {
        // Reload plans to update the list
        await loadPlans();
        
        // Auto-open the newly created plan
        isManualSelection.current = true;
        setSelectedPlan(newPlan);
        setActiveTab("details");
        navigate(`/tools/study-plans/${planId}`, { replace: false });
      } else {
        // Fallback: reload plans and go to list if plan not found
        await loadPlans();
        setActiveTab("list");
        navigate("/tools/study-plans", { replace: true });
      }
    } catch (error) {
      console.error("Error loading created plan:", error);
      // Fallback: reload plans and go to list
      await loadPlans();
      setActiveTab("list");
      navigate("/tools/study-plans", { replace: true });
    }
  };

  const handlePlanSelect = (plan: StudyPlan) => {
    isManualSelection.current = true;
    setSelectedPlan(plan);
    setActiveTab("details");
    navigate(`/tools/study-plans/${plan.id}`, { replace: false });
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedPlan(null);
    navigate("/tools/study-plans", { replace: true });
  };

  const handlePlanDeleted = async () => {
    await loadPlans();
    setActiveTab("list");
    setSelectedPlan(null);
    navigate("/tools/study-plans", { replace: true });
  };

  const handlePlanUpdated = async () => {
    await loadPlans();
    if (selectedPlan) {
      const updated = await studyPlanService.getPlan(user!.id, selectedPlan.id);
      if (updated) {
        setSelectedPlan(updated);
      }
    }
  };

  const tabs = [
    {
      id: "list" as Tab,
      label: "My Study Plans",
      icon: List,
    },
    {
      id: "new" as Tab,
      label: "New Plan",
      icon: Plus,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-b border-gray-200/50 dark:border-slate-700/50 shadow-lg shadow-purple-500/5 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-responsive-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Study Plans
                </h1>
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create and manage your learning goals with AI-powered roadmaps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {activeTab !== "details" && (
          <div className="tabs-mobile mt-6 flex gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Navigate to appropriate route
                    if (tab.id === "new") {
                      navigate("/tools/study-plans/new", { replace: true });
                    } else {
                      navigate("/tools/study-plans", { replace: true });
                    }
                  }}
                  className={`relative tab-mobile btn-touch flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive ? "active" : ""
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 transform scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-100 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl blur opacity-50"></div>
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${isActive ? "animate-bounce" : ""}`} />
                  <span className="text-responsive-sm font-medium truncate relative z-10">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 border-r-indigo-500"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your study plans...</p>
          </div>
        ) : activeTab === "list" ? (
          <StudyPlanList
            plans={plans}
            onPlanSelect={handlePlanSelect}
            onPlanDeleted={handlePlanDeleted}
          />
        ) : activeTab === "new" ? (
          <NewStudyPlanForm
            onPlanCreated={handlePlanCreated}
            onCancel={() => {
              setActiveTab("list");
              navigate("/tools/study-plans", { replace: true });
            }}
          />
        ) : activeTab === "details" && selectedPlan ? (
          <StudyPlanDetails
            plan={selectedPlan}
            onBack={handleBackToList}
            onPlanDeleted={handlePlanDeleted}
            onPlanUpdated={handlePlanUpdated}
          />
        ) : null}
      </div>
    </div>
  );
};

