import * as React from "react"
import { useState } from "react";

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

type Task = {
  title: string;
  steps: string[];
};

type TaskDropdownProps = {
  tasks: Task[];
};

const TaskDropdown: React.FC<TaskDropdownProps> = ({ tasks }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleStepClick = (taskIndex: number, stepIndex: number) => {
    if (taskIndex === currentTaskIndex && stepIndex === currentStepIndex) {
      if (stepIndex + 1 >= tasks[taskIndex].steps.length) {
        if (taskIndex + 1 < tasks.length) {
          setCurrentTaskIndex(taskIndex + 1);
          setCurrentStepIndex(0);
        }
      } else {
        setCurrentStepIndex(stepIndex + 1);
      }
    }
  };

  return (
    <div className="space-y-2">
      {tasks.length > 0 && (
        <details open className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <summary className="flex flex-col space-y-1.5 p-6 cursor-pointer hover:bg-accent hover:text-accent-foreground">
            {tasks[currentTaskIndex].title}
          </summary>
          <div className="p-6 pt-0">
            <ul className="space-y-1">
              {tasks[currentTaskIndex].steps.map((step, stepIndex) => (
                <li key={stepIndex}>
                  <button
                    className={cn(
                      "w-full px-3 py-2 rounded-md text-left transition-colors",
                      stepIndex === currentStepIndex 
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => handleStepClick(currentTaskIndex, stepIndex)}
                    disabled={stepIndex !== currentStepIndex}
                  >
                    {step}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, TaskDropdown }
