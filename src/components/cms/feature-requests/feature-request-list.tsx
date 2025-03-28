'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Filter, Eye, Trash } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface FeatureRequest {
  id: string
  name: string
  email: string
  requestType: string
  title: string
  category: string
  priority: string
  status: string
  createdAt: string
}

interface FeatureRequestListProps {
  locale: string
}

export default function FeatureRequestList({ locale }: FeatureRequestListProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const translations = {
    pageTitle: isRTL ? 'طلبات الميزات' : 'Feature Requests',
    search: isRTL ? 'بحث...' : 'Search...',
    id: isRTL ? 'المعرف' : 'ID',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    type: isRTL ? 'النوع' : 'Type',
    title: isRTL ? 'العنوان' : 'Title',
    category: isRTL ? 'الفئة' : 'Category',
    priority: isRTL ? 'الأولوية' : 'Priority',
    status: isRTL ? 'الحالة' : 'Status',
    createdAt: isRTL ? 'تاريخ الإنشاء' : 'Created At',
    actions: isRTL ? 'الإجراءات' : 'Actions',
    view: isRTL ? 'عرض' : 'View',
    delete: isRTL ? 'حذف' : 'Delete',
    noRequests: isRTL ? 'لا توجد طلبات ميزات' : 'No feature requests found',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    error: isRTL ? 'حدث خطأ أثناء تحميل طلبات الميزات' : 'Error loading feature requests',
    filterByStatus: isRTL ? 'تصفية حسب الحالة' : 'Filter by Status',
    filterByType: isRTL ? 'تصفية حسب النوع' : 'Filter by Type',
    all: isRTL ? 'الكل' : 'All',
    feature: isRTL ? 'ميزة' : 'Feature',
    prompt: isRTL ? 'موجه' : 'Prompt',
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    inReview: isRTL ? 'قيد المراجعة' : 'In Review',
    approved: isRTL ? 'تمت الموافقة' : 'Approved',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    completed: isRTL ? 'مكتمل' : 'Completed',
    low: isRTL ? 'منخفضة' : 'Low',
    medium: isRTL ? 'متوسطة' : 'Medium',
    high: isRTL ? 'عالية' : 'High',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this request?',
    deleteSuccess: isRTL ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully',
    deleteError: isRTL ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting request',
  }
  
  useEffect(() => {
    const fetchFeatureRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/cms/feature-requests')
        
        if (!response.ok) {
          throw new Error('Failed to fetch feature requests')
        }
        
        const data = await response.json()
        setFeatureRequests(data.featureRequests)
        setError(null)
      } catch (err) {
        console.error('Error fetching feature requests:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeatureRequests()
  }, [])
  
  const handleViewRequest = (id: string) => {
    router.push(`/cms/feature-requests/${id}`)
  }
  
  const handleDeleteRequest = async (id: string) => {
    if (window.confirm(translations.deleteConfirm)) {
      try {
        const response = await fetch(`/api/cms/feature-requests/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete feature request')
        }
        
        // Remove the deleted request from the list
        setFeatureRequests(featureRequests.filter(request => request.id !== id))
        
        toast({
          title: translations.deleteSuccess,
          variant: 'default',
        })
      } catch (err) {
        console.error('Error deleting feature request:', err)
        
        toast({
          title: translations.deleteError,
          description: err instanceof Error ? err.message : 'Unknown error',
          variant: 'destructive',
        })
      }
    }
  }
  
  const filteredRequests = featureRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: isRTL ? ar : undefined
    })
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'in_review':
        return 'default'
      case 'approved':
        return 'purple'
      case 'rejected':
        return 'destructive'
      case 'completed':
        return 'outline'
      default:
        return 'secondary'
    }
  }
  
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'outline'
      case 'medium':
        return 'secondary'
      case 'high':
        return 'destructive'
      default:
        return 'outline'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return translations.pending
      case 'in_review':
        return translations.inReview
      case 'approved':
        return translations.approved
      case 'rejected':
        return translations.rejected
      case 'completed':
        return translations.completed
      default:
        return status
    }
  }
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return translations.low
      case 'medium':
        return translations.medium
      case 'high':
        return translations.high
      default:
        return priority
    }
  }
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return translations.feature
      case 'prompt':
        return translations.prompt
      default:
        return type
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{translations.loading}</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{translations.error}</p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-2">{error}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
          <Input
            placeholder={translations.search}
            className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white dark:bg-black-main border border-gray-200 dark:border-gray-800`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-black-main border border-gray-200 dark:border-gray-800">
                <SelectValue placeholder={translations.filterByType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.all}</SelectItem>
                <SelectItem value="feature">{translations.feature}</SelectItem>
                <SelectItem value="prompt">{translations.prompt}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-black-main border border-gray-200 dark:border-gray-800">
                <SelectValue placeholder={translations.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.all}</SelectItem>
                <SelectItem value="pending">{translations.pending}</SelectItem>
                <SelectItem value="in_review">{translations.inReview}</SelectItem>
                <SelectItem value="approved">{translations.approved}</SelectItem>
                <SelectItem value="rejected">{translations.rejected}</SelectItem>
                <SelectItem value="completed">{translations.completed}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800/30 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">{translations.noRequests}</p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  <TableHead className="w-[100px]">{translations.id}</TableHead>
                  <TableHead>{translations.type}</TableHead>
                  <TableHead>{translations.title}</TableHead>
                  <TableHead>{translations.name}</TableHead>
                  <TableHead>{translations.priority}</TableHead>
                  <TableHead>{translations.status}</TableHead>
                  <TableHead>{translations.createdAt}</TableHead>
                  <TableHead className="text-right">{translations.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-b border-gray-200 dark:border-gray-800">
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(request.requestType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(request.priority)}>
                        {getPriorityLabel(request.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {translations.view}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          {translations.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
