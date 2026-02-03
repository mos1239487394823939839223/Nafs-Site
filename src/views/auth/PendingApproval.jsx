import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Mail, Home } from 'lucide-react'
import Button from '../../components/ui/Button'

export default function PendingApproval() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-lightBlue via-white to-clinical-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Clock className="w-12 h-12 text-yellow-600" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-clinical-darkGray mb-4">
            Application Submitted Successfully!
          </h1>

          {/* Description */}
          <p className="text-lg text-clinical-gray mb-8">
            Thank you for registering as a doctor on our platform. Your application is currently under review by our admin team.
          </p>

          {/* Status Timeline */}
          <div className="bg-medical-lightBlue p-6 rounded-lg mb-8 text-left">
            <h3 className="font-semibold text-clinical-darkGray mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-clinical-darkGray">Application Received</p>
                  <p className="text-sm text-clinical-gray">Your documents have been successfully submitted</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-clinical-darkGray">Under Review</p>
                  <p className="text-sm text-clinical-gray">Our team is verifying your credentials (24-48 hours)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-clinical-darkGray">Approval Notification</p>
                  <p className="text-sm text-clinical-gray">You'll receive an email once approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> We'll send you an email notification once your application has been reviewed. 
              Please check your inbox regularly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
            >
              Go to Login
            </Button>
          </div>

          {/* Contact */}
          <p className="text-sm text-clinical-gray mt-8">
            Have questions? Contact us at{' '}
            <a href="mailto:support@clinc.com" className="text-medical-blue hover:underline">
              support@clinc.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
