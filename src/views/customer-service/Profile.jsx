import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'

import { useClinic } from '../../contexts/ClinicContext'

export default function StaffProfile() {
    const { user, updateProfile } = useAuth()
    const { updateUser } = useClinic()
    const toast = useToast()

    const handleSave = (data) => {
        updateUser(user.email, data)
        updateProfile(data)
        toast.success('Information updated successfully')
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-heading mb-2">Staff Profile</h1>
                    <p className="text-text-muted">Manage your support account information.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
                >
                    <div className="h-1.5 w-full bg-gradient-to-r from-secondary to-primary" />
                    <div className="p-6 md:p-8">
                        <ProfileSettings user={user} onSave={handleSave} />
                    </div>
                </motion.div>
            </div>
        </div >
    )
}
