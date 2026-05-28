import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Loader2, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../store";
import { fetchRoleById, updateRole, clearCurrentRole } from "./services/rolesSlice";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import PageMeta from "@/components/common/PageMeta";
import Loader from "../../components/UI/Loader";

// Available modules mapped from Sidebar/App routes
const MODULE_HIERARCHY = [
    { module: "Dashboard", slug: "/" },
    {
        module: "Client",
        slug: "#client",
        subModules: [
            { module: "Client", slug: "/Admin" },
            { module: "Client Management", slug: "/AdminManagement" },
        ]
    },
    {
        module: "Team Members",
        slug: "#team",
        subModules: [
            { module: "Members", slug: "/TeamMembers" },
            { module: "Org Hierarchy", slug: "/TeamMembers/hierarchy" },
        ]
    },
    { module: "Plans", slug: "/Plans" },
    { module: "Subscriptions", slug: "/Subscriptions" },
    { module: "Invoices", slug: "/Invoices" },
    {
        module: "Cash Management",
        slug: "#cash",
        subModules: [
            { module: "Wallet", slug: "/Cash/wallet" },
            { module: "Ledger", slug: "/Cash/ledger" },
        ]
    },
    {
        module: "Reports",
        slug: "#reports",
        subModules: [
            { module: "Admin Report", slug: "/reports/admin" },
            { module: "Revenue Report", slug: "/reports/revenue" },
            { module: "Subscription Report", slug: "/reports/subscriptions" },
            { module: "Invoice Report", slug: "/reports/invoices" },
            { module: "Razorpay Payments", slug: "/reports/razorpay-payments" },
            { module: "Razorpay Settlements", slug: "/reports/razorpay-settlements" },
        ]
    },
    // {
    //     module: "Master",
    //     slug: "#master",
    //     subModules: [
    //         { module: "Settings", slug: "/settings" },
    //         { module: "Designations", slug: "/designations" },
    //         { module: "Roles & Permissions", slug: "/roles" },
    //     ]
    // }
];

interface PermissionRow {
    module: string;
    slug: string;
    canRead: boolean;
    canWrite: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    isGroup?: boolean;
    parentSlug?: string;
}

interface EditRoleFormData {
    roleName: string;
    description: string;
    permissions: Record<string, PermissionRow>;
}

const flattenModules = () => {
    const flat: PermissionRow[] = [];
    MODULE_HIERARCHY.forEach(m => {
        if (m.subModules) {
            flat.push({ module: m.module, slug: m.slug, isGroup: true, canRead: false, canWrite: false, canUpdate: false, canDelete: false });
            m.subModules.forEach(sm => {
                flat.push({ module: sm.module, slug: sm.slug, parentSlug: m.slug, isGroup: false, canRead: false, canWrite: false, canUpdate: false, canDelete: false });
            });
        } else {
            flat.push({ module: m.module, slug: m.slug, isGroup: false, canRead: false, canWrite: false, canUpdate: false, canDelete: false });
        }
    });
    return flat;
};

const getInitialPermissions = () => {
    const perms: Record<string, PermissionRow> = {};
    flattenModules().forEach(m => {
        perms[m.slug] = m;
    });
    return perms;
};

const PermissionCheckbox = ({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
}) => {
    return (
        <label className="flex items-center justify-center cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 transition-all checked:bg-blue-600 checked:border-blue-600 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 cursor-pointer"
            />
        </label>
    );
};

