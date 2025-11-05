import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const user = realTimeAuth.getCurrentUser();

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  useEffect(() => {
    // Check URL params for plan ID or tab
    const params = new URLSearchParams(location.search);
    const planId = params.get("plan");
    const tab = params.get("tab");
    
    if (planId && plans.length > 0) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setActiveTab("details");
        return;
      }
    }
    
    // Check for tab parameter
    if (tab === "new") {
      setActiveTab("new");
    } else if (tab === "list" || !tab) {
      setActiveTab("list");
    }
  }, [location.search, plans]);

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

  const handlePlanCreated = async () => {
    // First, switch to list tab immediately to close the form
    setActiveTab("list");
    
    // Update URL to remove tab parameter
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("tab");
    newUrl.searchParams.delete("plan");
    window.history.pushState({}, "", newUrl.toString());
    
    // Then reload plans to show the newly created plan
    await loadPlans();
  };

  const handlePlanSelect = (plan: StudyPlan) => {
    setSelectedPlan(plan);
    setActiveTab("details");
    navigate(`/study-plans?plan=${plan.id}`);
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedPlan(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("plan");
    newUrl.searchParams.delete("tab");
    window.history.pushState({}, "", newUrl.toString());
  };

  const handlePlanDeleted = async () => {
    await loadPlans();
    setActiveTab("list");
    setSelectedPlan(null);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("plan");
    newUrl.searchParams.delete("tab");
    window.history.pushState({}, "", newUrl.toString());
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
                    // Update URL without navigation to avoid route issues
                    const newUrl = new URL(window.location.href);
                    if (tab.id === "new") {
                      newUrl.searchParams.set("tab", "new");
                    } else {
                      newUrl.searchParams.delete("tab");
                    }
                    window.history.pushState({}, "", newUrl.toString());
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
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete("tab");
              window.history.pushState({}, "", newUrl.toString());
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

