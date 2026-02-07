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
                    <h1 className="text-3xl font-bold text-text mb-2">Admin Profile</h1>
                    <p className="text-text-light">Manage your administrative account information.</p>
                </div>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden"
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
                    className="mt-8 bg-red-50 rounded-2xl p-8 border border-red-100"
                >
                    <h3 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-red-700 mb-6">Resetting the clinic data will clear all appointments, tickets, and user registrations back to default.</p>
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
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
