import { useState } from 'react'
import { PhotoCamera as Camera, Person as User, Mail, Phone, LocationOn as MapPin, CalendarToday as Calendar, Favorite as Heart, Sync as Loader2 } from '@mui/icons-material'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import DatePicker from '../../ui/DatePicker'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function ProfileSettings({ user, onSave, onImageUpload }) {
  const { t, isRTL } = useLanguage()
  const [formData, setFormData] = useState({
    name: user?.name || user?.Name || '',
    email: user?.email || user?.Email || '',
    phone: user?.phone || user?.PhoneNumber || '',
    address: user?.address || '',
    dob: user?.dob || user?.Birthday || '',
    emergencyContact: user?.emergencyContact || ''
  })

  const [avatar, setAvatar] = useState(user?.image || user?.Image || null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
      if (onImageUpload) {
        setUploadingImage(true)
        try {
          await onImageUpload(file)
        } finally {
          setUploadingImage(false)
        }
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background-gray/30 rounded-2xl border border-dashed border-border">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-primary/5">
            {uploadingImage ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary">{formData.name.charAt(0)}</span>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-transform hover:scale-105 shadow-lg">
            <Camera className="w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
        <div className={`text-center space-y-2 ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
          <h3 className="text-lg font-semibold text-text">{t('settings.profilePhoto', 'Profile Photo')}</h3>
          <p className="text-sm text-text-light max-w-xs">
            {t('settings.uploadClearPhoto', 'Upload a clear photo to help your doctor identify you.')}
          </p>
          <div className={`flex gap-2 justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
            <Button size="sm" variant="outline" onClick={() => setAvatar(null)}>{t('common.remove', 'Remove')}</Button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2 pb-2 border-b border-border-light mb-2">
          <h3 className="font-semibold text-text">{t('settings.personalInformation', 'Personal Information')}</h3>
        </div>

        <Input
          label={t('common.fullName', 'Full Name')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          icon={User}
          className="bg-background-gray/20"
        />
        <Input
          label={t('common.emailAddress', 'Email Address')}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          icon={Mail}
          className="bg-background-gray/50"
          disabled
        />
        <Input
          label={t('common.phoneNumber', 'Phone Number')}
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          icon={Phone}
          className="bg-background-gray/20"
        />
        <Input
          label={t('common.address', 'Address')}
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          icon={MapPin}
          className="bg-background-gray/20"
        />
        <DatePicker
          label={t('common.dateOfBirth', 'Date of Birth')}
          value={formData.dob}
          onChange={(val) => handleChange('dob', val)}
          maxDate={new Date()}
          icon={Calendar}
        />
        <Input
          label={t('settings.emergencyContact', 'Emergency Contact')}
          value={formData.emergencyContact}
          onChange={(e) => handleChange('emergencyContact', e.target.value)}
          icon={Heart}
          className="bg-background-gray/20"
          placeholder={t('settings.nameAndPhoneNumber', 'Name & Phone Number')}
        />
      </div>

      <div className="flex justify-end pt-6">
        <Button size="lg" className="w-full md:w-auto px-8" onClick={handleSave} disabled={saving}>
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving', 'Saving...')}
            </div>
          ) : t('common.saveChanges', 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}
