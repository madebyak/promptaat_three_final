'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { SendIcon, CheckCircleIcon } from 'lucide-react'

interface ContactFormProps {
  locale: string
}

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  organization: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  partnershipType: z.string({
    required_error: "Please select a partnership type.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  portfolio: z.string().optional(),
})

// Define the form values type
type FormValues = z.infer<typeof formSchema>

export default function ContactForm({ locale }: ContactFormProps) {
  const isRTL = locale === 'ar'
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organization: "",
      email: "",
      phone: "",
      partnershipType: "",
      message: "",
      portfolio: "",
    },
  })
  
  // Handle form submission
  function onSubmit(data: FormValues) {
    // In a real application, you would send this data to your API
    console.log(data)
    
    // Show success toast
    toast({
      title: isRTL ? "تم إرسال نموذج الاتصال بنجاح" : "Contact form submitted successfully",
      description: isRTL ? "سنتواصل معك قريبًا" : "We'll get back to you soon",
    })
    
    // Set submitted state to show success message
    setIsSubmitted(true)
  }
  
  const partnershipTypes = [
    { value: "technology", labelEn: "Technology Partner", labelAr: "شريك تكنولوجي" },
    { value: "content", labelEn: "Content Partner", labelAr: "شريك محتوى" },
    { value: "business", labelEn: "Business Partner", labelAr: "شريك أعمال" },
    { value: "education", labelEn: "Educational Partner", labelAr: "شريك تعليمي" },
    { value: "other", labelEn: "Other", labelAr: "أخرى" },
  ]
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "تواصل معنا" : "Get in Touch"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "مهتم بالشراكة معنا؟ املأ النموذج أدناه وسيتواصل معك فريقنا قريبًا."
              : "Interested in partnering with us? Fill out the form below and our team will get back to you soon."
            }
          </p>
        </div>
        
        {/* Form and success message container */}
        <div className="max-w-2xl mx-auto">
          {isSubmitted ? (
            // Success message
            <div className="bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-8 md:p-10 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRTL ? "شكرًا لك!" : "Thank You!"}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300">
                {isRTL 
                  ? "لقد تلقينا طلب الشراكة الخاص بك وسنتواصل معك في أقرب وقت ممكن."
                  : "We've received your partnership request and will be in touch with you as soon as possible."
                }
              </p>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mt-4"
              >
                {isRTL ? "إرسال طلب آخر" : "Submit Another Request"}
              </Button>
            </div>
          ) : (
            // Contact form
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className={`bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 space-y-6 ${isRTL ? "text-right" : "text-left"}`}
              >
                {/* Name and Organization row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "الاسم" : "Name"}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"} 
                            {...field} 
                            className={isRTL ? "text-right" : "text-left"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "المؤسسة" : "Organization"}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={isRTL ? "أدخل اسم مؤسستك" : "Enter your organization name"} 
                            {...field} 
                            className={isRTL ? "text-right" : "text-left"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Email and Phone row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "البريد الإلكتروني" : "Email"}</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email address"} 
                            {...field} 
                            className={isRTL ? "text-right" : "text-left"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? "رقم الهاتف (اختياري)" : "Phone (optional)"}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={isRTL ? "أدخل رقم هاتفك" : "Enter your phone number"} 
                            {...field} 
                            className={isRTL ? "text-right" : "text-left"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Partnership Type */}
                <FormField
                  control={form.control}
                  name="partnershipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "نوع الشراكة" : "Partnership Type"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? "اختر نوع الشراكة" : "Select partnership type"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {partnershipTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {isRTL ? type.labelAr : type.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "رسالة" : "Message"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={isRTL ? "اشرح فكرة الشراكة الخاصة بك..." : "Describe your partnership idea..."} 
                          className={`min-h-32 resize-none ${isRTL ? "text-right" : "text-left"}`}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Portfolio (optional) */}
                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? "الموقع الإلكتروني / المحفظة (اختياري)" : "Website / Portfolio (optional)"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isRTL ? "أدخل رابط موقعك الإلكتروني أو محفظتك" : "Enter your website or portfolio URL"} 
                          {...field} 
                          className={isRTL ? "text-right" : "text-left"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Submit button */}
                <Button 
                  type="submit" 
                  className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white"
                >
                  {isRTL ? "إرسال طلب الشراكة" : "Submit Partnership Request"}
                  <SendIcon className={`${isRTL ? "mr-2 rtl:ml-2 rtl:mr-0" : "ml-2"} h-4 w-4`} />
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  )
}
