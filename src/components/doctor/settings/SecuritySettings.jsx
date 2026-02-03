import { useState } from 'react'
import { Shield, Key, Smartphone, Lock } from 'lucide-react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import { motion, AnimatePresence } from 'framer-motion'

export default function SecuritySettings({ onSave }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handlePasswordUpdate = () => {
    onSave({ type: 'password', currentPassword, newPassword })
    setShowPasswordForm(false)
  }

  return (
    <div className="space-y-8">
      
      {/* 2FA Card */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${twoFactor ? 'bg-green-100 text-green-600' : 'bg-background-gray text-text-light'}`}>
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-text">Two-Factor Authentication</h3>
                    <p className="text-sm text-text-light mt-1 max-w-md">
                        Add an extra layer of security. We'll send a code to your phone when you log in.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${twoFactor ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-light">
                            {twoFactor ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>
            <Button 
                variant={twoFactor ? "outline" : "primary"}
                onClick={() => setTwoFactor(!twoFactor)}
                className={twoFactor ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
            >
                {twoFactor ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
        </div>
      </div>

      <div className="w-full h-px bg-border-light" />

      {/* Password Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-background-gray rounded-xl text-text">
                    <Key className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-text">Password</h3>
                    <p className="text-xs text-text-light">Last changed 3 months ago</p>
                </div>
            </div>
            {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    Change Password
                </Button>
            )}
        </div>

        <AnimatePresence>
            {showPasswordForm && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-background-gray/20 border border-border-light rounded-2xl p-6 space-y-4 max-w-lg">
                        <Input
                            type="password"
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-white"
                        />
                         <Input
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-white"
                        />
                         <Input
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white"
                            error={newPassword !== confirmPassword ? "Passwords do not match" : null}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setShowPasswordForm(false)}>Cancel</Button>
                            <Button onClick={handlePasswordUpdate}>Update Password</Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </section>

    </div>
  )
}
