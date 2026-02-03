import ChatInterface from '../../components/chat/ChatInterface'
import { useAuth } from '../../contexts/AuthContext'

// Mock data for consultations
const mockConsultations = [
  {
    id: 1,
    participant: {
      name: 'Dr. Sarah Ahmed',
      avatar: null,
      role: 'Cardiologist',
      online: true
    },
    lastMessage: 'Your test results look good. Keep up with the medication.',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min ago
    unread: 2,
    messages: [
      {
        id: 1,
        sender: 'doctor',
        content: 'Hello! How are you feeling today?',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        read: true
      },
      {
        id: 2,
        sender: 'current-user',
        content: 'Hi Doctor! I\'m feeling much better. The new medication is working well.',
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        read: true
      },
      {
        id: 3,
        sender: 'doctor',
        content: 'That\'s great to hear! I\'ve reviewed your latest blood test results.',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        read: true
      },
      {
        id: 4,
        sender: 'doctor',
        content: 'Your test results look good. Keep up with the medication.',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        read: false,
        attachments: [
          {
            name: 'blood-test-results.pdf',
            size: '245 KB',
            type: 'file',
            url: '#'
          }
        ]
      }
    ],
    patientData: {
      vitals: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 98.6
      },
      recentTests: [
        { name: 'Blood Test', date: '2024-01-20', status: 'Normal' },
        { name: 'ECG', date: '2024-01-15', status: 'Normal' },
        { name: 'Cholesterol Panel', date: '2024-01-10', status: 'Elevated' }
      ],
      medications: ['Aspirin 81mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
      allergies: ['Penicillin', 'Sulfa drugs']
    }
  },
  {
    id: 2,
    participant: {
      name: 'Dr. Michael Chen',
      avatar: null,
      role: 'General Practitioner',
      online: false
    },
    lastMessage: 'Please schedule a follow-up appointment next week.',
    timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hr ago
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'doctor',
        content: 'Good morning! I wanted to check in on your recovery.',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
        read: true
      },
      {
        id: 2,
        sender: 'current-user',
        content: 'Good morning Doctor! I\'m recovering well, thank you.',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60000).toISOString(),
        read: true
      },
      {
        id: 3,
        sender: 'doctor',
        content: 'Excellent! Please schedule a follow-up appointment next week.',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        read: true
      }
    ],
    patientData: {
      vitals: {
        heartRate: 68,
        bloodPressure: '118/75',
        temperature: 98.4
      },
      recentTests: [
        { name: 'X-Ray', date: '2024-01-18', status: 'Normal' }
      ],
      medications: ['Ibuprofen 400mg'],
      allergies: []
    }
  },
  {
    id: 3,
    participant: {
      name: 'Dr. Emily Rodriguez',
      avatar: null,
      role: 'Dermatologist',
      online: true
    },
    lastMessage: 'The prescription has been sent to your pharmacy.',
    timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'current-user',
        content: 'Hi Dr. Rodriguez, the rash is getting better with the cream you prescribed.',
        timestamp: new Date(Date.now() - 25 * 60 * 60000).toISOString(),
        read: true
      },
      {
        id: 2,
        sender: 'doctor',
        content: 'That\'s wonderful news! Continue using it twice daily.',
        timestamp: new Date(Date.now() - 24.5 * 60 * 60000).toISOString(),
        read: true
      },
      {
        id: 3,
        sender: 'doctor',
        content: 'The prescription has been sent to your pharmacy.',
        timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        read: true
      }
    ],
    patientData: {
      vitals: {
        heartRate: 75,
        bloodPressure: '122/78',
        temperature: 98.7
      },
      recentTests: [],
      medications: ['Hydrocortisone Cream 1%'],
      allergies: ['Latex']
    }
  }
]

export default function MessagesPage() {
  const { user } = useAuth()

  return (
    <div className="fixed inset-0 lg:static lg:h-[calc(100vh-4rem)]">
      <ChatInterface
        consultations={mockConsultations}
        currentUserId={user?.id || 'current-user'}
      />
    </div>
  )
}
