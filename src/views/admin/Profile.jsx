import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import ProfileSettings from '../../components/doctor/settings/ProfileSettings'

export default function AdminProfile() {
    const { user } = useAuth()
    const toast = useToast()

    const handleSave = (data) => {
        console.log('Saving admin profile:', data)
        // Simulate API call
        setTimeout(() => {
            toast.success('Profile updated successfully')
        }, 800)
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
            </div>
        </div>
    )
}
