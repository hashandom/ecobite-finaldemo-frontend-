import React, { ReactNode, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Spinner } from '@/components/ui';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: string;
  trendUp?: boolean;
  href?: string;
  loading?: boolean;
  progress?: number;
  sparklineData?: number[];
  isCurrency?: boolean;
}

// Animate counting up to the value
const CountUp = ({ end, duration = 1000, isCurrency = false }: { end: number; duration?: number; isCurrency?: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  const formattedValue = isCurrency
    ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(count)
    : count;

  return <span>{formattedValue}</span>;
};

export const StatCard = ({
  title,
  value,
  icon,
  iconColor = 'primary',
  trend,
  trendUp,
  href,
  loading = false,
  progress,
  sparklineData,
  isCurrency = false,
}: StatCardProps) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 stroke-primary',
    accent: 'text-accent bg-accent/10 stroke-accent',
    success: 'text-success bg-success/10 stroke-success',
    warning: 'text-warning bg-warning/10 stroke-warning',
    danger: 'text-danger bg-danger/10 stroke-danger',
  };

  const chartColor = {
    primary: 'var(--color-primary)',
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }[iconColor];

  const parsedValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
  const showCountUp = typeof value === 'number';

  const content = (
    <div className="flex flex-col h-full relative">
      <div className="flex items-start justify-between z-10">
        <div>
          <p className="text-sm font-medium text-muted mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-surface rounded animate-pulse" />
            ) : (
              <h4 className="text-3xl font-bold text-text tracking-tight">
                {showCountUp ? (
                  <CountUp end={parsedValue} isCurrency={isCurrency} />
                ) : (
                  isCurrency ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(Number(value) || 0) : value
                )}
              </h4>
            )}
            {trend && !loading && (
              <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {trendUp ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {trend}
              </span>
            )}
          </div>
        </div>
        
        {/* Icon or Progress Ring */}
        <div className="relative">
          {progress !== undefined ? (
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-border" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" 
                  className={colorClasses[iconColor].split(' ')[2]} 
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className={`absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[iconColor].split(' ').slice(0, 2).join(' ')}`}>
                {loading ? <Spinner size="sm" /> : icon}
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-xl ${colorClasses[iconColor].split(' ').slice(0, 2).join(' ')} shadow-inner`}>
              {loading ? <Spinner size="sm" /> : icon}
            </div>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && !loading && (
        <div className="h-12 w-full mt-4 -mx-2 -mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData.map((v, i) => ({ val: v, index: i }))}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke={chartColor} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block group">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30">
          {content}
        </div>
      </Link>
    );
  }

  return (
    <Card className="!p-0">
      <div className="p-6">
        {content}
      </div>
    </Card>
  );
};
