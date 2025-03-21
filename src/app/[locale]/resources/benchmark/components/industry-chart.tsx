'use client'

import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts'

// Data for the chart
const coverageData = [
  {
    name: 'Jan',
    categories: 0,
    subcategories: 0,
  },
  {
    name: 'Feb',
    categories: 5,
    subcategories: 36,
  },
  {
    name: 'Mar',
    categories: 17,
    subcategories: 102,
  },
  {
    name: 'Apr',
    categories: 25,
    subcategories: 120,
  },
]

interface CustomTooltipProps extends TooltipProps<number, string> {
  isRTL?: boolean;
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isRTL }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-grey-light/90 dark:bg-dark/90 border border-light-high-grey/30 dark:border-high-grey/30 p-3 rounded-md shadow-lg">
        <p className="text-dark-dark-grey dark:text-white-pure font-semibold">{`${isRTL ? 'الشهر:' : 'Month:'} ${label}`}</p>
        <p className="text-emerald-600 dark:text-emerald-400">
          {`${isRTL ? 'الفئات:' : 'Categories:'} ${payload[0].value}`}
        </p>
        <p className="text-blue-600 dark:text-blue-400">
          {`${isRTL ? 'الفئات الفرعية:' : 'Subcategories:'} ${payload[1].value}`}
        </p>
      </div>
    )
  }

  return null
}

interface IndustryChartProps {
  isRTL?: boolean;
}

export default function IndustryChart({ isRTL = false }: IndustryChartProps) {
  const categoriesLabel = isRTL ? 'الفئات' : 'Categories'
  const subcategoriesLabel = isRTL ? 'الفئات الفرعية' : 'Subcategories'
  
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={coverageData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-[#DDDDDD] dark:stroke-[#333333]" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            className="fill-[#555555] dark:fill-[#999999]"
            stroke="#555555"
            tick={{ fill: '#555555', stroke: 'none' }}
          />
          <YAxis 
            stroke="#555555"
            className="fill-[#555555] dark:fill-[#999999]" 
            tick={{ fill: '#555555', stroke: 'none' }}
            yAxisId="left"
          />
          <YAxis 
            stroke="#555555"
            className="fill-[#555555] dark:fill-[#999999]"
            tick={{ fill: '#555555', stroke: 'none' }}
            yAxisId="right"
            orientation="right"
          />
          <Tooltip content={<CustomTooltip isRTL={isRTL} />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              color: '#333333'
            }}
            formatter={(value) => (
              <span className="text-dark-dark-grey dark:text-white-pure">{value}</span>
            )}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="categories"
            name={categoriesLabel}
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 6, fill: '#10b981', stroke: '#10b981', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="subcategories"
            name={subcategoriesLabel}
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 6, fill: '#3b82f6', stroke: '#3b82f6', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
