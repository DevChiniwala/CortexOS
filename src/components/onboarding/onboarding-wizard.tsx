import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useOnboardingStore } from "@/lib/store/onboarding-store"
import { Button } from "@/components/ui/button"
import {  IconTarget, IconBolt, IconRocket } from "@tabler/icons-react"

const STEPS = [
  {
    title: "Welcome to CortexOS",
    description: "The autonomous intelligence platform for deep web research and outbound pipeline generation. Let's get you set up.",
    icon: <img src="/logo.png" alt="CortexOS Logo" className="w-12 h-12 object-contain" />,
  },
  {
    title: "Define Your Targets",
    description: "Start by entering a company name or URL. CortexOS will automatically dispatch agents to scrape the web, read news, and evaluate their buying intent.",
    icon: <IconTarget className="w-12 h-12 text-primary" />,
  },
  {
    title: "Real-time Agent Streams",
    description: "Watch your agents work in real-time. Slide open the terminal on the right to see exactly what nodes they are traversing and what data they extract.",
    icon: <IconBolt className="w-12 h-12 text-primary" />,
  },
  {
    title: "Ready to Launch",
    description: "You're fully configured. Hit the command palette (Cmd+K) anywhere to navigate or spawn new jobs. Happy hunting.",
    icon: <IconRocket className="w-12 h-12 text-primary" />,
  }
]

export function OnboardingWizard() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboardingStore()
  const [currentStep, setCurrentStep] = React.useState(0)

  if (hasCompletedOnboarding) return null

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeOnboarding()
    }
  }

  const step = STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-surface border border-line shadow-2xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center gap-6"
        >
          <div className="p-4 bg-primary/10 rounded-full">
            {step.icon}
          </div>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-semibold text-ink">{step.title}</h2>
            <p className="text-ink-2 text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? "bg-primary" : "bg-line"}`}
                />
              ))}
            </div>
            
            <Button onClick={handleNext} className="gap-2">
              {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
