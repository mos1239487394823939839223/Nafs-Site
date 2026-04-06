import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import {
  Search,
  FilterList as Filter,
  Sync as Loader2,
  CheckCircle,
  Close as X,
  OpenInNew,
  ReceiptLong,
  PendingActions,
  Verified,
  AccountBalanceWallet,
  Person,
} from '@mui/icons-material'
import { customerSupportAPI } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPaymentStatusFilterOptions, getPaymentStatusMeta, normalizePaymentStatus } from '../../lib/paymentStatus'

export default function CustomerServiceDashboard() {
  const { t, isRTL } = useLanguage()
  const toast = useToast()

  const [manualPayments, setManualPayments] = useState([])
  const [manualPaymentsLoading, setManualPaymentsLoading] = useState(false)
  const [manualPaymentsPage, setManualPaymentsPage] = useState(1)
  const [manualPaymentsPagesCount, setManualPaymentsPagesCount] = useState(1)
  const [manualPaymentsSearch, setManualPaymentsSearch] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')
  const [rejectingPayment, setRejectingPayment] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const tx = (key, fallback) => {
    const value = t(key)
    return value && value !== key ? value : fallback
  }

  const statusFilterOptions = [
    { value: 'all', label: tx('common.allStatuses', 'All Statuses') },
    ...getPaymentStatusFilterOptions({ isRTL }),
  ]

  const fetchManualPayments = async (page = 1, statusFilter = selectedStatusFilter) => {
    setManualPaymentsLoading(true)
    try {
      const statusValue = statusFilter === 'all' ? null : Number(statusFilter)
      const response = await customerSupportAPI.getManualPayments(page, 20, statusValue)
      if (response?.IsSuccess !== false && response?.Data) {
        setManualPayments(response.Data.Items || [])
        setManualPaymentsPage(Number(response.Data.PageIndex || page))
        setManualPaymentsPagesCount(Number(response.Data.Pages || 1))
      } else {
        toast.error(response?.Message || tx('errors.loadFailed', 'Failed to load manual payments'))
      }
    } catch (error) {
      console.error('Failed to fetch manual payments:', error)
      toast.error(tx('errors.loadFailed', 'Failed to load manual payments'))
    } finally {
      setManualPaymentsLoading(false)
    }
  }

  useEffect(() => {
    fetchManualPayments(1, selectedStatusFilter)
  }, [selectedStatusFilter])

  const getProviderLabel = (providerValue) => {
    const value = Number(providerValue)
    if (value === 2) return 'InstaPay'
    if (value === 3) return tx('staff.cashWallet', 'Cash Wallet')
    return `${tx('staff.provider', 'Provider')} #${providerValue ?? '-'}`
  }

  const filteredManualPayments = useMemo(() => {
    const q = manualPaymentsSearch.trim().toLowerCase()
    return manualPayments.filter((item) => {
      if (!q) return true

      const patientName = String(item?.PatientName || '').toLowerCase()
      const referenceNumber = String(item?.ReferenceNumber || '').toLowerCase()
      const bookingId = String(item?.BookingId || '').toLowerCase()
      const paymentId = String(item?.Id || '').toLowerCase()

      return patientName.includes(q) || referenceNumber.includes(q) || bookingId.includes(q) || paymentId.includes(q)
    })
  }, [manualPayments, manualPaymentsSearch])

  const summary = useMemo(() => {
    const pending = manualPayments.filter((item) => normalizePaymentStatus(item?.Status) === 1).length
    const completed = manualPayments.filter((item) => normalizePaymentStatus(item?.Status) === 2).length
    const failed = manualPayments.filter((item) => normalizePaymentStatus(item?.Status) === 3).length
    const refunded = manualPayments.filter((item) => normalizePaymentStatus(item?.Status) === 4).length
    return {
      total: manualPayments.length,
      pending,
      completed,
      failed,
      refunded,
    }
  }, [manualPayments])

  const handleConfirmPayment = async (paymentItem) => {
    setActionLoadingId(paymentItem.Id)
    try {
      const response = await customerSupportAPI.confirmManualPayment(paymentItem.Id)
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || tx('errors.somethingWentWrong', 'Something went wrong'))
      } else {
        toast.success(tx('staff.paymentConfirmed', 'Payment confirmed successfully'))
        await fetchManualPayments(manualPaymentsPage, selectedStatusFilter)
      }
    } catch (error) {
      console.error('Failed to confirm manual payment:', error)
      toast.error(tx('errors.somethingWentWrong', 'Something went wrong'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const openRejectModal = (paymentItem) => {
    setRejectingPayment(paymentItem)
    setRejectionReason('')
  }

  const handleRejectPayment = async () => {
    if (!rejectingPayment) return

    setActionLoadingId(rejectingPayment.Id)
    try {
      const response = await customerSupportAPI.rejectManualPayment(rejectingPayment.Id, rejectionReason.trim())
      if (response?.IsSuccess === false) {
        toast.error(response?.Message || tx('errors.somethingWentWrong', 'Something went wrong'))
      } else {
        toast.success(tx('staff.paymentRejected', 'Payment rejected'))
        setRejectingPayment(null)
        setRejectionReason('')
        await fetchManualPayments(manualPaymentsPage, selectedStatusFilter)
      }
    } catch (error) {
      console.error('Failed to reject manual payment:', error)
      toast.error(tx('errors.somethingWentWrong', 'Something went wrong'))
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-secondary/10 to-background-paper p-6 md:p-8"
      >
        <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-14 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative grid lg:grid-cols-3 gap-5 items-center">
          <div className="lg:col-span-2 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-heading">
              {tx('staff.manualPaymentRequests', 'Manual Payment Requests')}
            </h1>
            <p className="text-text-muted max-w-2xl">
              {tx('staff.manualPaymentDesc', 'Review transfer evidence quickly, approve valid payments, and reject suspicious submissions with clear reasons.')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryChip icon={ReceiptLong} label={tx('common.total', 'Total')} value={summary.total} tone="text-primary" />
            <SummaryChip icon={PendingActions} label={isRTL ? 'في انتظار الدفع' : 'Pending'} value={summary.pending} tone="text-amber-300" />
            <SummaryChip icon={Verified} label={isRTL ? 'تم الدفع بنجاح' : 'Completed'} value={summary.completed} tone="text-emerald-300" />
            <SummaryChip icon={X} label={isRTL ? 'فشل الدفع' : 'Failed'} value={summary.failed} tone="text-red-300" />
            <SummaryChip icon={AccountBalanceWallet} label={isRTL ? 'تم استرداد المبلغ' : 'Refunded'} value={summary.refunded} tone="text-sky-300" />
          </div>
        </div>
      </motion.div>

      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border pb-4">
          <CardTitle className="text-xl">{tx('staff.requestsList', 'Requests List')}</CardTitle>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                value={manualPaymentsSearch}
                onChange={(e) => setManualPaymentsSearch(e.target.value)}
                placeholder={tx('staff.searchManualPayment', 'Search by patient, booking, reference...')}
                className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text w-full"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-text"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={() => fetchManualPayments(manualPaymentsPage, selectedStatusFilter)}>
              <Filter className="w-4 h-4" />
              {tx('common.refresh', 'Refresh')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-5 space-y-4">
          {manualPaymentsLoading ? (
            <div className="text-center py-16 text-text-muted">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              {tx('staff.loadingManualPayments', 'Loading manual payments...')}
            </div>
          ) : filteredManualPayments.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <ReceiptLong className="w-10 h-10 mx-auto mb-2 opacity-40" />
              {tx('staff.noManualPayments', 'No manual payment requests found.')}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {filteredManualPayments.map((item, index) => {
                const statusMeta = getPaymentStatusMeta(item?.Status, { isRTL })
                const createdAtText = item?.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : '-'
                const sessionTimeText = item?.SessionStartTime ? new Date(item.SessionStartTime).toLocaleString() : '-'
                const isBusy = actionLoadingId === item.Id
                const isPendingPayment = statusMeta.value === 1

                return (
                  <motion.div
                    key={item.Id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-2xl border border-border bg-background-paper/80 backdrop-blur-sm p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-text-heading truncate">{item.PatientName || tx('common.unknownPatient', 'Unknown Patient')}</p>
                        <p className="text-xs text-text-muted mt-0.5">#{item.Id || '-'} | {tx('booking.id', 'Booking')} #{item.BookingId || '-'}</p>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusMeta.chipClass}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-text-muted mb-4">
                      <p className="flex items-center gap-2"><AccountBalanceWallet className="w-4 h-4 text-primary" /> {getProviderLabel(item.Provider)}</p>
                      <p>{tx('staff.referenceNumber', 'Reference')}: {item.ReferenceNumber || '-'}</p>
                      <p>{tx('staff.sessionTime', 'Session')}: {sessionTimeText}</p>
                      <p>{tx('staff.submittedAt', 'Submitted')}: {createdAtText}</p>
                      {item.RejectionReason && (
                        <p className="text-red-400">{tx('staff.rejectionReason', 'Rejection reason')}: {item.RejectionReason}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {item.ScreenshotUrl ? (
                        <a href={item.ScreenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                          <Button variant="outline" size="sm">
                            <OpenInNew className="w-4 h-4" />
                            {tx('common.view', 'View')}
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted inline-flex items-center gap-1.5"><Person className="w-3.5 h-3.5" /> {tx('staff.noScreenshot', 'No screenshot')}</span>
                      )}

                      {isPendingPayment ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isBusy}
                            onClick={() => handleConfirmPayment(item)}
                          >
                            {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            {isRTL ? 'تأكيد الدفع' : 'Mark Completed'}
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isBusy}
                            onClick={() => openRejectModal(item)}
                          >
                            <X className="w-4 h-4" />
                            {isRTL ? 'فشل الدفع' : 'Mark Failed'}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">
                          {isRTL ? 'تمت معالجة الحالة' : 'Already processed'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {manualPaymentsPagesCount > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-text-muted">{tx('common.page', 'Page')} {manualPaymentsPage} {tx('common.of', 'of')} {manualPaymentsPagesCount}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={manualPaymentsPage <= 1 || manualPaymentsLoading}
                  onClick={() => fetchManualPayments(manualPaymentsPage - 1, selectedStatusFilter)}
                >
                  {tx('common.previous', 'Previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={manualPaymentsPage >= manualPaymentsPagesCount || manualPaymentsLoading}
                  onClick={() => fetchManualPayments(manualPaymentsPage + 1, selectedStatusFilter)}
                >
                  {tx('common.next', 'Next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={Boolean(rejectingPayment)}
        onClose={() => {
          setRejectingPayment(null)
          setRejectionReason('')
        }}
        title={tx('staff.rejectManualPayment', 'Reject Manual Payment')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {tx('staff.rejectPrompt', 'Provide a rejection reason for this payment request.')}
          </p>

          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder={tx('staff.rejectionReasonPlaceholder', 'Reason (optional)')}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingPayment(null)
                setRejectionReason('')
              }}
            >
              {tx('common.cancel', 'Cancel')}
            </Button>
            <Button variant="danger" onClick={handleRejectPayment} disabled={!rejectingPayment || actionLoadingId === rejectingPayment?.Id}>
              {actionLoadingId === rejectingPayment?.Id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              {tx('common.reject', 'Reject')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function SummaryChip({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background-paper/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-muted">{label}</p>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <p className="text-xl font-bold text-text-heading mt-1">{value}</p>
    </div>
  )
}
