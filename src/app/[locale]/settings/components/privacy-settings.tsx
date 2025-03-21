'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PrivacySettingsProps {
  locale: string;
}

interface Translations {
  privacySettings: string;
  privacySettingsDescription: string;
  profileVisibility: string;
  profileVisibilityDescription: string;
  public: string;
  private: string;
  followersOnly: string;
  activitySharing: string;
  activitySharingDescription: string;
  showPromptUsage: string;
  showPromptUsageDescription: string;
  showBookmarks: string;
  showBookmarksDescription: string;
  dataCollection: string;
  dataCollectionDescription: string;
  usageAnalytics: string;
  usageAnalyticsDescription: string;
  saveChanges: string;
  deleteAccount: string;
  deleteAccountDescription: string;
  deleteAccountButton: string;
  deleteAccountDialog: {
    title: string;
    description: string;
    confirmLabel: string;
    placeholder: string;
    deleteButton: string;
    cancelButton: string;
  };
  privacyUpdated: string;
}

const translations: Record<string, Translations> = {
  en: {
    privacySettings: 'Privacy Settings',
    privacySettingsDescription: 'Manage who can see your profile and how your data is used',
    profileVisibility: 'Profile Visibility',
    profileVisibilityDescription: 'Control who can see your profile and prompts',
    public: 'Public',
    private: 'Private',
    followersOnly: 'Followers Only',
    activitySharing: 'Activity Sharing',
    activitySharingDescription: 'Manage what activity is visible to others',
    showPromptUsage: 'Show Prompt Usage',
    showPromptUsageDescription: 'Allow others to see which prompts you have used',
    showBookmarks: 'Show Bookmarks',
    showBookmarksDescription: 'Allow others to see which prompts you have bookmarked',
    dataCollection: 'Data Collection',
    dataCollectionDescription: 'Manage how your data is collected and used',
    usageAnalytics: 'Usage Analytics',
    usageAnalyticsDescription: 'Allow us to collect anonymous usage data to improve our service',
    saveChanges: 'Save Changes',
    deleteAccount: 'Delete Account',
    deleteAccountDescription: 'Permanently delete your account and all associated data',
    deleteAccountButton: 'Delete Account',
    deleteAccountDialog: {
      title: 'Delete Account',
      description: 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers. Please type "DELETE" to confirm.',
      confirmLabel: 'Confirmation',
      placeholder: 'Type "DELETE" to confirm',
      deleteButton: 'Permanently Delete Account',
      cancelButton: 'Cancel',
    },
    privacyUpdated: 'Your privacy settings have been updated.',
  },
  ar: {
    privacySettings: 'إعدادات الخصوصية',
    privacySettingsDescription: 'إدارة من يمكنه رؤية ملفك الشخصي وكيفية استخدام بياناتك',
    profileVisibility: 'رؤية الملف الشخصي',
    profileVisibilityDescription: 'التحكم في من يمكنه رؤية ملفك الشخصي والنماذج الخاصة بك',
    public: 'عام',
    private: 'خاص',
    followersOnly: 'المتابعين فقط',
    activitySharing: 'مشاركة النشاط',
    activitySharingDescription: 'إدارة النشاط المرئي للآخرين',
    showPromptUsage: 'إظهار استخدام النماذج',
    showPromptUsageDescription: 'السماح للآخرين برؤية النماذج التي استخدمتها',
    showBookmarks: 'إظهار الإشارات المرجعية',
    showBookmarksDescription: 'السماح للآخرين برؤية النماذج التي قمت بحفظها',
    dataCollection: 'جمع البيانات',
    dataCollectionDescription: 'إدارة كيفية جمع بياناتك واستخدامها',
    usageAnalytics: 'تحليلات الاستخدام',
    usageAnalyticsDescription: 'السماح لنا بجمع بيانات استخدام مجهولة لتحسين خدمتنا',
    saveChanges: 'حفظ التغييرات',
    deleteAccount: 'حذف الحساب',
    deleteAccountDescription: 'حذف حسابك نهائيًا وجميع البيانات المرتبطة به',
    deleteAccountButton: 'حذف الحساب',
    deleteAccountDialog: {
      title: 'حذف الحساب',
      description: 'لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا وإزالة جميع بياناتك من خوادمنا. يرجى كتابة "حذف" للتأكيد.',
      confirmLabel: 'التأكيد',
      placeholder: 'اكتب "حذف" للتأكيد',
      deleteButton: 'حذف الحساب نهائيًا',
      cancelButton: 'إلغاء',
    },
    privacyUpdated: 'تم تحديث إعدادات الخصوصية الخاصة بك.',
  }
};

