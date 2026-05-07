import React from 'react';
import { Modal, Tag, Divider, ConfigProvider, theme } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Plan } from './services/PlanSlice';
import { CheckCircle, Package, ShieldCheck, Database } from 'lucide-react';

interface PlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
  loading: boolean;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ visible, onClose, plan, loading }) => {
  const currentTheme = useSelector((state: RootState) => state.ui.theme);
  const isDark = currentTheme === 'dark';

  if (!plan && !loading) return null;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          Modal: {
            contentBg: isDark ? '#0B0F19' : '#ffffff',
            headerBg: isDark ? '#0B0F19' : '#ffffff',
          },
        },
      }}
    >
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
        classNames={{
          header: 'dark:bg-[#0B0F19] dark:border-b dark:border-gray-800 pb-2',
          body: 'dark:bg-[#0B0F19] pt-4',
        }}
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
                <p className="text-gray-500 text-sm mb-1 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-gray-200 font-medium">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <Tag color={plan.isActive ? 'green' : 'red'}>{plan.isActive ? 'Active' : 'Inactive'}</Tag>
                {plan.isFeatured && <Tag color="gold">Featured</Tag>}
              </div>
            </div>

            <Divider className="my-2 dark:border-gray-800" />

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

            {/* Access Mode */}
            <div className="bg-gray-50 dark:bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Access Mode
              </h3>
              <p className="text-gray-900 dark:text-white font-medium uppercase tracking-wider">{plan.accessMode}</p>
            </div>

            {/* Capabilities */}
            {plan.capabilities && Object.keys(plan.capabilities).length > 0 && (
              <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Plan Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(plan.capabilities)
                    .filter(([_, value]) => value !== false)
                    .map(([key, value]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const isBoolean = typeof value === 'boolean';

                      return (
                        <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${isBoolean ? (value ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30') : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'}`}>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase">{label}</span>
                            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              {isBoolean ? (
                                value ? <CheckCircle className="w-4 h-4 text-green-500" /> : <ShieldCheck className="w-4 h-4 text-red-500" />
                              ) : (
                                value
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default PlanDetailsModal;
