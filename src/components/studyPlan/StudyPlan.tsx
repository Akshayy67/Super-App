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
    await loadPlans();
    setActiveTab("list");
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("tab");
    window.history.pushState({}, "", newUrl.toString());
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-responsive">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-responsive-xl font-bold text-gray-900 dark:text-gray-100">
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
          <div className="tabs-mobile mt-4">
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
                  className={`tab-mobile btn-touch flex items-center gap-2 ${
                    isActive ? "active" : ""
                  } ${
                    isActive
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-responsive-sm font-medium truncate">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scroll-area container-safe py-responsive">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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