const PermissionButton = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all border outline-none min-w-[75px] ${checked
                ? "bg-[#0b2b52] text-white border-[#0b2b52] shadow-sm dark:bg-blue-600 dark:border-blue-600"
                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.1]"
                }`}
        >
            can{label}
        </button>
    );
};

const UpdateRoleAndPermission: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentRole: role, fetchingCurrent: loadingRole, submitting } = useSelector(
        (state: RootState) => state.roles
    );
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (slug: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [slug]: !prev[slug],
        }));
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<EditRoleFormData>({
        defaultValues: {
            roleName: "",
            description: "",
            permissions: getInitialPermissions(),
        },
    });

    // Load role data and populate form
    useEffect(() => {
        if (roleId) {
            dispatch(fetchRoleById(roleId));
        }
        return () => {
            dispatch(clearCurrentRole());
        };
    }, [dispatch, roleId]);

    useEffect(() => {
        if (role) {
            const initialPerms = getInitialPermissions();
            const newExpandedGroups: Record<string, boolean> = {};

            role.permissions.forEach((p) => {
                if (initialPerms[p.slug]) {
                    initialPerms[p.slug] = {
                        ...initialPerms[p.slug],
                        canRead: p.canRead,
                        canWrite: p.canWrite,
                        canUpdate: p.canUpdate,
                        canDelete: p.canDelete,
                    };

                    // Auto-expand parent groups if child has any permissions
                    if (initialPerms[p.slug].parentSlug && (p.canRead || p.canWrite || p.canUpdate || p.canDelete)) {
                        newExpandedGroups[initialPerms[p.slug].parentSlug!] = true;
                    }
                }
            });

            setExpandedGroups(newExpandedGroups);

            reset({
                roleName: role.roleName,
                description: role.description,
                permissions: initialPerms,
            });
        }
    }, [role, reset]);

    const permissions = watch("permissions") || getInitialPermissions();
    const flatModulesList = flattenModules();

    // Check if all modules are completely selected (for header checkbox)
    const isAllSelected = Object.values(permissions).every(
        (p) => p.canRead && p.canWrite && p.canUpdate && p.canDelete
    );

    const toggleAll = (checked: boolean) => {
        const updatedPerms = { ...getValues("permissions") };
        Object.keys(updatedPerms).forEach((k) => {
            updatedPerms[k] = {
                ...updatedPerms[k],
                canRead: checked,
                canWrite: checked,
                canUpdate: checked,
                canDelete: checked,
            };
        });
        setValue("permissions", updatedPerms, { shouldDirty: true });
    };

    const toggleRow = (slug: string, currentValue: boolean) => {
        const newValue = !currentValue;
        const updatedPerms = { ...getValues("permissions") };

        // Toggle the row itself
        updatedPerms[slug] = {
            ...updatedPerms[slug],
            canRead: newValue,
            canWrite: newValue,
            canUpdate: newValue,
            canDelete: newValue,
        };

        // If it's a group, toggle all children
        if (updatedPerms[slug].isGroup) {
            Object.keys(updatedPerms).forEach((k) => {
                if (updatedPerms[k].parentSlug === slug) {
                    updatedPerms[k] = {
                        ...updatedPerms[k],
                        canRead: newValue,
                        canWrite: newValue,
                        canUpdate: newValue,
                        canDelete: newValue,
                    };
                }
            });
        }

        // If it's a child and it's being checked, check the parent row completely too
        const parentSlug = updatedPerms[slug].parentSlug;
        if (parentSlug && newValue === true) {
            updatedPerms[parentSlug] = {
                ...updatedPerms[parentSlug],
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
            };
        }

        setValue("permissions", updatedPerms, { shouldDirty: true });
    };

    const togglePermission = (slug: string, field: keyof PermissionRow, value: boolean) => {
        const updatedPerms = { ...getValues("permissions") };

        updatedPerms[slug] = {
            ...updatedPerms[slug],
            [field]: value,
        };

        // If it's a group, toggle this specific permission for all children
        if (updatedPerms[slug].isGroup) {
            Object.keys(updatedPerms).forEach((k) => {
                if (updatedPerms[k].parentSlug === slug) {
                    updatedPerms[k] = {
                        ...updatedPerms[k],
                        [field]: value,
                    };
                }
            });
        }

        // If it's a child and it is being checked (value === true), also check the parent's specific field
        const parentSlug = updatedPerms[slug].parentSlug;
        if (parentSlug && value === true) {
            updatedPerms[parentSlug] = {
                ...updatedPerms[parentSlug],
                [field]: true,
            };
        }

        setValue("permissions", updatedPerms, { shouldDirty: true });
    };

    const onSubmit = async (data: EditRoleFormData) => {
        if (!roleId) return;

        const selectedPermissions = Object.values(data.permissions).filter(
            (p) => p.canRead || p.canWrite || p.canUpdate || p.canDelete
        );

        if (selectedPermissions.length === 0) {
            toast.error("Please select at least one permission.");
            return;
        }

        const payload = {
            roleName: data.roleName,
            description: data.description,
            permissions: selectedPermissions.map((p) => ({
                module: p.module,
                slug: p.slug,
                canRead: p.canRead,
                canWrite: p.canWrite,
                canUpdate: p.canUpdate,
                canDelete: p.canDelete,
            })),
        };

        const resultAction = await dispatch(updateRole({ id: roleId, roleData: payload }));
        if (updateRole.fulfilled.match(resultAction)) {
            navigate("/roles");
        }
    };

    if (loadingRole && !role) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageMeta
                title={`Edit ${role?.roleName || "Role"} | VyaparSetu`}
                description="Edit role and permissions"
            />

            <ComponentCard
                title={`Edit Role: ${role?.roleName || ""}`}
                rightButtonNode={
                    <Button variant="danger" size="xs" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>
                                Role Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("roleName", { required: "Role name is required" })}
                                placeholder="e.g. Accountant, Manager"
                                error={!!errors.roleName}
                                hint={errors.roleName?.message}
                            />
                        </div>
                        <div>
                            <Label>
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("description", { required: "Description is required" })}
                                placeholder="Brief description of this role"
                                error={!!errors.description}
                                hint={errors.description?.message}
                            />
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center px-5 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.03] dark:to-white/[0.01] border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <ShieldCheck size={16} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Select permissions for menus and sub-menus
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Column Headers */}
                        <div className="grid grid-cols-[1fr_60px_repeat(4,_80px)] gap-0 px-5 py-3 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Module
                            </div>
                            <div className="flex justify-center items-center">
                                <PermissionCheckbox
                                    checked={isAllSelected}
                                    onChange={toggleAll}
                                />
                            </div>
                            {["Read", "Write", "Update", "Delete"].map((h) => (
                                <div
                                    key={h}
                                    className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center"
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* Permission Rows */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {flatModulesList.map((m) => {
                                const rowPerms = permissions[m.slug];
                                if (!rowPerms) return null;

                                if (m.parentSlug && !expandedGroups[m.parentSlug]) return null;

                                const isRowFullySelected =
                                    rowPerms.canRead &&
                                    rowPerms.canWrite &&
                                    rowPerms.canUpdate &&
                                    rowPerms.canDelete;

                                return (
                                    <div
                                        key={m.slug}
                                        className={`grid grid-cols-[1fr_60px_repeat(4,_80px)] gap-0 px-5 py-3.5 items-center transition-colors group ${m.isGroup
                                            ? "bg-gray-50/30 dark:bg-white/[0.01]"
                                            : "hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                                            }`}
                                    >
                                        {/* Module Name */}
                                        <div
                                            className={`flex items-center gap-2 ${m.parentSlug ? "pl-6" : ""} ${m.isGroup ? "cursor-pointer select-none" : ""}`}
                                            onClick={() => { if (m.isGroup) toggleGroup(m.slug) }}
                                        >
                                            {!m.parentSlug && !m.isGroup && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                                            )}
                                            {m.isGroup && (
                                                <div className="text-gray-400">
                                                    {expandedGroups[m.slug] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </div>
                                            )}
                                            {m.parentSlug && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                                            )}
                                            <span
                                                className={`text-sm ${m.isGroup ? "font-bold text-gray-900 dark:text-white hover:text-primary transition-colors" : "font-medium text-gray-700 dark:text-gray-200"
                                                    }`}
                                            >
                                                {m.module}
                                            </span>
                                            {m.slug.startsWith("/") && (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded ml-2">
                                                    {m.slug}
                                                </span>
                                            )}
                                        </div>

                                        {/* Select All in Row */}
                                        <div className="flex justify-center">
                                            <PermissionCheckbox
                                                checked={isRowFullySelected}
                                                onChange={() => toggleRow(m.slug, isRowFullySelected)}
                                            />
                                        </div>

                                        {/* Read */}
                                        <div className="flex justify-center">
                                            <PermissionButton
                                                label="Read"
                                                checked={rowPerms.canRead}
                                                onChange={(v) => togglePermission(m.slug, "canRead", v)}
                                            />
                                        </div>

                                        {/* Write */}
                                        <div className="flex justify-center">
                                            <PermissionButton
                                                label="Create"
                                                checked={rowPerms.canWrite}
                                                onChange={(v) => togglePermission(m.slug, "canWrite", v)}
                                            />
                                        </div>

                                        {/* Update */}
                                        <div className="flex justify-center">
                                            <PermissionButton
                                                label="Update"
                                                checked={rowPerms.canUpdate}
                                                onChange={(v) => togglePermission(m.slug, "canUpdate", v)}
                                            />
                                        </div>

                                        {/* Delete */}
                                        <div className="flex justify-center">
                                            <PermissionButton
                                                label="Delete"
                                                checked={rowPerms.canDelete}
                                                onChange={(v) => togglePermission(m.slug, "canDelete", v)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <Button variant="outline" type="button" onClick={() => navigate("/roles")}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Role"
                            )}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default UpdateRoleAndPermission;
