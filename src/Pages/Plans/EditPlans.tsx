import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { decryptData } from '../../utility/crypto';
import ComponentCard from '../../components/common/ComponentCard';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Checkbox from '../../components/form/input/Checkbox';
import Select from '../../components/form/Select';
import Button from '../../components/UI/button/Button';
import { Label } from '@/components/layout/label';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { addNewPlan, fetchPlanById, updateExistingPlan } from './services/PlanSlice';
import PageMeta from '@/components/common/PageMeta';
import { LoaderIcon } from '@/icons/icons';

const CURRENCY_OPTIONS = [
    { label: "₹ Indian Rupee (INR)", value: "INR" },
    { label: "$ United States Dollar (USD)", value: "USD" },
    { label: "€ Euro (EUR)", value: "EUR" },
    { label: "£ British Pound Sterling (GBP)", value: "GBP" },
    { label: "¥ Japanese Yen (JPY)", value: "JPY" },
    { label: "¥ Chinese Yuan (CNY)", value: "CNY" },
    { label: "$ Canadian Dollar (CAD)", value: "CAD" },
    { label: "$ Australian Dollar (AUD)", value: "AUD" },
    { label: "CHF Swiss Franc (CHF)", value: "CHF" },
    { label: "$ Singapore Dollar (SGD)", value: "SGD" },
    { label: "د.إ UAE Dirham (AED)", value: "AED" },
    { label: "﷼ Saudi Riyal (SAR)", value: "SAR" },
    { label: "R South African Rand (ZAR)", value: "ZAR" },
    { label: "$ New Zealand Dollar (NZD)", value: "NZD" },
    { label: "$ Hong Kong Dollar (HKD)", value: "HKD" },
    { label: "₩ South Korean Won (KRW)", value: "KRW" },
    { label: "R$ Brazilian Real (BRL)", value: "BRL" },
    { label: "₽ Russian Ruble (RUB)", value: "RUB" },
    { label: "$ Mexican Peso (MXN)", value: "MXN" },
    { label: "₺ Turkish Lira (TRY)", value: "TRY" }
];

interface BillingCycle {
    tenure: string;
    label: string;
    durationMonths: number;
    discountPercent: number | string;
    isEnabled: boolean;
}

interface PlanFormData {
    name: string;
    description: string;
    isFeatured: boolean;
    isActive: boolean;
    basePrice: number | string;
    currency: string;
    trial: {
        enabled: boolean;
        durationDays: number | string;
    };
    billingCycles: BillingCycle[];
    limits: {
        maxProducts: number | string;
        maxOrders: number | string;
        maxCustomers: number | string;
        maxStaff: number | string;
        maxStores: number | string;
        storageGB: number | string;
    };
    features: {
        analyticsEnabled: boolean;
        customDomain: boolean;
        apiAccess: boolean;
        prioritySupport: boolean;
        exportData: boolean;
        whitelabel: boolean;
        customThemes: boolean;
        smsNotifications: boolean;
    };
}

