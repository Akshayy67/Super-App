import { LucideIcon } from "lucide-react";

// Interface for feature items
export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Interface for value proposition items
export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

// Interface for contact information items
export interface ContactInfo {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
  color: string;
}

// Common props for section components
export interface SectionProps {
  prefersReducedMotion: boolean;
}

// Props for parallax sections
export interface ParallaxSectionProps extends SectionProps {
  yTransform?: any; // framer-motion transform value
  onOpenDemo?: (category?: string) => void;
}

// Demo viewer interfaces
export interface DemoStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  features: string[];
  category: "interview" | "video" | "study" | "analytics";
}

export interface DemoCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  steps: DemoStep[];
}

export interface DemoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}
