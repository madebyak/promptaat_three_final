'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function SubcategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const subcategoryId = params.subcategoryId as string;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Category: {categoryId} / Subcategory: {subcategoryId}
      </h1>
      <p className="text-light-grey">Subcategory page content will go here</p>
    </div>
  )
}
