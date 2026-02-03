import { useState } from 'react'
import { Camera, User, Mail, Phone, MapPin, Calendar, Heart } from 'lucide-react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

export default function ProfileSettings({ user, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || 'Cairo, Egypt',
    dob: user?.dob || '1990-01-01',
    emergencyContact: user?.emergencyContact || ''
  })

  // Simulated avatar preview
  const [avatar, setAvatar] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
    }
  }

  return (
    <div className="space-y-10">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background-gray/30 rounded-2xl border border-dashed border-border">
         <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-primary/5">
                {avatar ? (
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
        <div className="text-center md:text-left space-y-2">
            <h3 className="text-lg font-semibold text-text">Profile Photo</h3>
            <p className="text-sm text-text-light max-w-xs">
                Upload a clear photo to help your doctor identify you.
            </p>
            <div className="flex gap-2 justify-center md:justify-start">
                <Button size="sm" variant="outline" onClick={() => setAvatar(null)}>Remove</Button>
            </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
         <div className="md:col-span-2 pb-2 border-b border-border-light mb-2">
            <h3 className="font-semibold text-text">Personal Information</h3>
         </div>

        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          icon={User}
          className="bg-background-gray/20"
        />
        <Input
          label="Email Address"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          icon={Mail}
          className="bg-background-gray/50"
          disabled 
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          icon={Phone}
           className="bg-background-gray/20"
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          icon={MapPin}
           className="bg-background-gray/20"
        />
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dob}
          onChange={(e) => handleChange('dob', e.target.value)}
          icon={Calendar}
           className="bg-background-gray/20"
        />
        <Input
          label="Emergency Contact"
          value={formData.emergencyContact}
          onChange={(e) => handleChange('emergencyContact', e.target.value)}
          icon={Heart}
           className="bg-background-gray/20"
           placeholder="Name & Phone Number"
        />
      </div>

      <div className="flex justify-end pt-6">
        <Button size="lg" className="w-full md:w-auto px-8" onClick={() => onSave(formData)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
