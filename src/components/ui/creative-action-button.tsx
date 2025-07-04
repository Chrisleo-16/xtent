
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';

const buttonVariants = cva(
  'w-full h-24 p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-white font-semibold bg-gradient-to-br',
  {
    variants: {
      variant: {
        green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
        blue: 'from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600',
        orange: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
        purple: 'from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
        red: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
        gray: 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
        primary: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  }
);

export interface CreativeActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon: React.ComponentType<LucideProps>;
  label: string;
}

const CreativeActionButton = React.forwardRef<HTMLButtonElement, CreativeActionButtonProps>(
  ({ className, variant, icon: Icon, label, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant }), className)} ref={ref} {...props}>
        <div className="p-3 rounded-full mb-2 bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-center text-xs font-bold leading-tight tracking-wide">{label}</span>
      </button>
    );
  }
);
CreativeActionButton.displayName = 'CreativeActionButton';

export { CreativeActionButton, buttonVariants };
