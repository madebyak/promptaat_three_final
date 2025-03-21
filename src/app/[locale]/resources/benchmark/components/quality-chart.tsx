'use client'

import React from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Data for the quality chart
const qualityData = [
  { date: 'Jan 1', basic: 3.2, pro: 3.5 },
  { date: 'Jan 15', basic: 3.3, pro: 3.7 },
  { date: 'Feb 1', basic: 3.4, pro: 3.9 },
  { date: 'Feb 15', basic: 3.5, pro: 4.0 },
  { date: 'Mar 1', basic: 3.6, pro: 4.1 },
  { date: 'Mar 21', basic: 3.7, pro: 4.2 }, // current value
]

interface CustomTooltipProps extends TooltipProps<number, string> {
  isRTL?: boolean;
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isRTL }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-grey-light/90 dark:bg-dark/90 border border-light-high-grey/30 dark:border-high-grey/30 p-3 rounded-md shadow-lg">
        <p className="text-dark-dark-grey dark:text-white-pure font-semibold">{`${isRTL ? 'التاريخ:' : 'Date:'} ${label}`}</p>
        <p className="text-mid-grey dark:text-mid-grey">
          {`${isRTL ? 'برومبتات أساسية:' : 'Basic Prompts:'} ${payload[0].value}/5`}
        </p>
        <p className="text-accent-purple dark:text-accent-purple">
          {`${isRTL ? 'برومبتات متقدمة:' : 'Pro Prompts:'} ${payload[1].value}/5`}
        </p>
      </div>
    )
  }

  return null
}

interface QualityChartProps {
  isRTL?: boolean;
}

export default function QualityChart({ isRTL = false }: QualityChartProps) {
  const basicLabel = isRTL ? 'برومبتات أساسية' : 'Basic Prompts'
  const proLabel = isRTL ? 'برومبتات متقدمة' : 'Pro Prompts'
  
  const [chartRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Animation variants
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  return (
    <motion.div 
      ref={chartRef}
      variants={chartVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={qualityData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-[#DDDDDD] dark:stroke-[#333333]" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            className="fill-[#555555] dark:fill-[#999999]"
            stroke="#555555"
            tick={{ fill: '#555555', stroke: 'none' }}
          />
          <YAxis 
            className="fill-[#555555] dark:fill-[#999999]"
            stroke="#555555"
            tick={{ fill: '#555555', stroke: 'none' }}
            domain={[3, 5]}
            ticks={[3, 3.5, 4, 4.5, 5]}
          />
          <Tooltip content={<CustomTooltip isRTL={isRTL} />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              color: '#333333'
            }}
            formatter={(value) => (
              <span className="text-dark-dark-grey dark:text-white-pure">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="basic"
            name={basicLabel}
            stroke="#4e5564" // mid-grey
            strokeWidth={3}
            dot={{ r: 5, fill: '#4e5564', stroke: '#4e5564', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#4e5564', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="pro"
            name={proLabel}
            stroke="#6d36f1" // accent-purple
            strokeWidth={3}
            dot={{ r: 5, fill: '#6d36f1', stroke: '#6d36f1', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#6d36f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
