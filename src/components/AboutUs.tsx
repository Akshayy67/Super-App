import React, { useEffect, useState, useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { useThemeContext } from "./ui/ThemeProvider";
import {
  HeroSection,
  PlatformGuideSection,
  FeaturesSection,
  WhyChooseUsSection,
  ContactSection,
} from "./AboutUs/index";
import { SkipToMainContent } from "./AboutUs/AccessibilityUtils";
import { AboutLayout } from "./layout/PageLayout";
import "./AboutUs/AboutUs.css";

export const AboutUs: React.FC = () => {
  const { resolvedTheme } = useThemeContext();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Demo functionality removed for production
  const containerRef = useRef<HTMLDivElement>(null);

  // Add body class for About Us specific styles
  useEffect(() => {
    document.body.classList.add("about-us-page");
    return () => {
      document.body.classList.remove("about-us-page");
    };
  }, []);

  // Check for reduced motion preference and mobile device
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    setPrefersReducedMotion(mediaQuery.matches);
    setIsMobile(mobileQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  // Parallax scroll effects - use window scroll for better compatibility
  const { scrollYProgress } = useScroll();

  // Disable parallax on mobile or if reduced motion is preferred
  const shouldDisableParallax = prefersReducedMotion || isMobile;

  // Different scroll speeds for parallax layers (disabled if reduced motion or mobile)
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldDisableParallax ? [0, 0] : [0, -100]
  );
  const platformY = useTransform(
    scrollYProgress,
    [0.2, 0.8],
    shouldDisableParallax ? [0, 0] : [0, -50]
  );
  const featuresY = useTransform(
    scrollYProgress,
    [0.4, 1],
    shouldDisableParallax ? [0, 0] : [0, -75]
  );
  const whyChooseY = useTransform(
    scrollYProgress,
    [0.6, 1],
    shouldDisableParallax ? [0, 0] : [0, -40]
  );

  // Smooth spring animations with optimized settings
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const heroYSpring = useSpring(heroY, springConfig);
  const platformYSpring = useSpring(platformY, springConfig);
  const featuresYSpring = useSpring(featuresY, springConfig);
  const whyChooseYSpring = useSpring(whyChooseY, springConfig);

  // Demo handlers removed for production

  return (
    <AboutLayout>
      <div
        ref={containerRef}
        className="min-h-screen transition-colors duration-300 parallax-container container-fluid"
      >
        {/* Skip to main content for accessibility */}
        <SkipToMainContent />

        {/* Hero Section */}
        <HeroSection
          prefersReducedMotion={prefersReducedMotion}
          yTransform={heroYSpring}
        />

        {/* Main content area */}
        <main id="main-content">
          {/* Platform Guide Section */}
          <PlatformGuideSection
            prefersReducedMotion={prefersReducedMotion}
            yTransform={platformYSpring}
          />

          {/* Features Showcase Section */}
          <FeaturesSection
            prefersReducedMotion={prefersReducedMotion}
            yTransform={featuresYSpring}
          />

          {/* Why Choose Us Section */}
          <WhyChooseUsSection
            prefersReducedMotion={prefersReducedMotion}
            yTransform={whyChooseYSpring}
          />

          {/* Contact Us Section */}
          <ContactSection prefersReducedMotion={prefersReducedMotion} />
        </main>

        {/* Demo viewer removed for production */}
      </div>
    </AboutLayout>
  );
};
