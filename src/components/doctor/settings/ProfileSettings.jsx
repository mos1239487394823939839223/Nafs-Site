import { useState } from 'react'
import { PhotoCamera as Camera, Person as User, Mail, Phone, LocationOn as MapPin, Work as Briefcase, Sync as Loader2 } from '@mui/icons-material'
import Button from '../../ui/Button'
import Input, { Textarea } from '../../ui/Input'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function ProfileSettings({ user, onSave, onImageUpload }) {
  const { t, isRTL } = useLanguage()
  const [formData, setFormData] = useState({
    name: user?.name || user?.Name || '',
    email: user?.email || user?.Email || '',
    phone: user?.phone || user?.PhoneNumber || '',
    specialty: user?.specialty || user?.Specialist?.[0] || '',
    bio: user?.bio || user?.Description || '',
    location: user?.location || ''
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
        <div className={`text-center md:text-left space-y-2 ${isRTL ? 'md:text-right' : ''}`}>
          <h3 className="text-lg font-semibold text-text">{t('settings.profilePhoto', 'Profile Photo')}</h3>
          <p className="text-sm text-text-light max-w-xs">
            {t('settings.uploadPhotoDesc', 'Upload a professional photo using JPG, GIF or PNG. Max size 800K.')}
          </p>
          <div className={`flex gap-2 justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
            <Button size="sm" variant="outline" onClick={() => setAvatar(null)}>{t('settings.removePhoto', 'Remove')}</Button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2 pb-2 border-b border-border-light mb-2">
          <h3 className="font-semibold text-text">{t('settings.personalInfo', 'Personal Information')}</h3>
        </div>

        <Input
          label={t('settings.fullName', 'Full Name')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          icon={User}
          className="bg-background-gray/20"
        />
        <Input
          label={t('settings.emailAddress', 'Email Address')}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          icon={Mail}
          className="bg-background-gray/50"
          dir="ltr"
          disabled
        />
        <Input
          label={t('settings.phoneNumber', 'Phone Number')}
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          icon={Phone}
          dir="ltr"
          className="bg-background-gray/20"
        />
        <Input
          label={t('settings.address', 'Location')}
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          icon={MapPin}
          className="bg-background-gray/20"
        />
      </div>

      {/* Professional Info */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2 pb-2 border-b border-border-light mb-2 pt-4">
          <h3 className="font-semibold text-text">{t('settings.professionalDetails', 'Professional Details')}</h3>
        </div>

        <Input
          label={t('common.specialty', 'Specialty')}
          value={formData.specialty}
          onChange={(e) => handleChange('specialty', e.target.value)}
          icon={Briefcase}
          className="md:col-span-2 bg-background-gray/20"
        />
        <div className="md:col-span-2">
          <Textarea
            label={t('settings.bio', 'Professional Bio')}
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="bg-background-gray/20"
            placeholder={t('doctorReg.bioPlaceholder', 'Share your expertise, qualifications, and patient philosophy...')}
          />
          <p className={`text-xs text-text-light mt-1 ${isRTL ? 'text-left' : 'text-right'}`}>{formData.bio.length}/500</p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button size="lg" className="w-full md:w-auto px-8" onClick={handleSave} disabled={saving}>
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('common.saving', 'Saving...')}
            </div>
          ) : t('common.save', 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}
