'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Save, Trash, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface FeatureRequestDetailProps {
  id: string
  locale: string
}

interface FeatureRequest {
  id: string
  name: string
  email: string
  accountId: string | null
  requestType: string
  title: string
  category: string
  description: string
  useCase: string | null
  priority: string
  status: string
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export default function FeatureRequestDetail({ id, locale }: FeatureRequestDetailProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const [featureRequest, setFeatureRequest] = useState<FeatureRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  
  const translations = {
    backToList: isRTL ? 'العودة إلى القائمة' : 'Back to List',
    featureRequest: isRTL ? 'طلب ميزة' : 'Feature Request',
    promptRequest: isRTL ? 'طلب موجه' : 'Prompt Request',
    requestDetails: isRTL ? 'تفاصيل الطلب' : 'Request Details',
    userInfo: isRTL ? 'معلومات المستخدم' : 'User Information',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    accountId: isRTL ? 'معرف الحساب' : 'Account ID',
    notProvided: isRTL ? 'غير متوفر' : 'Not provided',
    title: isRTL ? 'العنوان' : 'Title',
    category: isRTL ? 'الفئة' : 'Category',
    description: isRTL ? 'الوصف' : 'Description',
    useCase: isRTL ? 'حالة الاستخدام' : 'Use Case',
    priority: isRTL ? 'الأولوية' : 'Priority',
    status: isRTL ? 'الحالة' : 'Status',
    adminNotes: isRTL ? 'ملاحظات المسؤول' : 'Admin Notes',
    adminNotesPlaceholder: isRTL ? 'أضف ملاحظات حول هذا الطلب هنا...' : 'Add notes about this request here...',
    createdAt: isRTL ? 'تاريخ الإنشاء' : 'Created At',
    updatedAt: isRTL ? 'تاريخ التحديث' : 'Updated At',
    save: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
    delete: isRTL ? 'حذف الطلب' : 'Delete Request',
    sendEmail: isRTL ? 'إرسال بريد إلكتروني' : 'Send Email',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    error: isRTL ? 'حدث خطأ أثناء تحميل الطلب' : 'Error loading request',
    saveSuccess: isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully',
    saveError: isRTL ? 'حدث خطأ أثناء حفظ التغييرات' : 'Error saving changes',
    deleteConfirm: isRTL ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this request?',
    deleteSuccess: isRTL ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully',
    deleteError: isRTL ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting request',
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    inReview: isRTL ? 'قيد المراجعة' : 'In Review',
    approved: isRTL ? 'تمت الموافقة' : 'Approved',
    rejected: isRTL ? 'مرفوض' : 'Rejected',
    completed: isRTL ? 'مكتمل' : 'Completed',
    low: isRTL ? 'منخفضة' : 'Low',
    medium: isRTL ? 'متوسطة' : 'Medium',
    high: isRTL ? 'عالية' : 'High',
  }
  
  useEffect(() => {
    const fetchFeatureRequest = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/cms/feature-requests/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch feature request')
        }
        
        const data = await response.json()
        setFeatureRequest(data.featureRequest)
        setStatus(data.featureRequest.status)
        setAdminNotes(data.featureRequest.adminNotes || '')
        setError(null)
      } catch (err) {
        console.error('Error fetching feature request:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchFeatureRequest()
    }
  }, [id])
  
  const handleSave = async () => {
    if (!featureRequest) return
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/cms/feature-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update feature request')
      }
      
      const data = await response.json()
      setFeatureRequest(data.featureRequest)
      
      toast({
        title: translations.saveSuccess,
        variant: 'default',
      })
    } catch (err) {
      console.error('Error updating feature request:', err)
      
      toast({
        title: translations.saveError,
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async () => {
    if (window.confirm(translations.deleteConfirm)) {
      try {
        const response = await fetch(`/api/cms/feature-requests/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete feature request')
        }
        
        toast({
          title: translations.deleteSuccess,
          variant: 'default',
        })
        
        // Navigate back to the list
        router.push('/cms/feature-requests')
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
  
  const handleSendEmail = () => {
    if (featureRequest) {
      window.location.href = `mailto:${featureRequest.email}?subject=Regarding your ${featureRequest.requestType} request: ${featureRequest.title}`
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPpp', { locale: isRTL ? ar : undefined })
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'in_review':
        return 'default'
      case 'approved':
        return 'success'
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
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{translations.loading}</p>
      </div>
    )
  }
  
  if (error || !featureRequest) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{translations.error}</p>
        <p className="text-red-600 dark:text-red-300 text-sm mt-2">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/cms/feature-requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {translations.backToList}
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/cms/feature-requests')}
          className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className="h-4 w-4" />
          {translations.backToList}
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSendEmail}
            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Mail className="h-4 w-4" />
            {translations.sendEmail}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Trash className="h-4 w-4" />
            {translations.delete}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {featureRequest.requestType === 'feature' 
              ? translations.featureRequest 
              : translations.promptRequest}
          </CardTitle>
          <CardDescription>
            {featureRequest.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{translations.userInfo}</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.name}
                  </p>
                  <p>{featureRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.email}
                  </p>
                  <p>{featureRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.accountId}
                  </p>
                  <p>{featureRequest.accountId || translations.notProvided}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{translations.requestDetails}</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.category}
                  </p>
                  <p>{featureRequest.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.priority}
                  </p>
                  <Badge variant={getPriorityBadgeVariant(featureRequest.priority)}>
                    {getPriorityLabel(featureRequest.priority)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.createdAt}
                  </p>
                  <p>{formatDate(featureRequest.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {translations.description}
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{featureRequest.description}</p>
              </div>
            </div>
            
            {featureRequest.useCase && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {translations.useCase}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{featureRequest.useCase}</p>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{translations.status}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {translations.status}
                </p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{translations.pending}</SelectItem>
                    <SelectItem value="in_review">{translations.inReview}</SelectItem>
                    <SelectItem value="approved">{translations.approved}</SelectItem>
                    <SelectItem value="rejected">{translations.rejected}</SelectItem>
                    <SelectItem value="completed">{translations.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {translations.adminNotes}
                </p>
                <Textarea
                  placeholder={translations.adminNotesPlaceholder}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {translations.saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {translations.save}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
