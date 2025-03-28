'use client'

import { useState, useRef } from 'react'
import { SendIcon, CheckCircleIcon, LightbulbIcon, MessageSquarePlusIcon, AlertCircleIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RequestFormProps {
  locale: string
  id?: string
}

export default function RequestForm({ locale, id }: RequestFormProps) {
  const isRTL = locale === 'ar'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requestType, setRequestType] = useState('feature')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const translations = {
    submitRequest: isRTL ? 'إرسال الطلب' : 'Submit Request',
    submitting: isRTL ? 'جاري الإرسال...' : 'Submitting...',
    featureTab: isRTL ? 'طلب ميزة' : 'Feature Request',
    promptTab: isRTL ? 'طلب موجه' : 'Prompt Request',
    personalInfo: isRTL ? 'معلومات شخصية' : 'Personal Information',
    requestDetails: isRTL ? 'تفاصيل الطلب' : 'Request Details',
    name: isRTL ? 'الاسم' : 'Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    accountId: isRTL ? 'رقم الحساب (إن وجد)' : 'Account ID (if applicable)',
    title: isRTL ? 'عنوان الطلب' : 'Request Title',
    description: isRTL ? 'الوصف' : 'Description',
    category: isRTL ? 'الفئة' : 'Category',
    priority: isRTL ? 'الأولوية' : 'Priority',
    attachments: isRTL ? 'المرفقات (اختياري)' : 'Attachments (Optional)',
    low: isRTL ? 'منخفضة' : 'Low',
    medium: isRTL ? 'متوسطة' : 'Medium',
    high: isRTL ? 'عالية' : 'High',
    selectCategory: isRTL ? 'اختر فئة' : 'Select a category',
    featureCategories: {
      ui: isRTL ? 'واجهة المستخدم' : 'User Interface',
      functionality: isRTL ? 'وظائف جديدة' : 'New Functionality',
      performance: isRTL ? 'تحسين الأداء' : 'Performance Improvement',
      integration: isRTL ? 'تكامل مع خدمات أخرى' : 'Integration with Other Services',
      other: isRTL ? 'أخرى' : 'Other'
    },
    promptCategories: {
      writing: isRTL ? 'كتابة' : 'Writing',
      coding: isRTL ? 'برمجة' : 'Coding',
      business: isRTL ? 'أعمال' : 'Business',
      education: isRTL ? 'تعليم' : 'Education',
      creative: isRTL ? 'إبداعي' : 'Creative',
      other: isRTL ? 'أخرى' : 'Other'
    },
    featureNamePlaceholder: isRTL ? 'اسم الميزة المقترحة' : 'Name of proposed feature',
    featureDescPlaceholder: isRTL ? 'صف الميزة بالتفصيل وكيف ستفيد المستخدمين' : 'Describe the feature in detail and how it would benefit users',
    promptNamePlaceholder: isRTL ? 'اسم الموجه المطلوب' : 'Name of requested prompt',
    promptDescPlaceholder: isRTL ? 'صف الموجه المطلوب والغرض منه بالتفصيل' : 'Describe the requested prompt and its purpose in detail',
    useCase: isRTL ? 'حالة الاستخدام' : 'Use Case',
    useCasePlaceholder: isRTL ? 'صف كيف ستستخدم هذا الموجه' : 'Describe how you would use this prompt',
    successTitle: isRTL ? 'تم إرسال طلبك بنجاح!' : 'Request Submitted Successfully!',
    successMessage: isRTL 
      ? 'شكراً لمساهمتك. سنراجع طلبك ونتواصل معك قريباً.'
      : 'Thank you for your contribution. We will review your request and get back to you soon.',
    errorTitle: isRTL ? 'حدث خطأ!' : 'An Error Occurred!',
    errorMessage: isRTL 
      ? 'عذراً، حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى لاحقاً.'
      : 'Sorry, there was an error submitting your request. Please try again later.',
    requiredFields: isRTL 
      ? 'يرجى ملء جميع الحقول المطلوبة.'
      : 'Please fill in all required fields.'
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    
    try {
      // Get form data
      const formData = new FormData(e.currentTarget)
      const titleField = requestType === 'feature' ? 'feature-title' : 'prompt-title'
      const descriptionField = requestType === 'feature' ? 'feature-description' : 'prompt-description'
      const categoryField = requestType === 'feature' ? 'feature-category' : 'prompt-category'
      
      // Prepare data for API
      const requestData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        accountId: formData.get('account') as string,
        requestType,
        title: formData.get(titleField) as string,
        category: formData.get(categoryField) as string,
        description: formData.get(descriptionField) as string,
        useCase: requestType === 'prompt' ? formData.get('use-case') as string : undefined,
        priority,
      }
      
      // Submit to API
      const response = await fetch('/api/resources/feature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }
      
      // Show success message
      setIsSubmitted(true)
      formRef.current?.reset()
      
      // Show toast notification
      toast({
        title: translations.successTitle,
        description: translations.successMessage,
        variant: 'default',
      })
      
      // Reset form state after showing success message
      setTimeout(() => {
        setIsSubmitted(false)
      }, 8000)
    } catch (error) {
      console.error('Error submitting request:', error)
      setFormError(error instanceof Error ? error.message : translations.errorMessage)
      
      // Show error toast
      toast({
        title: translations.errorTitle,
        description: error instanceof Error ? error.message : translations.errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <section id={id} className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      <div className="max-w-4xl mx-auto">
        {isSubmitted ? (
          <Card className="border-green-200 dark:border-green-800/30 bg-white dark:bg-black-main shadow-md">
            <CardContent className="pt-6 pb-8 px-6 text-center">
              <CheckCircleIcon className="w-16 h-16 text-accent-green dark:text-accent-green/90 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-black-main dark:text-white">
                {translations.successTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {translations.successMessage}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs 
            defaultValue="feature" 
            className="w-full" 
            onValueChange={(value) => setRequestType(value)}
          >
            <TabsList className="grid grid-cols-2 mb-8 bg-light-grey-light dark:bg-dark">
              <TabsTrigger 
                value="feature"
                className={cn(
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-black-main data-[state=active]:text-accent-purple dark:data-[state=active]:text-accent-purple",
                  "flex items-center gap-2",
                  isRTL ? "flex-row-reverse" : ""
                )}
              >
                <LightbulbIcon className="w-4 h-4" />
                {translations.featureTab}
              </TabsTrigger>
              <TabsTrigger 
                value="prompt"
                className={cn(
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-black-main data-[state=active]:text-accent-purple dark:data-[state=active]:text-accent-purple",
                  "flex items-center gap-2",
                  isRTL ? "flex-row-reverse" : ""
                )}
              >
                <MessageSquarePlusIcon className="w-4 h-4" />
                {translations.promptTab}
              </TabsTrigger>
            </TabsList>
            
            {formError && (
              <Card className="mb-6 border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <AlertCircleIcon className="w-5 h-5 text-accent-red dark:text-accent-red/90 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                        {translations.errorTitle}
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        {formError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-gray-200 dark:border-gray-800/50 shadow-sm bg-white dark:bg-black-main">
              <CardContent className="p-0">
                <form 
                  ref={formRef}
                  onSubmit={handleSubmit} 
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="p-6 md:p-8"
                >
                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="border-b border-gray-200 dark:border-gray-800/50 pb-6">
                      <h3 className="text-xl font-semibold mb-6 text-black-main dark:text-white">
                        {translations.personalInfo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                            {translations.name} <span className="text-accent-red">*</span>
                          </Label>
                          <Input 
                            id="name" 
                            name="name" 
                            required 
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70"
                            placeholder={isRTL ? 'الاسم الكامل' : 'Full name'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                            {translations.email} <span className="text-accent-red">*</span>
                          </Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            required 
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70"
                            placeholder="your@email.com"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="account" className="text-gray-700 dark:text-gray-300">
                            {translations.accountId}
                          </Label>
                          <Input 
                            id="account" 
                            name="account" 
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70"
                            placeholder="ACC-12345"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Request Details Section */}
                    <TabsContent value="feature" className="mt-0 space-y-6 border-0 p-0">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="feature-title" className="text-gray-700 dark:text-gray-300">
                            {translations.title} <span className="text-accent-red">*</span>
                          </Label>
                          <Input 
                            id="feature-title" 
                            name="feature-title" 
                            required
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70"
                            placeholder={translations.featureNamePlaceholder}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="feature-category" className="text-gray-700 dark:text-gray-300">
                            {translations.category} <span className="text-accent-red">*</span>
                          </Label>
                          <Select name="feature-category" required>
                            <SelectTrigger className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70">
                              <SelectValue placeholder={translations.selectCategory} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black-main border-gray-200 dark:border-gray-800">
                              <SelectItem value="ui">{translations.featureCategories.ui}</SelectItem>
                              <SelectItem value="functionality">{translations.featureCategories.functionality}</SelectItem>
                              <SelectItem value="performance">{translations.featureCategories.performance}</SelectItem>
                              <SelectItem value="integration">{translations.featureCategories.integration}</SelectItem>
                              <SelectItem value="other">{translations.featureCategories.other}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="feature-description" className="text-gray-700 dark:text-gray-300">
                            {translations.description} <span className="text-accent-red">*</span>
                          </Label>
                          <Textarea 
                            id="feature-description" 
                            name="feature-description" 
                            required
                            rows={5}
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70 resize-y"
                            placeholder={translations.featureDescPlaceholder}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 block mb-2">
                            {translations.priority}
                          </Label>
                          <RadioGroup 
                            defaultValue="medium" 
                            className="flex flex-col sm:flex-row gap-6 pt-2"
                            onValueChange={setPriority}
                          >
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="low" id="low" className="text-accent-purple" />
                              <Label htmlFor="low" className="cursor-pointer">{translations.low}</Label>
                            </div>
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="medium" id="medium" className="text-accent-purple" />
                              <Label htmlFor="medium" className="cursor-pointer">{translations.medium}</Label>
                            </div>
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="high" id="high" className="text-accent-purple" />
                              <Label htmlFor="high" className="cursor-pointer">{translations.high}</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="prompt" className="mt-0 space-y-6 border-0 p-0">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="prompt-title" className="text-gray-700 dark:text-gray-300">
                            {translations.title} <span className="text-accent-red">*</span>
                          </Label>
                          <Input 
                            id="prompt-title" 
                            name="prompt-title" 
                            required
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70"
                            placeholder={translations.promptNamePlaceholder}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="prompt-category" className="text-gray-700 dark:text-gray-300">
                            {translations.category} <span className="text-accent-red">*</span>
                          </Label>
                          <Select name="prompt-category" required>
                            <SelectTrigger className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70">
                              <SelectValue placeholder={translations.selectCategory} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black-main border-gray-200 dark:border-gray-800">
                              <SelectItem value="writing">{translations.promptCategories.writing}</SelectItem>
                              <SelectItem value="coding">{translations.promptCategories.coding}</SelectItem>
                              <SelectItem value="business">{translations.promptCategories.business}</SelectItem>
                              <SelectItem value="education">{translations.promptCategories.education}</SelectItem>
                              <SelectItem value="creative">{translations.promptCategories.creative}</SelectItem>
                              <SelectItem value="other">{translations.promptCategories.other}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="prompt-description" className="text-gray-700 dark:text-gray-300">
                            {translations.description} <span className="text-accent-red">*</span>
                          </Label>
                          <Textarea 
                            id="prompt-description" 
                            name="prompt-description" 
                            required
                            rows={5}
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70 resize-y"
                            placeholder={translations.promptDescPlaceholder}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="use-case" className="text-gray-700 dark:text-gray-300">
                            {translations.useCase} <span className="text-accent-red">*</span>
                          </Label>
                          <Textarea 
                            id="use-case" 
                            name="use-case" 
                            required
                            rows={3}
                            className="bg-light-grey-light dark:bg-dark border-gray-200 dark:border-gray-800 focus-visible:ring-accent-purple dark:focus-visible:ring-accent-purple/70 resize-y"
                            placeholder={translations.useCasePlaceholder}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 block mb-2">
                            {translations.priority}
                          </Label>
                          <RadioGroup 
                            defaultValue="medium" 
                            className="flex flex-col sm:flex-row gap-6 pt-2"
                            onValueChange={setPriority}
                          >
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="low" id="prompt-low" className="text-accent-purple" />
                              <Label htmlFor="prompt-low" className="cursor-pointer">{translations.low}</Label>
                            </div>
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="medium" id="prompt-medium" className="text-accent-purple" />
                              <Label htmlFor="prompt-medium" className="cursor-pointer">{translations.medium}</Label>
                            </div>
                            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                              <RadioGroupItem value="high" id="prompt-high" className="text-accent-purple" />
                              <Label htmlFor="prompt-high" className="cursor-pointer">{translations.high}</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className={cn(
                          "w-full md:w-auto bg-accent-purple hover:bg-accent-purple/90 text-white",
                          isRTL ? "flex-row-reverse" : ""
                        )}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                            {translations.submitting}
                          </>
                        ) : (
                          <>
                            <SendIcon className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {translations.submitRequest}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Tabs>
        )}
      </div>
    </section>
  )
}
