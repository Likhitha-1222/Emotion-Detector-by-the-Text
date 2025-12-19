
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { EmotionScore, EmotionType } from '../types';

interface EmotionChartProps {
  data: EmotionScore[];
  type: 'radar' | 'bar';
}

const COLORS: Record<string, string> = {
  [EmotionType.JOY]: '#fbbf24',    // Amber
  [EmotionType.SADNESS]: '#60a5fa', // Blue
  [EmotionType.ANGER]: '#f87171',   // Red
  [EmotionType.FEAR]: '#a78bfa',    // Violet
  [EmotionType.SURPRISE]: '#34d399', // Emerald
  [EmotionType.NEUTRAL]: '#94a3b8',  // Slate
  [EmotionType.DISGUST]: '#a3e635',  // Lime
};

export const EmotionChart: React.FC<EmotionChartProps> = ({ data, type }) => {
  if (type === 'radar') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
            <Radar
              name="Intensity"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis dataKey="label" type="category" width={80} tick={{ fontSize: 11 }} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.label] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
