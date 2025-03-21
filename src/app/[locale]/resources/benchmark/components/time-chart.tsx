'use client'

import React from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Data for the time efficiency chart (lower is better)
const timeData = [
  { date: 'Jan 1', basic: 180, pro: 120 },
  { date: 'Jan 15', basic: 175, pro: 110 },
  { date: 'Feb 1', basic: 165, pro: 100 },
  { date: 'Feb 15', basic: 155, pro: 95 },
  { date: 'Mar 1', basic: 145, pro: 90 },
  { date: 'Mar 21', basic: 135, pro: 83 }, // current value
]

interface CustomTooltipProps extends TooltipProps<number, string> {
  isRTL?: boolean;
}

// Format seconds to minutes and seconds
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isRTL }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border-high-grey/30 dark:border-high-grey/30 bg-white/90 dark:bg-dark/90 shadow-lg">
        <CardContent className="p-3">
          <p className="text-dark-dark-grey dark:text-white-pure font-semibold">{`${isRTL ? 'التاريخ:' : 'Date:'} ${label}`}</p>
          <p className="text-mid-grey dark:text-mid-grey">
            {`${isRTL ? 'برومبتات أساسية:' : 'Basic Prompts:'} ${formatTime(payload[0].value as number)}`}
          </p>
          <p className="text-accent-purple dark:text-accent-purple">
            {`${isRTL ? 'برومبتات متقدمة:' : 'Pro Prompts:'} ${formatTime(payload[1].value as number)}`}
          </p>
        </CardContent>
      </Card>
    )
  }

  return null
}

interface TimeChartProps {
  isRTL?: boolean;
}

export default function TimeChart({ isRTL = false }: TimeChartProps) {
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
          data={timeData}
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
            domain={[60, 200]}
            ticks={[60, 80, 100, 120, 140, 160, 180, 200]}
            tickFormatter={(value) => formatTime(value)}
            // Reversed domain to show lower values as better
            reversed={true}
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
