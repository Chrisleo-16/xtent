
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  active?: boolean;
  completed?: boolean;
}

interface StepsProps {
  steps: Step[];
  className?: string;
}

export const Steps = ({ steps, className }: StepsProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center space-y-2">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                step.completed
                  ? "bg-green-600 border-green-600 text-white"
                  : step.active
                  ? "bg-green-100 border-green-600 text-green-600"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              )}
            >
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                step.active || step.completed
                  ? "text-green-600"
                  : "text-gray-500"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-4 transition-colors",
                steps[index + 1]?.completed || step.completed
                  ? "bg-green-600"
                  : "bg-gray-300"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
