import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../lib/api'

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function DoctorFinance() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { t, isRTL } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [earnings, setEarnings] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [payoutPage, setPayoutPage] = useState(1)
  const [payoutTotalPages, setPayoutTotalPages] = useState(1)
  const [form, setForm] = useState({ amount: '', notes: '' })

  const doctorFromState = location.state?.doctor
  const doctorName =
    doctorFromState?.Name ||
    doctorFromState?.name ||
    `${isRTL ? 'طبيب' : 'Doctor'} #${doctorId || '-'}`

  const formatCurrency = (value) => {
    const numeric = toNumber(value, 0)
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numeric)} EGP`
  }

  const transactions = useMemo(() => {
    if (Array.isArray(earnings?.Transactions?.Items)) {
      return earnings.Transactions.Items
    }
    return []
  }, [earnings])

  const fetchFinance = useCallback(async (page = payoutPage) => {
    if (!doctorId) return

    setLoading(true)
    try {
      const [earningsResponse, payoutsResponse] = await Promise.all([
        adminAPI.getDoctorEarnings(doctorId, 1, 20),
        adminAPI.getDoctorPayouts(doctorId, page, 20),
      ])

      const payoutsData = payoutsResponse?.Data
      const nextPayouts = Array.isArray(payoutsData?.Items)
        ? payoutsData.Items
        : Array.isArray(payoutsData)
        ? payoutsData
        : []

      setEarnings(earningsResponse?.Data || null)
      setPayouts(nextPayouts)
      setPayoutTotalPages(
        toNumber(payoutsData?.TotalPages || payoutsData?.Pages, 1),
      )
    } catch (error) {
      toast.error(error?.response?.data?.Message || t('errors.somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }, [doctorId, payoutPage, t, toast])

  useEffect(() => {
    fetchFinance(payoutPage)
  }, [fetchFinance, payoutPage])

  const handleCreatePayout = async () => {
    if (!doctorId) return

    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t('errors.invalidAmount', 'Please enter a valid payout amount'))
      return
    }

    setSubmitting(true)
    try {
      const response = await adminAPI.createDoctorPayout(doctorId, {
        amount,
        notes: form.notes,
      })

      if (response?.IsSuccess === false) {
        toast.error(response?.Message || t('errors.somethingWentWrong'))
        return
      }

      toast.success(t('success.saved', 'Saved successfully'))
      setForm({ amount: '', notes: '' })
      await fetchFinance(payoutPage)
    } catch (error) {
      toast.error(error?.response?.data?.Message || t('errors.somethingWentWrong'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-heading">
            {t('admin.doctorFinanceTitle', 'Doctor Finance Overview')}
          </h2>
          <p className="text-sm text-text-muted mt-1">{doctorName}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          {t('common.backToList', isRTL ? 'العودة للقائمة' : 'Back to List')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label={t('common.loading')} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.totalConfirmed', 'Total Confirmed')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatCurrency(earnings?.TotalConfirmedAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.totalPending', 'Total Pending')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatCurrency(earnings?.TotalPendingAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.totalPayedOut', 'Total Paid Out')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatCurrency(earnings?.TotalPayedOut)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.remainingBalance', 'Remaining Balance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-text-heading">
                  {formatCurrency(earnings?.RemainingBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.createPayout', 'Create Payout')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label={t('admin.payoutAmount', 'Amount')}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
                <Input
                  label={t('common.notes')}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleCreatePayout} isLoading={submitting}>
                  {t('admin.createPayout', 'Create Payout')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.payoutHistory', 'Payout History')}</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <p className="text-sm text-text-muted">{t('admin.noPayoutsYet', 'No payouts yet')}</p>
              ) : (
                <div className="space-y-2">
                  {payouts.map((payout, index) => (
                    <div
                      key={payout.Id || payout.ID || index}
                      className="rounded-lg border border-border bg-background-subtle p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-text-heading">
                          {formatCurrency(payout.Amount)}
                        </p>
                        <p className="text-xs text-text-muted">
                          {payout.CreatedAt
                            ? new Date(payout.CreatedAt).toLocaleString()
                            : '-'}
                        </p>
                      </div>
                      {payout.Notes && (
                        <p className="mt-1 text-sm text-text-muted">{payout.Notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Pagination
                  page={payoutPage}
                  total={payoutTotalPages}
                  onChange={setPayoutPage}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.recentTransactions', 'Recent Transactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.patient', isRTL ? 'المريض' : 'Patient')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((item, idx) => (
                      <TableRow key={item.PaymentId || idx}>
                        <TableCell>
                          {item.CreatedAt
                            ? new Date(item.CreatedAt).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>{item.PatientName || '-'}</TableCell>
                        <TableCell>{item.Status ?? '-'}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.Amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow hover={false}>
                      <TableCell colSpan={4} className="text-center text-text-muted py-8">
                        {t('admin.noTransactions', 'No transactions found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
