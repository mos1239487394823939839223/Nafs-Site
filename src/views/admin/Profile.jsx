import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'

import { useClinic } from '../../contexts/ClinicContext'

export default function AdminProfile() {
    const { user, updateProfile } = useAuth()
    const { updateUser, resetClinicData } = useClinic()
    const toast = useToast()

    const handleSave = (data) => {
        updateUser(user.email, data)
        updateProfile(data)
        toast.success('Profile updated successfully')
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-heading mb-2">Admin Profile</h1>
                    <p className="text-text-muted">Manage your administrative account information.</p>
                </div>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
                >
                    {/* Decorative Top Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-sage-light" />

                    <div className="p-6 md:p-8">
                        <ProfileSettings user={user} onSave={handleSave} />
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-8 bg-red-500/10 rounded-2xl p-8 border border-red-500/20"
                >
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-red-600/80 dark:text-red-400/80 mb-6">Resetting the clinic data will clear all appointments, tickets, and user registrations back to default.</p>
                    <Button
                        variant="outline"
                        className="border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to reset all demo data?')) {
                                resetClinicData()
                            }
                        }}
                    >
                        Reset All Clinic Data
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
