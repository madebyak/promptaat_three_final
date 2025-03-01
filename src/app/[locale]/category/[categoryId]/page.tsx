'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Category: {categoryId}</h1>
      <p className="text-light-grey">Category page content will go here</p>
    </div>
  )
}
