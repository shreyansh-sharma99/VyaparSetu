import React from 'react';
import { Modal, Tag, Divider } from 'antd';
import type { Plan } from './services/PlanSlice';
import { CheckCircle, XCircle, Package, Users, ShoppingCart, HardDrive, Layout, ShieldCheck, BarChart2, Globe, Database, HelpCircle, Download, Smartphone, Palette } from 'lucide-react';

interface PlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
  loading: boolean;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ visible, onClose, plan, loading }) => {
  if (!plan && !loading) return null;

  return (
    <Modal
      title={
        loading ? (
          "Loading Plan Details..."
        ) : (
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            Plan Details: {plan?.name}
          </span>
        )
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      className="plan-details-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : plan && (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide hover:scrollbar-default">
          {/* Header Info */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Description</p>
              <p className="text-gray-900 dark:text-gray-200 font-medium">{plan.description}</p>
            </div>
            <div className="flex gap-2">
              <Tag color={plan.isActive ? 'green' : 'red'}>{plan.isActive ? 'Active' : 'Inactive'}</Tag>
              {plan.isFeatured && <Tag color="gold">Featured</Tag>}
            </div>
          </div>

          <Divider className="my-2" />

          {/* Pricing & Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="text-blue-700 dark:text-blue-400 font-semibold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" /> Pricing Structure
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.currency} {(plan.basePrice / 100).toLocaleString()} <span className="text-sm font-normal text-gray-500">/ base</span>
              </p>
              {plan.trial.enabled && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3.3 h-3.3" /> {plan.trial.durationDays} Days Free Trial Included
                </p>
              )}
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              <h3 className="text-purple-700 dark:text-purple-400 font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Billing Cycles
              </h3>
              <div className="space-y-2">
                {plan.billingCycles.filter(c => c.isEnabled).map(cycle => (
                  <div key={cycle.tenure} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{cycle.label}</span>
                    <span className="font-medium text-purple-600">{cycle.discountPercent}% Discount</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Limits */}
          {(Object.values(plan.limits).some(v => v !== 0 && v !== null && v !== undefined)) && (
            <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Usage & Storage Limits
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                {(plan.limits.maxProducts > 0 || plan.limits.maxProducts === -1) && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Products</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.maxProducts === -1 ? 'Unlimited' : plan.limits.maxProducts}
                    </span>
                  </div>
                )}
                {(plan.limits.maxOrders > 0 || plan.limits.maxOrders === -1) && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Orders</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.maxOrders === -1 ? 'Unlimited' : plan.limits.maxOrders}
                    </span>
                  </div>
                )}
                {(plan.limits.maxCustomers > 0 || plan.limits.maxCustomers === -1) && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Customers</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.maxCustomers === -1 ? 'Unlimited' : plan.limits.maxCustomers}
                    </span>
                  </div>
                )}
                {plan.limits.maxStaff > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Staff</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.maxStaff}
                    </span>
                  </div>
                )}
                {plan.limits.maxStores > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Stores</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Layout className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.maxStores}
                    </span>
                  </div>
                )}
                {plan.limits.storageGB > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase">Storage</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-gray-400" /> {plan.limits.storageGB} GB
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {Object.values(plan.features).some(enabled => enabled) && (
            <div>
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4">Included Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(plan.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([key, _enabled]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
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
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PlanDetailsModal;
