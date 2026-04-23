import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { Modal } from 'antd';
import { toast } from 'react-toastify';
import AdvanceTable from '../../components/Tables/AdvanceTable';
import ComponentCard from '../../components/common/ComponentCard';
import { formatDateWithTiming } from '../../components/common/dateFormat';
import PageMeta from '@/components/common/PageMeta';
import { encryptData } from '../../utility/crypto';
import { useNavigate } from 'react-router-dom';
import PlanDetailsModal from './PlanDetailsModal';
import { fetchPlanById, fetchPlans, togglePlanStatus, deleteExistingPlan } from './services/PlanSlice';

const Plans: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, loading, error, currentPlan } = useSelector((state: RootState) => state.plan);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleView = (item: any) => {
    setDetailModalVisible(true);
    dispatch(fetchPlanById(item.id));
  };
  const handleEdit = (item: any) => {
    const encryptedId = encodeURIComponent(encryptData(item.id));
    navigate(`/EditPlans/${encryptedId}`);
  };
  const handleDelete = (id: string) => {
    const plan = plans.find((p) => p._id === id);
    if (plan && (plan.subscriberCount || 0) > 0) {
      toast.error("Cannot delete a plan with active subscribers.");
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this plan?',
      content: 'This action cannot be undone and will permanently remove the plan.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: async () => {
        try {
          const resultAction = await dispatch(deleteExistingPlan(id));
          if (deleteExistingPlan.fulfilled.match(resultAction)) {
            toast.success('Plan deleted successfully');
          } else {
            toast.error((resultAction.payload as string) || 'Failed to delete plan');
          }
        } catch (error) {
          toast.error('An unexpected error occurred');
        }
      },
    });
  };

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    const initialState: { [key: string]: boolean } = {};
    plans.forEach(plan => {
      initialState[plan._id] = plan.isActive;
    });
    setSelectedRows(initialState);
  }, [plans]);

  const handleToggleStatus = (plan: any) => {
    dispatch(togglePlanStatus(plan._id));
  };

  const tableRows = plans.map(plan => ({
    ...plan,
    id: plan._id,
    formattedDate: formatDateWithTiming(plan.createdAt ?? null),
    statusStr: plan.isActive ? "Active" : "Inactive",
    featuredStr: plan.isFeatured ? "Yes" : "No",
    priceStr: plan.basePrice !== undefined
      ? (plan.basePrice === 0 ? "Free" : `${plan.currency || 'INR'} ${(plan.basePrice / 100).toLocaleString()}`)
      : "Contact Sales",
    limitsStr: plan.limits
      ? `Prods: ${plan.limits.maxProducts}, Orders: ${plan.limits.maxOrders}, Staff: ${plan.limits.maxStaff}`
      : "—",
    trialStr: plan.trial?.enabled ? `${plan.trial.durationDays} Days` : "No",
    billingCyclesStr: plan.billingCycles?.filter(c => c.isEnabled).map(c => c.label).join(", ") || "—",
    subscriberCount: plan.subscriberCount || 0
  }));

  const filteredRows = tableRows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      row.name?.toLowerCase().includes(query) ||
      row.description?.toLowerCase().includes(query) ||
      row.priceStr?.toLowerCase().includes(query) ||
      row.subscriberCount?.toString().includes(query) ||
      row.statusStr?.toLowerCase().includes(query)
    );
  });

  const headers = [
    { label: "Plan Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Price", key: "priceStr" },
    { label: "Subscribers", key: "subscriberCount" },
    { label: "Status", key: "statusStr" },
    { label: "Featured", key: "featuredStr" },
    { label: "Trial", key: "trialStr" },
    { label: "Limits", key: "limitsStr" },
    { label: "Billing Cycles", key: "billingCyclesStr" },
    { label: "Created At", key: "formattedDate" },
  ];

  return (
    <div className="">
      <ComponentCard title="Subscription Plans">
        <PageMeta title={`Plan List | ${import.meta.env.VITE_PLATFORM_NAME}`} description={`This is ${import.meta.env.VITE_PLATFORM_NAME} Platform`} />
        <AdvanceTable
          headers={headers as any}
          rows={filteredRows}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showAddButton={true}
          addButtonText="Add Plan"
          addButtonPath="/AddPlans"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          disableDeleteCondition={(row: any) => (row.subscriberCount || 0) > 0}
          onCheckbox={true}
          onCheckboxToggle={handleToggleStatus}
          checkboxHeading="Action"
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
        />
      </ComponentCard>

      <PlanDetailsModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        plan={currentPlan}
        loading={loading}
      />
    </div>
  );
};

export default Plans;
