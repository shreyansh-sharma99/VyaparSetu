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
import { addNewPlan, fetchPlanById, updateExistingPlan, fetchPlanFormSchema } from './services/PlanSlice';
import { Info } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';
import { LoaderIcon } from '@/icons/icons';
import Loader from '@/components/UI/Loader';

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
    accessMode: string;
    capabilities: Record<string, any>;
}

const EditPlans: React.FC = () => {
    const navigate = useNavigate();
    const { planId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { submitting, currentPlan, loading, schema } = useSelector((state: RootState) => state.plan);

    React.useEffect(() => {
        dispatch(fetchPlanFormSchema());
    }, [dispatch]);

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<PlanFormData>({
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
            accessMode: 'combo',
            capabilities: {}
        }
    });

    const trialEnabled = watch('trial.enabled');

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
                accessMode: (currentPlan as any).accessMode || 'combo',
                capabilities: (currentPlan as any).capabilities || {}
            });
        }
    }, [currentPlan, reset]);

    const onSubmit = async (data: PlanFormData) => {
        const hasEnabledCycle = data.billingCycles.some(cycle => cycle.isEnabled);
        if (!hasEnabledCycle) {
            toast.error('Please enable at least one billing cycle');
            return;
        }
        const submissionData = {
            ...data,
            basePrice: Number(data.basePrice) * 100,
            trial: {
                ...data.trial,
                durationDays: data.trial.enabled ? Number(data.trial.durationDays) : 0
            },
            billingCycles: data.billingCycles.map(cycle => ({
                ...cycle,
                discountPercent: cycle.isEnabled ? Number(cycle.discountPercent || 0) : 0
            }))
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
            {loading ? <ComponentCard title='Edit Plan'><Loader /></ComponentCard> : (<ComponentCard
                title="Edit Plan"
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

                    {/* Access Mode */}
                    <ComponentCard title="Access Configuration">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>
                                    Access Mode <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="accessMode"
                                    control={control}
                                    rules={{ required: 'Access Mode is required' }}
                                    render={({ field }) => (
                                        <Select
                                            options={schema?.accessModes.map(mode => ({ label: mode, value: mode })) || []}
                                            placeholder="Select Access Mode"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!errors.accessMode}
                                        />
                                    )}
                                />
                                {errors.accessMode && (
                                    <p className="mt-1 text-xs text-red-500">{errors.accessMode.message}</p>
                                )}
                            </div>
                        </div>
                    </ComponentCard>

                    {/* Features & Capabilities */}
                    <ComponentCard title="Plan Capabilities & Features">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...(schema?.featureDefinitions || [])].sort((a, b) => a.sortOrder - b.sortOrder).map((feature) => (
                                <div key={feature.key} className="flex flex-col justify-center">
                                    {feature.type === 'number' ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm font-medium">
                                                    {feature.label}
                                                </Label>
                                                <div className="group relative flex items-center">
                                                    <Info size={16} className="text-blue-500 cursor-help transition-colors hover:text-blue-600" />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-md shadow-xl z-50 text-center leading-relaxed">
                                                        {feature.description}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-white"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Input
                                                type="number"
                                                {...register(`capabilities.${feature.key}`, {
                                                    valueAsNumber: true,
                                                    required: `${feature.label} is required`
                                                })}
                                                placeholder={String(feature.defaultValue)}
                                                error={!!errors.capabilities?.[feature.key]}
                                                hint={errors.capabilities?.[feature.key]?.message as string}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-200">
                                            <Controller
                                                name={`capabilities.${feature.key}`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        label={feature.label}
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                            <div className="group relative flex items-center ml-2">
                                                <Info size={16} className="text-blue-500 cursor-help transition-colors hover:text-blue-600" />
                                                <div className="absolute bottom-full right-[-8px] mb-2 hidden group-hover:block w-56 p-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-md shadow-xl z-50 text-center leading-relaxed">
                                                    {feature.description}
                                                    <div className="absolute top-full right-[10px] border-8 border-transparent border-t-gray-900 dark:border-t-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
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
            </ComponentCard>)}
        </div>
    );
};

export default EditPlans;
