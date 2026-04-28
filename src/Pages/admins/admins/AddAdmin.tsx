import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import type { AppDispatch, RootState } from '../../../store';
import { createAdmin } from './services/adminSlice';

import ComponentCard from '../../../components/common/ComponentCard';
import Input from '../../../components/form/input/InputField';
import TextArea from '../../../components/form/input/TextArea';
import Select from '../../../components/form/Select';
import Button from '../../../components/UI/button/Button';
import { Label } from '@/components/layout/label';
import PageMeta from '@/components/common/PageMeta';
import { Loader2 } from 'lucide-react';

interface AdminFormData {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    businessType: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
    };
    notes: string;
}

const BUSINESS_TYPE_OPTIONS = [
    { label: "E-Commerce", value: "E-Commerce" },
    { label: "Retail", value: "Retail" },
    { label: "Service", value: "Service" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Others", value: "Others" }
];


const AddAdmin: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { submitting } = useSelector((state: RootState) => state.admin);

    const { register, handleSubmit, control, formState: { errors } } = useForm<AdminFormData>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            businessName: '',
            businessType: 'E-Commerce',
            address: {
                street: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India'
            },
            notes: ''
        }
    });

    const onSubmit = async (data: AdminFormData) => {
        try {
            const resultAction = await dispatch(createAdmin(data));
            if (createAdmin.fulfilled.match(resultAction)) {
                toast.success('Admin created successfully!');
                navigate(-1);
            } else {
                toast.error(resultAction.payload as string || 'Failed to create admin');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div className="">
            <PageMeta title={`Add Admin | ${import.meta.env.VITE_PLATFORM_NAME}`} description="Create a new business administrator" />

            <ComponentCard
                title="Add New Admin"
                rightButtonNode={
                    <Button variant="danger" size="xs" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <ComponentCard title="Personal Information">
                            <div className="space-y-4">
                                <div>
                                    <Label>Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        {...register('name', { required: 'Name is required' })}
                                        placeholder="Enter full name"
                                        error={!!errors.name}
                                        hint={errors.name?.message}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                            placeholder="email@example.com"
                                            error={!!errors.email}
                                            hint={errors.email?.message}
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            {...register('phone', {
                                                required: 'Phone number is required',
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: "Invalid phone number (10 digits)"
                                                }
                                            })}
                                            placeholder="9876543210"
                                            error={!!errors.phone}
                                            hint={errors.phone?.message}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>

                        {/* Business Information */}
                        <ComponentCard title="Business Information">
                            <div className="space-y-4">
                                <div>
                                    <Label>Business Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        {...register('businessName', { required: 'Business name is required' })}
                                        placeholder="e.g. Acme Corp"
                                        error={!!errors.businessName}
                                        hint={errors.businessName?.message}
                                    />
                                </div>
                                <div>
                                    <Label>Business Type <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="businessType"
                                        control={control}
                                        rules={{ required: 'Business type is required' }}
                                        render={({ field }) => (
                                            <Select
                                                options={BUSINESS_TYPE_OPTIONS}
                                                placeholder="Select Type"
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={!!errors.businessType}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </ComponentCard>
                    </div>

                    {/* Address Information */}
                    <ComponentCard title="Address Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="md:col-span-2 lg:col-span-1">
                                <Label>Street Address <span className="text-red-500">*</span></Label>
                                <Input
                                    {...register('address.street', { required: 'Street is required' })}
                                    placeholder="123 Main St"
                                    error={!!errors.address?.street}
                                    hint={errors.address?.street?.message}
                                />
                            </div>
                            <div>
                                <Label>City <span className="text-red-500">*</span></Label>
                                <Input
                                    {...register('address.city', { required: 'City is required' })}
                                    placeholder="Mumbai"
                                    error={!!errors.address?.city}
                                    hint={errors.address?.city?.message}
                                />
                            </div>
                            <div>
                                <Label>State <span className="text-red-500">*</span></Label>
                                <Input
                                    {...register('address.state', { required: 'State is required' })}
                                    placeholder="Maharashtra"
                                    error={!!errors.address?.state}
                                    hint={errors.address?.state?.message}
                                />
                            </div>
                            <div>
                                <Label>Pincode <span className="text-red-500">*</span></Label>
                                <Input
                                    {...register('address.pincode', {
                                        required: 'Pincode is required',
                                        pattern: { value: /^[0-9]{6}$/, message: "Invalid pincode" }
                                    })}
                                    placeholder="400001"
                                    error={!!errors.address?.pincode}
                                    hint={errors.address?.pincode?.message}
                                />
                            </div>
                            <div>
                                <Label>Country <span className="text-red-500">*</span></Label>
                                <Input
                                    {...register('address.country', { required: 'Country is required' })}
                                    placeholder="India"
                                    error={!!errors.address?.country}
                                    hint={errors.address?.country?.message}
                                />
                            </div>
                        </div>
                    </ComponentCard>

                    <div className="grid grid-cols-1 gap-6">
                        <ComponentCard title="Additional Notes">
                            <Label>Notes</Label>
                            <TextArea
                                {...register('notes')}
                                placeholder="Add any internal remarks or notes..."
                                rows={4}
                            />
                        </ComponentCard>
                    </div>

                    <div className="flex justify-end gap-3 pt-4  border-gray-200 dark:border-gray-800">
                        <Button variant="outline" type="button" onClick={() => navigate('/Admin')}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Admin Account'
                            )}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default AddAdmin;
