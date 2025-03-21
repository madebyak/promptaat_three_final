'use client'

import React from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Data for the satisfaction chart
const satisfactionData = [
  { date: 'Jan 1', basic: 70, pro: 78 },
  { date: 'Jan 15', basic: 72, pro: 80 },
  { date: 'Feb 1', basic: 75, pro: 83 },
  { date: 'Feb 15', basic: 78, pro: 86 },
  { date: 'Mar 1', basic: 80, pro: 89 },
  { date: 'Mar 21', basic: 82, pro: 92 }, // current value
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
          {`${isRTL ? 'برومبتات أساسية:' : 'Basic Prompts:'} ${payload[0].value}%`}
        </p>
        <p className="text-accent-purple dark:text-accent-purple">
          {`${isRTL ? 'برومبتات متقدمة:' : 'Pro Prompts:'} ${payload[1].value}%`}
        </p>
      </div>
    )
  }

  return null
}

interface SatisfactionChartProps {
  isRTL?: boolean;
}

export default function SatisfactionChart({ isRTL = false }: SatisfactionChartProps) {
  const basicLabel = isRTL ? 'برومبتات أساسية' : 'Basic Prompts'
  const proLabel = isRTL ? 'برومبتات متقدمة' : 'Pro Prompts'
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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
      ref={ref}
      variants={chartVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={satisfactionData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 229, 229, 0.3)" className="dark:stroke-[#333333]" />
          <XAxis 
            dataKey="date" 
            stroke="#666" 
            tick={{ fill: '#666' }}
            className="dark:stroke-[#999999] dark:[&_.recharts-cartesian-axis-tick-value]:fill-[#999999]"
          />
          <YAxis 
            stroke="#666" 
            tick={{ fill: '#666' }}
            className="dark:stroke-[#999999] dark:[&_.recharts-cartesian-axis-tick-value]:fill-[#999999]"
            domain={[65, 95]}
            ticks={[65, 70, 75, 80, 85, 90, 95]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip isRTL={isRTL} />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              color: '#fff'
            }}
          />
          <Line
            type="monotone"
            dataKey="basic"
            name={basicLabel}
            stroke="#4e5564" // mid-grey
            strokeWidth={3}
            dot={{ r: 5, fill: '#4e5564', stroke: '#4e5564', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#4e5564', stroke: '#fff', strokeWidth: 2 }}
            animationBegin={300}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="pro"
            name={proLabel}
            stroke="#6d36f1" // accent-purple
            strokeWidth={3}
            dot={{ r: 5, fill: '#6d36f1', stroke: '#6d36f1', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: '#6d36f1', stroke: '#fff', strokeWidth: 2 }}
            animationBegin={800}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
