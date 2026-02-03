import { useState } from 'react'
import { Bell, Mail, Smartphone, Check } from 'lucide-react'
import Button from '../../ui/Button'
import { motion } from 'framer-motion'

export default function NotificationSettings({ onSave }) {
  const [settings, setSettings] = useState({
    email: {
      appointments: true,
      updates: true,
      promotions: false
    },
    push: {
      appointments: true,
      messages: true,
      reminders: true
    },
  })

  const toggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }))
  }

  return (
    <div className="space-y-8">
      
      {/* Email Notifications */}
      <NotificationSection 
        title="Email Notifications" 
        icon={Mail}
        className="border-b border-border-light pb-8"
      >
        <ToggleRow 
          label="New Appointments" 
          desc="Get notified immediately when a patient books a slot."
          checked={settings.email.appointments}
          onChange={() => toggle('email', 'appointments')}
        />
        <ToggleRow 
          label="System Updates" 
          desc="Important updates about the platform and your account."
          checked={settings.email.updates}
          onChange={() => toggle('email', 'updates')}
        />
        <ToggleRow 
          label="Marketing & Tips" 
          desc="Receive tips on how to grow your practice."
          checked={settings.email.promotions}
          onChange={() => toggle('email', 'promotions')}
        />
      </NotificationSection>

      {/* Push Notifications */}
      <NotificationSection 
        title="Push Notifications" 
        icon={Bell}
      >
        <ToggleRow 
          label="Appointment Reminders" 
          desc="Receive a nudge 15 minutes before session start."
          checked={settings.push.appointments}
          onChange={() => toggle('push', 'appointments')}
        />
        <ToggleRow 
          label="New Messages" 
          desc="Get alerts when a patient sends you a direct message."
          checked={settings.push.messages}
          onChange={() => toggle('push', 'messages')}
        />
        <ToggleRow 
          label="Daily Summary" 
          desc="A morning summary of your day's schedule."
          checked={settings.push.reminders}
          onChange={() => toggle('push', 'reminders')}
        />
      </NotificationSection>

      <div className="flex justify-end pt-6">
        <Button size="lg" className="w-full md:w-auto px-8" onClick={() => onSave(settings)}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

function NotificationSection({ title, icon: Icon, children, className = '' }) {
    return (
        <section className={`space-y-6 ${className}`}>
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-background-gray rounded-xl text-text">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-text">{title}</h3>
            </div>
            <div className="space-y-1">
                {children}
            </div>
        </section>
    )
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-background-gray/30 rounded-xl transition-colors cursor-pointer group" onClick={onChange}>
      <div>
        <p className="font-semibold text-text text-sm group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-text-light mt-0.5">{desc}</p>
      </div>
      
      {/* Custom Switch */}
      <div className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
        <motion.div 
            layout
            className="w-5 h-5 bg-white rounded-full shadow-sm"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  )
}
