import React from 'react';
import { Modal, Tag } from 'antd';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Shield,
  Activity,
  CreditCard,
  FileText,
  Package,
  ShoppingCart,
  Users,
  HardDrive,
  Layout,
  BarChart2,
  Globe,
  Database,
  HelpCircle,
  Download,
  ShieldCheck,
  Palette,
  Smartphone
} from 'lucide-react';
import { formatDateWithTiming } from '../../../components/common/dateFormat';

interface AdminDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  adminData: any; // This will be the { admin, subscriptions, invoices } object
  loading: boolean;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({ visible, onClose, adminData, loading }) => {
  const admin = adminData?.admin;

  if (!admin && !loading) return null;

  return (
    <Modal
      title={
        loading ? (
          "Loading Admin Details..."
        ) : (
          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
            <User className="w-5 h-5" /> Admin Details: {admin?.name}
          </span>
        )
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={850}
      centered
      className="admin-details-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : admin && (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide hover:scrollbar-default">

          {/* Quick Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <Tag color={admin.isActive ? 'green' : 'red'} className="m-0">
                  {admin.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Onboarding</p>
                <Tag color="blue" className="m-0 capitalize">
                  {admin.onboardingStatus?.replace('_', ' ') || 'Pending'}
                </Tag>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Joined On</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDateWithTiming(admin.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Personal & Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800">
                <User className="w-4 h-4 text-blue-500" /> Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm font-medium dark:text-gray-300">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-sm font-medium dark:text-gray-300">{admin.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800">
                <Building2 className="w-4 h-4 text-blue-500" /> Business Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Business Name</p>
                    <p className="text-sm font-medium dark:text-gray-300">{admin.businessName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Layout className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Business Type</p>
                    <p className="text-sm font-medium dark:text-gray-300">{admin.businessType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Subscription */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800">
                <MapPin className="w-4 h-4 text-blue-500" /> Office Address
              </h3>
              <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">
                  {admin.address?.street}<br />
                  {admin.address?.city}, {admin.address?.state}<br />
                  {admin.address?.country} - {admin.address?.pincode}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800">
                <CreditCard className="w-4 h-4 text-blue-500" /> Subscription Details
              </h3>
              <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <Tag color={admin.subscription?.status === 'active' ? 'green' : 'orange'} className="capitalize m-0">
                    {admin.subscription?.status || 'No Subscription'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Email Verified</span>
                  <Tag color={admin.emailVerified ? 'blue' : 'gray'} className="m-0">
                    {admin.emailVerified ? 'Verified' : 'Pending'}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Overrides */}
          {admin.usageOverrides && Object.values(admin.usageOverrides).some(v => v !== null) && (
            <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Custom Usage Overrides
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                {admin.usageOverrides.maxProducts !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Products</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.maxProducts === -1 ? 'Unlimited' : admin.usageOverrides.maxProducts}
                    </span>
                  </div>
                )}
                {admin.usageOverrides.maxOrders !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Orders</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.maxOrders === -1 ? 'Unlimited' : admin.usageOverrides.maxOrders}
                    </span>
                  </div>
                )}
                {admin.usageOverrides.maxCustomers !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Customers</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.maxCustomers === -1 ? 'Unlimited' : admin.usageOverrides.maxCustomers}
                    </span>
                  </div>
                )}
                {admin.usageOverrides.maxStaff !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Staff</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.maxStaff}
                    </span>
                  </div>
                )}
                {admin.usageOverrides.maxStores !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Stores</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Layout className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.maxStores}
                    </span>
                  </div>
                )}
                {admin.usageOverrides.storageGB !== null && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Storage</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-gray-400" /> {admin.usageOverrides.storageGB} GB
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feature Overrides */}
          {admin.featureOverrides && Object.values(admin.featureOverrides).some(v => v !== null) && (
            <div>
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Custom Feature Overrides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(admin.featureOverrides)
                  .filter(([_, value]) => value !== null)
                  .map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const isEnabled = value === true;
                    return (
                      <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${isEnabled ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                        <span className="text-sm font-medium flex items-center gap-2">
                          {key === 'analyticsEnabled' && <BarChart2 className="w-4 h-4 text-gray-400" />}
                          {key === 'customDomain' && <Globe className="w-4 h-4 text-gray-400" />}
                          {key === 'apiAccess' && <Database className="w-4 h-4 text-gray-400" />}
                          {key === 'prioritySupport' && <HelpCircle className="w-4 h-4 text-gray-400" />}
                          {key === 'exportData' && <Download className="w-4 h-4 text-gray-400" />}
                          {key === 'whitelabel' && <ShieldCheck className="w-4 h-4 text-gray-400" />}
                          {key === 'customThemes' && <Palette className="w-4 h-4 text-gray-400" />}
                          {key === 'smsNotifications' && <Smartphone className="w-4 h-4 text-gray-400" />}
                          {label}
                        </span>
                        {isEnabled ? (
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {admin.notes && (
            <div className="bg-yellow-50/30 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
              <h3 className="text-yellow-700 dark:text-yellow-500 font-semibold mb-2 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" /> Internal Notes
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{admin.notes}"
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AdminDetailsModal;
