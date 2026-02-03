import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Stethoscope, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function RoleSelection() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'patient',
      title: 'Join as a Patient',
      description: 'Book appointments, consult with doctors, and manage your health records',
      icon: User,
      color: 'from-medical-blue to-medical-darkBlue',
      features: [
        'Book video/audio consultations',
        'Access medical records',
        'AI Health Assistant',
        'Track health metrics',
      ],
      route: '/auth/register/patient',
    },
    {
      id: 'doctor',
      title: 'Join as a Doctor',
      description: 'Provide consultations, manage patients, and grow your practice',
      icon: Stethoscope,
      color: 'from-medical-teal to-green-600',
      features: [
        'Manage patient queue',
        'Set your availability',
        'Earn from consultations',
        'Build your reputation',
      ],
      route: '/auth/register/doctor',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-lightBlue via-white to-clinical-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-clinical-darkGray mb-4">
            Welcome to <span className="text-medical-blue">Clinc</span>
          </h1>
          <p className="text-xl text-clinical-gray max-w-2xl mx-auto">
            Choose how you'd like to join our healthcare platform
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${role.color} p-8 text-white`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <role.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{role.title}</h2>
                    </div>
                  </div>
                  <p className="text-white/90">{role.description}</p>
                </div>

                {/* Features */}
                <div className="p-8 flex-1">
                  <h3 className="font-semibold text-clinical-darkGray mb-4">What you get:</h3>
                  <ul className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-clinical-gray">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="p-8 pt-0">
                  <Button
                    onClick={() => navigate(role.route)}
                    className="w-full group"
                    variant={role.id === 'patient' ? 'primary' : 'secondary'}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-clinical-gray">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-medical-blue font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
          <p className="text-sm text-clinical-gray mt-4">
            For Customer Service or Admin access, please contact your system administrator
          </p>
        </motion.div>
      </div>
    </div>
  )
}
