import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Science as TestTubeIcon,
  CheckCircle,
  HourglassEmpty as Clock3,
  ExpandMore as ChevronDown,
  ExpandLess as ChevronUp,
  FileDownload as Download,
  CalendarToday as Calendar,
  MedicalServices as Stethoscope,
  BarChart,
  Assignment as ClipboardList,
} from '@mui/icons-material'
import { useLanguage } from '../../contexts/LanguageContext'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

// Mock test data - in the future this will come from an API
const mockTests = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    nameAr: 'تعداد الدم الكامل (CBC)',
    requestedBy: 'Dr. Ahmed Salah',
    date: '2025-01-10',
    status: 'completed',
    category: 'hematology',
    results: [
      { name: 'WBC', nameAr: 'كريات الدم البيضاء', value: '7.2', unit: 'K/µL', normal: '4.5 – 11.0', status: 'normal' },
      { name: 'RBC', nameAr: 'كريات الدم الحمراء', value: '4.8', unit: 'M/µL', normal: '4.5 – 5.5', status: 'normal' },
      { name: 'Hemoglobin', nameAr: 'الهيموجلوبين', value: '13.2', unit: 'g/dL', normal: '13.5 – 17.5', status: 'low' },
      { name: 'Hematocrit', nameAr: 'الهيماتوكريت', value: '39', unit: '%', normal: '41 – 53', status: 'low' },
      { name: 'Platelets', nameAr: 'الصفائح الدموية', value: '260', unit: 'K/µL', normal: '150 – 400', status: 'normal' },
    ],
    notes: 'Slightly low hemoglobin. Monitor and consider iron supplementation.',
    notesAr: 'الهيموجلوبين منخفض قليلاً. مراقبة والنظر في مكملات الحديد.',
  },
  {
    id: 2,
    name: 'Fasting Blood Glucose',
    nameAr: 'سكر الدم الصيامي',
    requestedBy: 'Dr. Mona Khalil',
    date: '2025-01-08',
    status: 'completed',
    category: 'biochemistry',
    results: [
      { name: 'Blood Glucose', nameAr: 'سكر الدم', value: '105', unit: 'mg/dL', normal: '70 – 99', status: 'high' },
    ],
    notes: 'Borderline high glucose. Recommend dietary changes and follow-up in 3 months.',
    notesAr: 'الجلوكوز مرتفع على الحدود. يوصى بتغيير النظام الغذائي ومتابعة خلال 3 أشهر.',
  },
  {
    id: 3,
    name: 'Lipid Panel',
    nameAr: 'تحليل الدهون',
    requestedBy: 'Dr. Ahmed Salah',
    date: '2024-12-20',
    status: 'completed',
    category: 'biochemistry',
    results: [
      { name: 'Total Cholesterol', nameAr: 'الكوليسترول الكلي', value: '195', unit: 'mg/dL', normal: '< 200', status: 'normal' },
      { name: 'LDL', nameAr: 'LDL', value: '118', unit: 'mg/dL', normal: '< 130', status: 'normal' },
      { name: 'HDL', nameAr: 'HDL', value: '52', unit: 'mg/dL', normal: '> 40', status: 'normal' },
      { name: 'Triglycerides', nameAr: 'الدهون الثلاثية', value: '142', unit: 'mg/dL', normal: '< 150', status: 'normal' },
    ],
    notes: 'All values within normal range.',
    notesAr: 'جميع القيم ضمن النطاق الطبيعي.',
  },
  {
    id: 4,
    name: 'Thyroid Function Test',
    nameAr: 'وظائف الغدة الدرقية',
    requestedBy: 'Dr. Mona Khalil',
    date: '2025-01-15',
    status: 'pending',
    category: 'endocrinology',
    results: [],
    notes: '',
    notesAr: '',
  },
]

const categoryColors = {
  hematology: 'bg-rose-100 text-rose-700 border-rose-200',
  biochemistry: 'bg-blue-100 text-blue-700 border-blue-200',
  endocrinology: 'bg-purple-100 text-purple-700 border-purple-200',
  microbiology: 'bg-green-100 text-green-700 border-green-200',
}

const resultStatusConfig = {
  normal: { label: 'Normal', labelAr: 'طبيعي', color: 'text-green-600', bg: 'bg-green-50' },
  high: { label: 'High', labelAr: 'مرتفع', color: 'text-red-600', bg: 'bg-red-50' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'text-amber-600', bg: 'bg-amber-50' },
}

