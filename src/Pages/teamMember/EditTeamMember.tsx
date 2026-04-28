import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

import type { AppDispatch, RootState } from '../../store';
import { updateTeamMember, fetchTeamMemberById, clearCurrentTeamMember } from './services/teamMemberSlice';
import { decryptData } from '@/utility/crypto';

import ComponentCard from '../../components/common/ComponentCard';
import Input from '../../components/form/input/InputField';
import Button from '../../components/UI/button/Button';
import { Label } from '@/components/layout/label';
import PageMeta from '@/components/common/PageMeta';
import Checkbox from '../../components/form/input/Checkbox';

interface PermissionSet {
    list: boolean;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

interface TeamMemberFormData {
    name: string;
    email: string;
    phone: string;
    designation: string;
    permissions: {
        clients: PermissionSet;
        invoices: PermissionSet;
        coupons: PermissionSet;
    };
}

const DEFAULT_PERMISSIONS: PermissionSet = {
    list: false,
    view: false,
    create: false,
    edit: false,
    delete: false
};

const EditTeamMember: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [decryptedId, setDecryptedId] = useState<string>('');
    const { currentTeamMember, submitting, fetchingCurrent } = useSelector((state: RootState) => state.teamMember);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TeamMemberFormData>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            designation: '',
            permissions: {
                clients: { ...DEFAULT_PERMISSIONS },
                invoices: { ...DEFAULT_PERMISSIONS },
                coupons: { ...DEFAULT_PERMISSIONS }
            }
        }
    });

    useEffect(() => {
        if (id) {
            try {
                const decId = decryptData(decodeURIComponent(id));
                if (decId) {
                    setDecryptedId(decId);
                    dispatch(fetchTeamMemberById(decId));
                } else {
                    toast.error("Invalid team member ID");
                    navigate('/TeamMembers');
                }
            } catch (error) {
                toast.error("Error decrypting ID");
                navigate('/TeamMembers');
            }
        }

        return () => {
            dispatch(clearCurrentTeamMember());
        };
    }, [id, dispatch, navigate]);

    useEffect(() => {
        if (currentTeamMember) {
            reset({
                name: currentTeamMember.name,
                email: currentTeamMember.email,
                phone: currentTeamMember.phone,
                designation: currentTeamMember.designation,
                permissions: currentTeamMember.permissions || {
                    clients: { ...DEFAULT_PERMISSIONS },
                    invoices: { ...DEFAULT_PERMISSIONS },
                    coupons: { ...DEFAULT_PERMISSIONS }
                }
            });
        }
    }, [currentTeamMember, reset]);

    const onSubmit = async (data: TeamMemberFormData) => {
        try {
            const resultAction = await dispatch(updateTeamMember({ id: decryptedId, teamMemberData: data }));
            if (updateTeamMember.fulfilled.match(resultAction)) {
                navigate('/TeamMembers');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const renderPermissionRow = (module: keyof TeamMemberFormData['permissions'], label: string) => (
        <div className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 dark:border-gray-800 items-center text-center">
            <div className="col-span-1 font-medium text-gray-700 dark:text-gray-300 text-left">{label}</div>
            {(['list', 'view', 'create', 'edit', 'delete'] as const).map((perm) => (
                <div key={perm} className="flex justify-center">
                    <Controller
                        name={`permissions.${module}.${perm}`}
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onChange={(checked) => field.onChange(checked)}
                            />
                        )}
                    />
                </div>
            ))}
        </div>
    );

    if (fetchingCurrent) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="">
            <PageMeta 
                title="Edit Team Member | VyaparSetu" 
                description="Edit existing team member details and permissions"
            />

            <ComponentCard
                title="Edit Team Member"
                rightButtonNode={
                    <Button variant="danger" size="xs" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('name', { required: 'Name is required' })}
                                placeholder="Enter full name"
                                error={!!errors.name}
                                hint={errors.name?.message}
                            />
                        </div>
                        <div>
                            <Label>Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                type="email"
                                {...register('email')}
                                readOnly
                                className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-70"
                                hint="Email cannot be changed"
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
                        <div>
                            <Label>Designation <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('designation', { required: 'Designation is required' })}
                                placeholder="e.g. Customer Support"
                                error={!!errors.designation}
                                hint={errors.designation?.message}
                            />
                        </div>
                    </div>

                    <ComponentCard title="Permissions">
                        <div className="mt-4">
                            <div className="grid grid-cols-6 gap-4 pb-2 border-b-2 border-gray-100 dark:border-gray-800 font-bold text-xs uppercase tracking-wider text-gray-500">
                                <div className="col-span-1 text-left">Module</div>
                                <div className="text-center">List</div>
                                <div className="text-center">View</div>
                                <div className="text-center">Create</div>
                                <div className="text-center">Edit</div>
                                <div className="text-center">Delete</div>
                            </div>
                            {renderPermissionRow('clients', 'Clients')}
                            {renderPermissionRow('invoices', 'Invoices')}
                            {renderPermissionRow('coupons', 'Coupons')}
                        </div>
                    </ComponentCard>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Button variant="outline" type="button" onClick={() => navigate('/TeamMembers')}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Team Member'
                            )}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default EditTeamMember;
