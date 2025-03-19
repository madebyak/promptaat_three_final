'use client'

import { useState, useRef } from 'react'
import { SendIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
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

interface ContactFormProps {
  locale: string
  id?: string
}

export default function ContactForm({ locale, id }: ContactFormProps) {
  const isRTL = locale === 'ar'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [priority, setPriority] = useState('medium')
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      formRef.current?.reset()
      
      // Reset form state after showing success message
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }
  
  return (
    <section id={id} className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? 'تواصل معنا' : 'Contact Support'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {isRTL 
              ? 'نحن هنا للمساعدة. أرسل لنا تذكرة دعم وسنرد عليك في أقرب وقت ممكن.'
              : 'Our support team is here to help. Submit a ticket and we\'ll get back to you as soon as possible.'}
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-2xl p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {isRTL ? 'تم إرسال تذكرة الدعم!' : 'Support Ticket Submitted!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {isRTL 
                ? 'شكراً لتواصلك معنا. سنرد عليك قريباً. تم إرسال رقم التذكرة إلى بريدك الإلكتروني.'
                : 'Thank you for reaching out. We\'ll get back to you shortly. A ticket number has been sent to your email.'}
            </p>
          </div>
        ) : (
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8"
          >
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="border-b border-light-mid-grey dark:border-high-grey pb-6">
                <h3 className="text-xl font-semibold mb-4 text-black-main dark:text-white">
                  {isRTL ? 'معلومات شخصية' : 'Personal Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'الاسم' : 'Name'} <span className="text-accent-red">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      name="name" 
                      required 
                      className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? 'الاسم الكامل' : 'Full name'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-accent-red">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? 'your@email.com' : 'your@email.com'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}
                    </Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? '+1 (555) 000-0000' : '+1 (555) 000-0000'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'رقم الحساب (إن وجد)' : 'Account ID (if applicable)'}
                    </Label>
                    <Input 
                      id="account" 
                      name="account" 
                      className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? 'ACC-12345' : 'ACC-12345'}
                    />
                  </div>
                </div>
              </div>
              
              {/* Ticket Details Section */}
              <div className="border-b border-light-mid-grey dark:border-high-grey pb-6">
                <h3 className="text-xl font-semibold mb-4 text-black-main dark:text-white">
                  {isRTL ? 'تفاصيل التذكرة' : 'Ticket Details'}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'الموضوع' : 'Subject'} <span className="text-accent-red">*</span>
                    </Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      required
                      className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? 'ملخص قصير لمشكلتك' : 'Brief summary of your issue'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'الفئة' : 'Category'} <span className="text-accent-red">*</span>
                    </Label>
                    <Select name="category" required>
                      <SelectTrigger className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}>
                        <SelectValue placeholder={isRTL ? 'اختر فئة' : 'Select a category'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{isRTL ? 'مشكلة تقنية' : 'Technical Issue'}</SelectItem>
                        <SelectItem value="account">{isRTL ? 'إدارة الحساب' : 'Account Management'}</SelectItem>
                        <SelectItem value="billing">{isRTL ? 'الفواتير والمدفوعات' : 'Billing & Payments'}</SelectItem>
                        <SelectItem value="feature">{isRTL ? 'طلب ميزة' : 'Feature Request'}</SelectItem>
                        <SelectItem value="security">{isRTL ? 'الأمان والخصوصية' : 'Security & Privacy'}</SelectItem>
                        <SelectItem value="other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'الأولوية' : 'Priority'}
                    </Label>
                    <RadioGroup 
                      defaultValue="medium" 
                      className="flex flex-col space-y-1"
                      value={priority}
                      onValueChange={setPriority}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="priority-low" className="text-accent-blue" />
                        <Label htmlFor="priority-low" className="font-normal cursor-pointer">
                          {isRTL ? 'منخفضة - استفسار عام' : 'Low - General inquiry'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="priority-medium" className="text-accent-purple" />
                        <Label htmlFor="priority-medium" className="font-normal cursor-pointer">
                          {isRTL ? 'متوسطة - بعض الوظائف لا تعمل' : 'Medium - Some functionality not working'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="priority-high" className="text-accent-red" />
                        <Label htmlFor="priority-high" className="font-normal cursor-pointer">
                          {isRTL ? 'عالية - مشكلة حرجة تؤثر على العمل' : 'High - Critical issue affecting work'}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                      {isRTL ? 'تفاصيل المشكلة' : 'Issue Details'} <span className="text-accent-red">*</span>
                    </Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      required 
                      className={`min-h-32 ${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}
                      placeholder={isRTL ? 'يرجى وصف مشكلتك بالتفصيل. قم بتضمين أي رسائل خطأ، والخطوات التي اتخذتها، ومتى بدأت المشكلة.' : 'Please describe your issue in detail. Include any error messages, steps you\'ve taken, and when the issue started.'}
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4 text-black-main dark:text-white">
                  {isRTL ? 'معلومات إضافية' : 'Additional Information'}
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="browser" className={`${isRTL ? 'text-right block' : ''} text-black-main dark:text-white`}>
                    {isRTL ? 'المتصفح والإصدار (للمشكلات التقنية)' : 'Browser & Version (for technical issues)'}
                  </Label>
                  <Select name="browser">
                    <SelectTrigger className={`${isRTL ? 'text-right' : ''} bg-light-grey-light dark:bg-dark border border-light-grey dark:border-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple text-black-main dark:text-white placeholder:text-light-high-grey dark:placeholder:text-mid-grey`}>
                      <SelectValue placeholder={isRTL ? 'اختر متصفحك' : 'Select your browser'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">{isRTL ? 'جوجل كروم' : 'Google Chrome'}</SelectItem>
                      <SelectItem value="firefox">{isRTL ? 'فايرفوكس' : 'Firefox'}</SelectItem>
                      <SelectItem value="safari">{isRTL ? 'سفاري' : 'Safari'}</SelectItem>
                      <SelectItem value="edge">{isRTL ? 'مايكروسوفت إيدج' : 'Microsoft Edge'}</SelectItem>
                      <SelectItem value="other">{isRTL ? 'آخر' : 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30 flex items-start gap-3">
                  <AlertCircleIcon className="w-5 h-5 text-accent-blue mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isRTL 
                      ? 'سيتم الرد على جميع استفسارات الدعم خلال يوم عمل واحد. للحالات الطارئة، يرجى الاتصال بنا على الرقم المذكور في صفحة الاتصال.'
                      : 'All support inquiries will be responded to within one business day. For urgent matters, please call us at the number listed on our contact page.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  type="submit" 
                  className={`w-full ${isRTL ? 'flex-row-reverse' : ''} bg-accent-purple hover:bg-accent-purple/90`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">
                        {isRTL ? 'جارِ الإرسال...' : 'Submitting...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <SendIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{isRTL ? 'إرسال تذكرة الدعم' : 'Submit Support Ticket'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