function TestCard({ test, isRTL }) {
  const [expanded, setExpanded] = useState(false)

  const isPending = test.status === 'pending'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-paper border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <button
        className="w-full p-5 text-left hover:bg-background-subtle/50 transition-colors"
        onClick={() => !isPending && setExpanded(v => !v)}
      >
        <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse flex-1' : 'flex-1'}`}>
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-amber-100' : 'bg-primary/10'}`}>
              {isPending
                ? <Clock3 className="w-6 h-6 text-amber-500" />
                : <TestTubeIcon className="w-6 h-6 text-primary" />
              }
            </div>

            {/* Info */}
            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="font-bold text-text-heading text-base leading-tight">
                {isRTL ? test.nameAr : test.name}
              </h3>
              <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                {test.requestedBy}
              </p>
              <p className="text-sm text-text-muted mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(test.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Right side: status + expand */}
          <div className={`flex items-center gap-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Badge variant={isPending ? 'warning' : 'success'}>
              {isPending
                ? (isRTL ? 'في الانتظار' : 'Pending')
                : (isRTL ? 'مكتمل' : 'Completed')
              }
            </Badge>
            {!isPending && (
              expanded
                ? <ChevronUp className="w-5 h-5 text-text-muted" />
                : <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {/* Results Panel */}
      <AnimatePresence>
        {expanded && !isPending && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-4">
              {/* Results Table */}
              {test.results.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background-subtle">
                        <th className={`px-4 py-3 font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? 'الاختبار' : 'Test'}
                        </th>
                        <th className="px-4 py-3 font-semibold text-text-muted text-center">
                          {isRTL ? 'القيمة' : 'Result'}
                        </th>
                        <th className="px-4 py-3 font-semibold text-text-muted text-center">
                          {isRTL ? 'المرجع' : 'Reference'}
                        </th>
                        <th className="px-4 py-3 font-semibold text-text-muted text-center">
                          {isRTL ? 'الحالة' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.results.map((r, idx) => {
                        const cfg = resultStatusConfig[r.status] || resultStatusConfig.normal
                        return (
                          <tr key={idx} className="border-t border-border hover:bg-background-subtle/40 transition-colors">
                            <td className={`px-4 py-3 font-medium text-text-heading ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? r.nameAr : r.name}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-text-heading">
                              {r.value} <span className="text-xs font-normal text-text-muted">{r.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-text-muted">{r.normal}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {r.status === 'normal' && <CheckCircle className="w-3 h-3" />}
                                {isRTL ? cfg.labelAr : cfg.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Doctor Notes */}
              {test.notes && (
                <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
                  <p className={`text-xs font-bold text-primary mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'ملاحظات الطبيب' : "Doctor's Notes"}
                  </p>
                  <p className={`text-sm text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? test.notesAr : test.notes}
                  </p>
                </div>
              )}

              {/* Download */}
              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <button className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                  <Download className="w-4 h-4" />
                  {isRTL ? 'تنزيل التقرير' : 'Download Report'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PatientTests() {
  const { isRTL } = useLanguage()
  const [filter, setFilter] = useState('all') // all, completed, pending

  const filtered = filter === 'all' ? mockTests
    : mockTests.filter(t => t.status === filter)

  const completedCount = mockTests.filter(t => t.status === 'completed').length
  const pendingCount = mockTests.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-heading flex items-center gap-3">
          <TestTubeIcon className="w-8 h-8 text-primary" />
          {isRTL ? 'نتائج التحاليل' : 'Medical Tests'}
        </h1>
        <p className="text-text-muted mt-1">
          {isRTL ? 'عرض وتتبع نتائج الاختبارات الطبية الخاصة بك' : 'View and track your medical test results'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <p className="text-3xl font-bold text-text-heading">{mockTests.length}</p>
          <p className="text-sm text-text-muted mt-1">{isRTL ? 'إجمالي' : 'Total'}</p>
        </Card>
        <Card className="text-center p-4 bg-green-50 border-green-200">
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-green-700 mt-1">{isRTL ? 'مكتملة' : 'Completed'}</p>
        </Card>
        <Card className="text-center p-4 bg-amber-50 border-amber-200">
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-amber-700 mt-1">{isRTL ? 'في الانتظار' : 'Pending'}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border gap-1">
        {[
          { key: 'all', labelEn: 'All Tests', labelAr: 'كل الاختبارات' },
          { key: 'completed', labelEn: 'Completed', labelAr: 'مكتملة' },
          { key: 'pending', labelEn: 'Pending', labelAr: 'في الانتظار' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-3 font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
              filter === tab.key
                ? 'text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]'
                : 'text-text-muted hover:text-text-heading hover:bg-background-subtle'
            }`}
          >
            {isRTL ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Test Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(test => (
            <TestCard key={test.id} test={test} isRTL={isRTL} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background-subtle/20 rounded-2xl border-2 border-dashed border-border">
          <ClipboardList className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium text-text-muted">
            {isRTL ? 'لا توجد اختبارات' : 'No tests found'}
          </h3>
          <p className="text-text-muted mt-2 text-sm">
            {isRTL ? 'ستظهر نتائج تحاليلك هنا' : 'Your test results will appear here once available'}
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <BarChart className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className={isRTL ? 'text-right' : 'text-left'}>
          {isRTL
            ? 'هذه النتائج للمرجعية فقط. يرجى استشارة طبيبك لتفسير النتائج والحصول على المشورة الطبية المناسبة.'
            : 'These results are for reference only. Please consult your doctor for interpretation and medical advice.'
          }
        </p>
      </div>
    </div>
  )
}