const EditPlans: React.FC = () => {
    const navigate = useNavigate();
    const { planId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { submitting, currentPlan, loading } = useSelector((state: RootState) => state.plan);

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<PlanFormData>({
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: {
            name: '',
            description: '',
            isFeatured: false,
            isActive: true,
            basePrice: '',
            currency: 'INR',
            trial: { enabled: false, durationDays: '' },
            billingCycles: [
                { tenure: 'monthly', label: 'Monthly', durationMonths: 1, discountPercent: '', isEnabled: false },
                { tenure: 'quarterly', label: 'Quarterly', durationMonths: 3, discountPercent: '', isEnabled: false },
                { tenure: 'halfYearly', label: 'Half-Yearly', durationMonths: 6, discountPercent: '', isEnabled: false },
                { tenure: 'yearly', label: 'Yearly', durationMonths: 12, discountPercent: '', isEnabled: false }
            ],
            limits: {
                maxProducts: '',
                maxOrders: '',
                maxCustomers: '',
                maxStaff: '',
                maxStores: '',
                storageGB: ''
            },
            features: {
                analyticsEnabled: false,
                customDomain: false,
                apiAccess: false,
                prioritySupport: false,
                exportData: false,
                whitelabel: false,
                customThemes: false,
                smsNotifications: false
            }
        }
    });

    const trialEnabled = watch('trial.enabled');
    const features = watch('features');
    const allFeaturesSelected = Object.values(features).every(v => v === true);

    const toggleAllFeatures = (checked: boolean) => {
        Object.keys(features).forEach((key) => {
            setValue(`features.${key as keyof typeof features}`, checked);
        });
    };

    React.useEffect(() => {
        if (planId) {
            const decodedId = decryptData(decodeURIComponent(planId));
            if (decodedId) {
                dispatch(fetchPlanById(decodedId));
            } else {
                toast.error('Invalid Plan ID');
                navigate('/Plans');
            }
        }
    }, [planId, dispatch, navigate]);

    React.useEffect(() => {
        if (currentPlan) {
            reset({
                ...currentPlan,
                basePrice: (Number(currentPlan?.basePrice) / 100).toString(),
                trial: {
                    ...currentPlan.trial,
                    durationDays: currentPlan.trial.durationDays?.toString()
                },
                billingCycles: currentPlan.billingCycles.map(cycle => ({
                    ...cycle,
                    discountPercent: cycle.discountPercent?.toString()
                })),
                limits: {
                    maxProducts: currentPlan.limits.maxProducts?.toString(),
                    maxOrders: currentPlan.limits.maxOrders?.toString(),
                    maxCustomers: currentPlan.limits.maxCustomers?.toString(),
                    maxStaff: currentPlan.limits.maxStaff?.toString(),
                    maxStores: currentPlan.limits.maxStores?.toString(),
                    storageGB: currentPlan.limits.storageGB?.toString()
                }
            });
        }
    }, [currentPlan, reset]);

    const onSubmit = async (data: PlanFormData) => {
        const hasEnabledCycle = data.billingCycles.some(cycle => cycle.isEnabled);
        if (!hasEnabledCycle) {
            toast.error('Please enable at least one billing cycle');
            return;
        }

        // Convert basePrice to smallest unit (multiply by 100)
        const submissionData = {
            ...data,
            basePrice: Number(data.basePrice) * 100
        };

        try {
            let resultAction;
            if (planId) {
                const decodedId = decryptData(decodeURIComponent(planId));
                if (decodedId) {
                    resultAction = await dispatch(updateExistingPlan({ planId: decodedId, planData: submissionData }));
                } else {
                    toast.error('Invalid Plan ID');
                    return;
                }
            } else {
                resultAction = await dispatch(addNewPlan(submissionData));
            }

            if (resultAction && (updateExistingPlan.fulfilled.match(resultAction) || addNewPlan.fulfilled.match(resultAction))) {
                toast.success(planId ? 'Plan updated successfully!' : 'Plan created successfully!');
                navigate('/Plans');
            } else {
                toast.error((resultAction?.payload as string) || 'Failed to process request');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div className="">
            <PageMeta title={`Edit Plan | ${import.meta.env.VITE_PLATFORM_NAME}`} description={`This is ${import.meta.env.VITE_PLATFORM_NAME} Platform`} />
            <ComponentCard
                title="Edit Subscription Plan"
                rightButtonNode={<Button variant="danger" size="xs" onClick={() => navigate(-1)}>Back</Button>}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4">
                    {/* Basic Information */}
                    <ComponentCard title="Basic Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <Label>
                                    Plan Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    {...register('name', { required: 'Plan name is required' })}
                                    placeholder="e.g. Pro Plan"
                                    error={!!errors.name}
                                    hint={errors.name?.message}
                                    maxLength={40}
                                />
                            </div>
                            <div className="col-span-full">
                                <Label>
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <TextArea
                                    {...register('description', { required: 'Description is required' })}
                                    placeholder="Briefly describe what this plan offers..."
                                    error={!!errors.description}
                                    hint={errors.description?.message}
                                    maxLength={250}
                                />
                            </div>
                            <div className="flex items-center gap-8">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            label="Active"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <Controller
                                    name="isFeatured"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            label="Featured Plan"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Pricing */}
                    <ComponentCard title="Pricing & Currency">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Currency</Label>
                                <Controller
                                    name="currency"
                                    control={control}
                                    rules={{ required: 'Currency is required' }}
                                    render={({ field }) => (
                                        <Select
                                            options={CURRENCY_OPTIONS}
                                            placeholder="Select Currency"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!errors.currency}
                                        />
                                    )}
                                />
                                {errors.currency && (
                                    <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Base Price <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    {...register('basePrice', {
                                        required: 'Base Price is required',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'Min value 0' }
                                    })}
                                    placeholder="0"
                                    error={!!errors.basePrice}
                                    hint={errors.basePrice?.message}
                                />
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Billing Cycles */}
                    <ComponentCard title="Billing Cycles">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {watch('billingCycles').map((cycle, index) => {
                                const basePriceValue = parseFloat(watch('basePrice') as string) || 0;
                                const discountValue = parseFloat(watch(`billingCycles.${index}.discountPercent`) as string) || 0;
                                const finalPrice = (basePriceValue * cycle.durationMonths) * (1 - discountValue / 100);
                                const currentCurrency = watch('currency') || 'INR';

                                return (
                                    <div key={cycle.tenure} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{cycle.label}</h4>
                                            <Controller
                                                name={`billingCycles.${index}.isEnabled`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs uppercase text-gray-500">Discount (%)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    disabled={!watch(`billingCycles.${index}.isEnabled`)}
                                                    {...register(`billingCycles.${index}.discountPercent`, {
                                                        valueAsNumber: true,
                                                        min: { value: 0, message: 'Min 0' },
                                                        max: { value: 100, message: 'Max 100' }
                                                    })}
                                                    onInput={(e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        if (parseFloat(target.value) > 100) {
                                                            target.value = "100";
                                                        }
                                                    }}
                                                    error={!!errors.billingCycles?.[index]?.discountPercent}
                                                    hint={errors.billingCycles?.[index]?.discountPercent?.message}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500">
                                                    Duration: {cycle.durationMonths} Month{cycle.durationMonths > 1 ? 's' : ''}
                                                </span>
                                                {watch(`billingCycles.${index}.isEnabled`) && basePriceValue > 0 && (
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                        {currentCurrency} {finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.billingCycles && !watch('billingCycles').some(c => c.isEnabled) && (
                            <p className="mt-4 text-sm text-red-500 text-center">Please enable at least one billing cycle before submitting.</p>
                        )}
                    </ComponentCard>

                    {/* Trial & Discounts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ComponentCard title="Trial Settings">
                            <div className="space-y-4">
                                <Controller
                                    name="trial.enabled"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            label="Enable Trial"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {trialEnabled && (
                                    <div>
                                        <Label>Trial Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...register('trial.durationDays', {
                                                valueAsNumber: true,
                                                min: { value: 1, message: 'Min 1' }
                                            })}
                                            error={!!errors.trial?.durationDays}
                                            hint={errors.trial?.durationDays?.message}
                                        />
                                    </div>
                                )}
                            </div>
                        </ComponentCard>
                    </div>

                    <ComponentCard title="Usage Limits">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <Label className="block text-xs mb-1">Max Products</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register('limits.maxProducts', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Min 1' }
                                    })}
                                    error={!!errors.limits?.maxProducts}
                                    hint={errors.limits?.maxProducts?.message}
                                />
                            </div>
                            <div>
                                <Label className="block text-xs mb-1">Max Orders</Label>
                                <Input
                                    type="number"
                                    min="-1"
                                    {...register('limits.maxOrders', {
                                        valueAsNumber: true,
                                        min: { value: -1, message: 'Min -1' }
                                    })}
                                    error={!!errors.limits?.maxOrders}
                                    hint={errors.limits?.maxOrders?.message}
                                />
                            </div>
                            <div>
                                <Label className="block text-xs mb-1">Max Customers</Label>
                                <Input
                                    type="number"
                                    min="-1"
                                    {...register('limits.maxCustomers', {
                                        valueAsNumber: true,
                                        min: { value: -1, message: 'Min -1' }
                                    })}
                                    error={!!errors.limits?.maxCustomers}
                                    hint={errors.limits?.maxCustomers?.message}
                                />
                            </div>
                            <div>
                                <Label className="block text-xs mb-1">Max Staff</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register('limits.maxStaff', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Min 1' }
                                    })}
                                    error={!!errors.limits?.maxStaff}
                                    hint={errors.limits?.maxStaff?.message}
                                />
                            </div>
                            <div>
                                <Label className="block text-xs mb-1">Max Stores</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register('limits.maxStores', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Min 1' }
                                    })}
                                    error={!!errors.limits?.maxStores}
                                    hint={errors.limits?.maxStores?.message}
                                />
                            </div>
                            <div>
                                <Label className="block text-xs mb-1">Storage (GB)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register('limits.storageGB', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Min 1' }
                                    })}
                                    error={!!errors.limits?.storageGB}
                                    hint={errors.limits?.storageGB?.message}
                                />
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Features */}
                    <ComponentCard
                        title="Plan Features"
                        rightButtonNode={
                            <div className="flex items-center gap-3 pr-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Select All</span>
                                <Checkbox
                                    checked={allFeaturesSelected}
                                    onChange={toggleAllFeatures}
                                />
                            </div>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Controller
                                name="features.analyticsEnabled"
                                control={control}
                                render={({ field }) => <Checkbox label="Analytics Enabled" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.customDomain"
                                control={control}
                                render={({ field }) => <Checkbox label="Custom Domain" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.apiAccess"
                                control={control}
                                render={({ field }) => <Checkbox label="API Access" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.prioritySupport"
                                control={control}
                                render={({ field }) => <Checkbox label="Priority Support" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.exportData"
                                control={control}
                                render={({ field }) => <Checkbox label="Export Data" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.whitelabel"
                                control={control}
                                render={({ field }) => <Checkbox label="Whitelabeling" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.customThemes"
                                control={control}
                                render={({ field }) => <Checkbox label="Custom Themes" checked={field.value} onChange={field.onChange} />}
                            />
                            <Controller
                                name="features.smsNotifications"
                                control={control}
                                render={({ field }) => <Checkbox label="SMS Notifications" checked={field.value} onChange={field.onChange} />}
                            />
                        </div>
                    </ComponentCard>

                    <div className="flex justify-end gap-4 pb-4">
                        <Button variant="outline" type="button" onClick={() => navigate('/Plans')}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={submitting || loading}>
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                planId ? 'Update Plan' : 'Create Plan'
                            )}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default EditPlans;
