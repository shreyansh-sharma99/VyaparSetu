import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';
import {
  FileText, User, Mail, Building2, CreditCard,
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
  Send, Download, BellRing, Receipt, BadgeDollarSign,
  Banknote, Percent, Tag, Hash, Box, ShoppingCart,
  Users, Store, HardDrive, ShieldCheck, BarChart3,
  Globe, Code2, Headphones, Zap, Layout, Bell,
} from 'lucide-react';
import { formatDateWithTiming } from '../../components/common/dateFormat';
import Loader from '../../components/UI/Loader';
import PageMeta from '@/components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/UI/button/Button';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchInvoiceById,
  clearCurrentInvoice,
  sendPaymentLink,
  markInvoicePaid,
  waiveInvoice,
  sendInvoiceReminder,
  downloadInvoicePdf,
} from './services/invoiceSlice';
import { decryptData } from '@/utility/crypto';
import { toast } from 'react-toastify';

type ActionType = 'sendLink' | 'markPaid' | 'waive' | 'sendReminder' | 'download' | null;

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentInvoice: inv, fetchingCurrent: loading, submitting } = useSelector(
    (state: RootState) => state.invoice
  );

  const [confirmAction, setConfirmAction] = useState<ActionType>(null);
  const [decryptedId, setDecryptedId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      try {
        const did = decryptData(decodeURIComponent(id));
        if (did) {
          setDecryptedId(did);
          dispatch(fetchInvoiceById(did));
        } else {
          toast.error('Invalid invoice ID');
          navigate(-1);
        }
      } catch {
        toast.error('Unable to access invoice details');
        navigate(-1);
      }
    }
    return () => { dispatch(clearCurrentInvoice()); };
  }, [dispatch, id, navigate]);

  const handleAction = (type: ActionType) => {
    if (type === 'download') {
      if (decryptedId && inv) {
        dispatch(downloadInvoicePdf({ invoiceId: decryptedId, invoiceNumber: inv.invoiceNumber }));
      }
      return;
    }
    setConfirmAction(type);
  };

  const handleConfirm = async () => {
    if (!decryptedId || !confirmAction) return;
    let action;
    if (confirmAction === 'sendLink') action = await dispatch(sendPaymentLink(decryptedId));
    else if (confirmAction === 'markPaid') action = await dispatch(markInvoicePaid(decryptedId));
    else if (confirmAction === 'waive') action = await dispatch(waiveInvoice(decryptedId));
    else if (confirmAction === 'sendReminder') action = await dispatch(sendInvoiceReminder(decryptedId));

    if (action && !action.type.endsWith('/rejected')) {
      setConfirmAction(null);
      dispatch(fetchInvoiceById(decryptedId));
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { classes: string; icon: React.ReactNode; label: string }> = {
      paid: { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Paid' },
      pending: { classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
      failed: { classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/40', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Failed' },
      waived: { classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/40', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Waived' },
      free: { classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40', icon: <Tag className="w-3.5 h-3.5" />, label: 'Free' },
    };
    return configs[status?.toLowerCase()] || { classes: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', icon: <AlertCircle className="w-3.5 h-3.5" />, label: status || 'Unknown' };
  };

  const actionConfig: Record<string, { title: string; desc: string; color: string; icon: React.ReactNode }> = {
    sendLink: { title: 'Send Payment Link', desc: 'This will send a payment link to the admin via email. Are you sure?', color: 'blue', icon: <Send className="w-8 h-8" /> },
    markPaid: { title: 'Mark as Paid', desc: 'This will mark the invoice as paid manually. This action cannot be undone.', color: 'emerald', icon: <CheckCircle2 className="w-8 h-8" /> },
    waive: { title: 'Waive Invoice', desc: 'This will waive the invoice amount. The invoice will be considered settled without payment.', color: 'purple', icon: <ShieldCheck className="w-8 h-8" /> },
    sendReminder: { title: 'Send Reminder', desc: 'This will send a payment reminder email to the admin.', color: 'amber', icon: <BellRing className="w-8 h-8" /> },
  };

  const InfoCard = ({ icon: Icon, label, value, color = 'text-blue-500' }: any) => (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50/60 dark:bg-white/[0.02] border border-gray-100/80 dark:border-white/[0.05] hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors">
      <div className={`mt-0.5 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 ${color} shrink-0`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words leading-snug">{value || 'N/A'}</div>
      </div>
    </div>
  );

  const featureIcons: Record<string, React.ReactNode> = {
    analyticsEnabled: <BarChart3 className="w-3 h-3" />,
    customDomain: <Globe className="w-3 h-3" />,
    apiAccess: <Code2 className="w-3 h-3" />,
    prioritySupport: <Headphones className="w-3 h-3" />,
    exportData: <Download className="w-3 h-3" />,
    whitelabel: <Zap className="w-3 h-3" />,
    customThemes: <Layout className="w-3 h-3" />,
    smsNotifications: <Bell className="w-3 h-3" />,
  };

  const isPaid = inv?.status === 'paid' || inv?.status === 'waived' || inv?.status === 'free';

  return (
    <div className="space-y-6">
      <PageMeta title={`Invoice ${inv?.invoiceNumber || ''} | VyaparSetu`} description="Invoice details" />

      <ComponentCard
        title={inv?.invoiceNumber || 'Invoice Details'}
        rightButtonNode={
          inv && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!isPaid && (
                <>
                  <Button variant="outline" size="xs"
                    onClick={() => handleAction('sendLink')}
                    className="flex items-center gap-1.5 !text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 !rounded-xl !px-3"
                  ><Send size={14} /> Send Link</Button>
                  <Button variant="outline" size="xs"
                    onClick={() => handleAction('markPaid')}
                    className="flex items-center gap-1.5 !text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 !rounded-xl !px-3"
                  ><CheckCircle2 size={14} /> Mark Paid</Button>
                  <Button variant="outline" size="xs"
                    onClick={() => handleAction('waive')}
                    className="flex items-center gap-1.5 !text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-900/30 !rounded-xl !px-3"
                  ><ShieldCheck size={14} /> Waive</Button>
                  <Button variant="outline" size="xs"
                    onClick={() => handleAction('sendReminder')}
                    className="flex items-center gap-1.5 !text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 !rounded-xl !px-3"
                  ><BellRing size={14} /> Reminder</Button>
                </>
              )}
              <Button variant="outline" size="xs"
                onClick={() => handleAction('download')}
                disabled={submitting}
                className="flex items-center gap-1.5 !text-gray-600 border-gray-200 hover:bg-gray-50 dark:border-gray-700 !rounded-xl !px-3"
              ><Download size={14} /> PDF</Button>
              <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <Button variant="danger" size="xs" onClick={() => navigate(-1)}
                className="flex items-center gap-2 !rounded-xl !px-4 shadow-sm font-semibold"
              ><span className="hidden sm:inline">Back</span></Button>
            </div>
          )
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader /></div>
        ) : inv ? (
          <div className="space-y-8">

            {/* Status Hero */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.02] dark:to-white/[0.01] border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <Receipt size={22} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Number</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {(() => {
                  const cfg = getStatusConfig(inv.status); return (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${cfg.classes}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  );
                })()}
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{inv.currency} {inv.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Admin & Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-blue-500" size={16} />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <InfoCard icon={User} label="Name" value={inv.adminId?.name} color="text-blue-500" />
                  <InfoCard icon={Mail} label="Email" value={inv.adminId?.email} color="text-indigo-500" />
                  <InfoCard icon={Building2} label="Business" value={inv.adminId?.businessName} color="text-purple-500" />
                  <InfoCard icon={Tag} label="Business Type" value={inv.adminId?.businessType} color="text-pink-500" />
                </div>
              </div>

              {/* Plan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-amber-500" size={16} />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <InfoCard icon={Zap} label="Plan Name" value={inv.planId?.name} color="text-amber-500" />
                  <InfoCard icon={Clock} label="Tenure" value={inv.tenure?.toUpperCase()} color="text-orange-500" />
                  <InfoCard icon={BadgeDollarSign} label="Base Price" value={inv.planId?.basePrice ? `${inv.planId.currency || inv.currency} ${inv.planId.basePrice.toLocaleString()}` : undefined} color="text-emerald-500" />
                  <InfoCard icon={CreditCard} label="Subscription Status" value={inv.adminId?.subscriptionStatus?.toUpperCase()} color="text-teal-500" />
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="text-emerald-500" size={16} />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Summary</h3>
              </div>
              <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] space-y-3">
                {inv.lineItems?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{inv.currency} {item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 space-y-2">
                  {[
                    { label: 'Subtotal', value: inv.subtotal, icon: <Receipt size={13} /> },
                    { label: `Discount (${inv.discountPercent}%)`, value: -inv.discountAmount, icon: <Percent size={13} /> },
                    { label: `Tax (${inv.taxPercent}%)`, value: inv.taxAmount, icon: <Hash size={13} /> },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">{row.icon}{row.label}</span>
                      <span>{inv.currency} {Math.abs(row.value).toLocaleString()}{row.value < 0 ? ' off' : ''}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">{inv.currency} {inv.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard icon={Calendar} label="Created At" value={formatDateWithTiming(inv.createdAt)} color="text-blue-400" />
              <InfoCard icon={Calendar} label="Due Date" value={formatDateWithTiming(inv.dueDate)} color="text-rose-400" />
              <InfoCard icon={CheckCircle2} label="Paid At" value={inv.paidAt ? formatDateWithTiming(inv.paidAt) : '—'} color="text-emerald-400" />
              <InfoCard icon={CreditCard} label="Razorpay Payment ID" value={inv.razorpayPaymentId || '—'} color="text-gray-400" />
            </div>

            {/* Plan Limits & Features */}
            {inv.planId?.limits && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-blue-500" size={16} />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan Limits</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Products', value: inv.planId.limits.maxProducts, icon: Box, color: 'text-blue-500' },
                      { label: 'Orders', value: inv.planId.limits.maxOrders, icon: ShoppingCart, color: 'text-emerald-500' },
                      { label: 'Customers', value: inv.planId.limits.maxCustomers, icon: Users, color: 'text-indigo-500' },
                      { label: 'Staff', value: inv.planId.limits.maxStaff, icon: User, color: 'text-purple-500' },
                      { label: 'Stores', value: inv.planId.limits.maxStores, icon: Store, color: 'text-amber-500' },
                      { label: 'Storage', value: inv.planId.limits.storageGB != null ? `${inv.planId.limits.storageGB} GB` : null, icon: HardDrive, color: 'text-rose-500' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] flex items-center gap-2.5">
                        <item.icon size={14} className={item.color} />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.value == null ? 'Unlimited' : item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {inv.planId?.features && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-amber-500" size={16} />
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Features</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(inv.planId.features).map(([key, enabled]) =>
                        enabled ? (
                          <div key={key} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                            <span className="text-emerald-500">{featureIcons[key] || <ShieldCheck size={12} />}</span>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {inv.notes && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Notes</p>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{inv.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} className="mb-4 opacity-20" />
            <p className="italic">No invoice data available</p>
          </div>
        )}
      </ComponentCard>

      {/* Confirm Modal */}
      <Modal
        open={!!confirmAction}
        onOk={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        confirmLoading={submitting}
        centered
        width={420}
        okText="Yes, Proceed"
        cancelText="Cancel"
        okButtonProps={{ className: '!rounded-xl font-bold border-0 h-10 px-6 bg-blue-600 hover:bg-blue-700' }}
        cancelButtonProps={{ className: '!rounded-xl font-bold h-10 px-6' }}
      >
        {confirmAction && actionConfig[confirmAction] && (
          <div className="py-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-4 shadow-lg">
              {actionConfig[confirmAction].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{actionConfig[confirmAction].title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{actionConfig[confirmAction].desc}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceDetails;
