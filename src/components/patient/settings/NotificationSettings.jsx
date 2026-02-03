import { useState } from 'react'
import { Bell, Mail, Smartphone, Check, FileText } from 'lucide-react'
import Button from '../../ui/Button'
import { motion } from 'framer-motion'

export default function NotificationSettings({ onSave }) {
  const [settings, setSettings] = useState({
    email: {
      appointments: true,
      labResults: true,
      news: false
    },
    push: {
      reminders: true,
      messages: true,
      prescriptions: true
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
          label="Appointment Confirmations" 
          desc="Receive emails when your appointments are confirmed or rescheduled."
          checked={settings.email.appointments}
          onChange={() => toggle('email', 'appointments')}
        />
        <ToggleRow 
          label="Lab Results" 
          desc="Get notified when new test results are available."
          checked={settings.email.labResults}
          onChange={() => toggle('email', 'labResults')}
        />
        <ToggleRow 
          label="Clinic News" 
          desc="Stay updated with clinic news and health tips."
          checked={settings.email.news}
          onChange={() => toggle('email', 'news')}
        />
      </NotificationSection>

      {/* Push Notifications */}
      <NotificationSection 
        title="Push Notifications" 
        icon={Bell}
      >
        <ToggleRow 
          label="Appointment Reminders" 
          desc="Receive a notification 1 hour before your appointment."
          checked={settings.push.reminders}
          onChange={() => toggle('push', 'reminders')}
        />
        <ToggleRow 
          label="Doctor Messages" 
          desc="Get alerts when your doctor sends you a message."
          checked={settings.push.messages}
          onChange={() => toggle('push', 'messages')}
        />
        <ToggleRow 
          label="Prescription Updates" 
          desc="Notifies you when a prescription is renewed."
          checked={settings.push.prescriptions}
          onChange={() => toggle('push', 'prescriptions')}
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