export function PrivacySettings({ locale }: PrivacySettingsProps) {
  const t = translations[locale] || translations.en;
  const isRtl = locale === 'ar';
  
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showPromptUsage, setShowPromptUsage] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [usageAnalytics, setUsageAnalytics] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Handle save changes
  const handleSaveChanges = () => {
    // This would normally be an API call to update the privacy settings
    console.log('Saving privacy settings...', {
      profileVisibility,
      showPromptUsage,
      showBookmarks,
      usageAnalytics,
    });
    
    // Show success alert
    setShowAlert(true);
    
    // Hide alert after a few seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE' || (locale === 'ar' && deleteConfirmation === 'حذف')) {
      // This would normally be an API call to delete the account
      console.log('Deleting account...');
      
      // Close dialog
      setIsDialogOpen(false);
      setDeleteConfirmation('');
      
      // In a real application, you would redirect to logout or home page
    }
  };
  
  return (
    <Card dir={isRtl ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t.privacySettings}</CardTitle>
        <CardDescription>{t.privacySettingsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Success Alert */}
        {showAlert && (
          <Alert className="mb-4">
            <AlertTitle>{t.privacyUpdated}</AlertTitle>
            <AlertDescription></AlertDescription>
          </Alert>
        )}
        
        {/* Profile Visibility Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">{t.profileVisibility}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t.profileVisibilityDescription}</p>
          
          <RadioGroup
            value={profileVisibility}
            onValueChange={setProfileVisibility}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="public" id="visibility-public" />
              <Label htmlFor="visibility-public" className="font-normal">{t.public}</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="followers-only" id="visibility-followers" />
              <Label htmlFor="visibility-followers" className="font-normal">{t.followersOnly}</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="private" id="visibility-private" />
              <Label htmlFor="visibility-private" className="font-normal">{t.private}</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Activity Sharing Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">{t.activitySharing}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t.activitySharingDescription}</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t.showPromptUsage}</Label>
                <p className="text-muted-foreground text-sm">{t.showPromptUsageDescription}</p>
              </div>
              <Switch
                checked={showPromptUsage}
                onCheckedChange={setShowPromptUsage}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t.showBookmarks}</Label>
                <p className="text-muted-foreground text-sm">{t.showBookmarksDescription}</p>
              </div>
              <Switch
                checked={showBookmarks}
                onCheckedChange={setShowBookmarks}
              />
            </div>
          </div>
        </div>
        
        {/* Data Collection Section */}
        <div>
          <h3 className="text-lg font-medium mb-2">{t.dataCollection}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t.dataCollectionDescription}</p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t.usageAnalytics}</Label>
              <p className="text-muted-foreground text-sm">{t.usageAnalyticsDescription}</p>
            </div>
            <Switch
              checked={usageAnalytics}
              onCheckedChange={setUsageAnalytics}
            />
          </div>
        </div>
        
        {/* Delete Account Section */}
        <div className="border-t pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-destructive">{t.deleteAccount}</h3>
              <p className="text-muted-foreground text-sm">{t.deleteAccountDescription}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 me-2" />
                  {t.deleteAccountButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" dir={isRtl ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className="text-destructive">{t.deleteAccountDialog.title}</DialogTitle>
                  <DialogDescription>
                    {t.deleteAccountDialog.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-confirmation">{t.deleteAccountDialog.confirmLabel}</Label>
                    <Input
                      id="delete-confirmation"
                      placeholder={t.deleteAccountDialog.placeholder}
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t.deleteAccountDialog.cancelButton}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' && !(locale === 'ar' && deleteConfirmation === 'حذف')}
                  >
                    {t.deleteAccountDialog.deleteButton}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges}>
          {t.saveChanges}
        </Button>
      </CardFooter>
    </Card>
  );
}
