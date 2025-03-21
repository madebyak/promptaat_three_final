'use client'

import React from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Data for the accuracy chart
const accuracyData = [
  { date: 'Jan 1', basic: 76, pro: 84 },
  { date: 'Jan 15', basic: 78, pro: 86 },
  { date: 'Feb 1', basic: 80, pro: 88 },
  { date: 'Feb 15', basic: 82, pro: 90 },
  { date: 'Mar 1', basic: 83, pro: 89 }, // slight drop for pro
  { date: 'Mar 21', basic: 84, pro: 92 }, // current value
]

interface CustomTooltipProps extends TooltipProps<number, string> {
  isRTL?: boolean;
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isRTL }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border-light-high-grey/30 dark:border-high-grey/30 bg-light-grey-light/90 dark:bg-dark/90 shadow-lg">
        <CardContent className="p-3">
          <p className="text-dark-dark-grey dark:text-white-pure font-semibold">{`${isRTL ? 'التاريخ:' : 'Date:'} ${label}`}</p>
          <p className="text-dark-grey dark:text-mid-grey">
            {`${isRTL ? 'برومبتات أساسية:' : 'Basic Prompts:'} ${payload[0].value}%`}
          </p>
          <p className="text-accent-purple dark:text-accent-purple">
            {`${isRTL ? 'برومبتات متقدمة:' : 'Pro Prompts:'} ${payload[1].value}%`}
          </p>
        </CardContent>
      </Card>
    )
  }

  return null
}

interface AccuracyChartProps {
  isRTL?: boolean;
}

export default function AccuracyChart({ isRTL = false }: AccuracyChartProps) {
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
          data={accuracyData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#DDDDDD" dark-stroke="#333" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#555555" 
            tick={{ fill: '#555555' }}
          />
          <YAxis 
            stroke="#555555" 
            tick={{ fill: '#555555' }}
            domain={[70, 95]}
            ticks={[70, 75, 80, 85, 90, 95]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip isRTL={isRTL} />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              color: '#333333'
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
