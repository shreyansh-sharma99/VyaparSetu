import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Loader2, Plus, Trash2, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../store";
import { createRole } from "./services/rolesSlice";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import PageMeta from "@/components/common/PageMeta";

// Available modules derived from App.tsx routes (slug = route path)
const AVAILABLE_MODULES = [
    { module: "Dashboard", slug: "/" },
    { module: "Plans", slug: "/Plans" },
    { module: "Client", slug: "/Admin" },
    { module: "Client Management", slug: "/AdminManagement" },
    { module: "Subscriptions", slug: "/Subscriptions" },
    { module: "Settings", slug: "/settings" },
    { module: "Team Members", slug: "/TeamMembers" },
    { module: "Admin Report", slug: "/reports/admin" },
    { module: "Revenue Report", slug: "/reports/revenue" },
    { module: "Subscription Report", slug: "/reports/subscriptions" },
    { module: "Invoice Report", slug: "/reports/invoices" },
    { module: "Razorpay Payments", slug: "/reports/razorpay-payments" },
    { module: "Razorpay Settlements", slug: "/reports/razorpay-settlements" },
    { module: "Invoices", slug: "/Invoices" },
    { module: "Roles & Permissions", slug: "/roles" },
];

interface PermissionRow {
    module: string;
    slug: string;
    canRead: boolean;
    canWrite: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

interface CreateRoleFormData {
    roleName: string;
    description: string;
    permissions: PermissionRow[];
}

const PermissionCheckbox = ({
    label,
    checked,
    onChange,
    color = "blue",
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color?: string;
}) => {
    const colorMap: Record<string, string> = {
        blue: "checked:bg-blue-600 checked:border-blue-600",
        green: "checked:bg-emerald-600 checked:border-emerald-600",
        amber: "checked:bg-amber-500 checked:border-amber-500",
        purple: "checked:bg-purple-600 checked:border-purple-600",
        red: "checked:bg-red-600 checked:border-red-600",
    };

    return (
        <label className="flex flex-col items-center gap-1 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={`w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 transition-all ${colorMap[color] || colorMap.blue} outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 cursor-pointer`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {label}
            </span>
        </label>
    );
};

const CreateRolesAndPermission: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { submitting } = useSelector((state: RootState) => state.roles);
    const [showModuleSelector, setShowModuleSelector] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<CreateRoleFormData>({
        defaultValues: {
            roleName: "",
            description: "",
            permissions: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "permissions",
    });

    const watchedPermissions = watch("permissions");
    const addedSlugs = watchedPermissions.map((p) => p.slug);

    const moduleSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                moduleSelectorRef.current &&
                !moduleSelectorRef.current.contains(event.target as Node)
            ) {
                setShowModuleSelector(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAddModule = (mod: { module: string; slug: string }) => {
        if (addedSlugs.includes(mod.slug)) {
            toast.warn(`"${mod.module}" is already added.`);
            return;
        }
        append({
            module: mod.module,
            slug: mod.slug,
            canRead: false,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
        });
    };


    const onSubmit = async (data: CreateRoleFormData) => {
        if (data.permissions.length === 0) {
            toast.error("Please add at least one module permission.");
            return;
        }
        // Map permissions: include slug in the payload, don't show it in UI
        const payload = {
            roleName: data.roleName,
            description: data.description,
            permissions: data.permissions.map((p) => ({
                module: p.module,
                slug: p.slug,
                canRead: p.canRead,
                canWrite: p.canWrite,
                canUpdate: p.canUpdate,
                canDelete: p.canDelete,
            })),
        };

        const resultAction = await dispatch(createRole(payload));
        if (createRole.fulfilled.match(resultAction)) {
            navigate("/roles");
        }
    };

    return (
        <div className="space-y-6">
            <PageMeta
                title="Create Role | VyaparSetu"
                description="Create a new role with custom permissions"
            />

            <ComponentCard
                title="Create New Role"
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
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.03] dark:to-white/[0.01] border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <ShieldCheck size={16} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Module Permissions
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {fields.length} module{fields.length !== 1 ? "s" : ""} added
                                    </p>
                                </div>
                            </div>

                            {/* Add Module Button */}
                            <div className="relative" ref={moduleSelectorRef}>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="xs"
                                    onClick={() => setShowModuleSelector((p) => !p)}
                                >
                                    <Plus size={14} className="mr-1" />
                                    Add Module
                                    {showModuleSelector ? (
                                        <ChevronUp size={12} className="ml-1" />
                                    ) : (
                                        <ChevronDown size={12} className="ml-1" />
                                    )}
                                </Button>

                                {showModuleSelector && (
                                    <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Select Module
                                            </p>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto">
                                            {AVAILABLE_MODULES.map((mod) => {
                                                const isAdded = addedSlugs.includes(mod.slug);
                                                return (
                                                    <button
                                                        key={mod.slug}
                                                        type="button"
                                                        onClick={() => handleAddModule(mod)}
                                                        disabled={isAdded}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${isAdded
                                                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                                                                : "text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary cursor-pointer"
                                                            }`}
                                                    >
                                                        <span>{mod.module}</span>
                                                        {isAdded && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-green-500 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                                                                Added
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column Headers */}
                        {fields.length > 0 && (
                            <div className="grid grid-cols-[1fr_repeat(4,_80px)_44px] gap-0 px-5 py-3 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Module
                                </div>
                                {["Read", "Write", "Update", "Delete"].map((h) => (
                                    <div
                                        key={h}
                                        className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center"
                                    >
                                        {h}
                                    </div>
                                ))}
                                <div />
                            </div>
                        )}

                        {/* Permission Rows */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {fields.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                                        <ShieldCheck size={24} className="text-primary/60" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        No modules added yet
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Click "Add Module" to assign permissions to this role
                                    </p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid grid-cols-[1fr_repeat(4,_80px)_44px] gap-0 px-5 py-3.5 items-center hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                                    >
                                        {/* Module Name */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary/50 shrink-0" />
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {field.module}
                                            </span>
                                        </div>

                                        {/* Read */}
                                        <div className="flex justify-center">
                                            <Controller
                                                name={`permissions.${index}.canRead`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <PermissionCheckbox
                                                        label="Read"
                                                        checked={f.value}
                                                        onChange={f.onChange}
                                                        color="blue"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Write */}
                                        <div className="flex justify-center">
                                            <Controller
                                                name={`permissions.${index}.canWrite`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <PermissionCheckbox
                                                        label="Write"
                                                        checked={f.value}
                                                        onChange={f.onChange}
                                                        color="green"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Update */}
                                        <div className="flex justify-center">
                                            <Controller
                                                name={`permissions.${index}.canUpdate`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <PermissionCheckbox
                                                        label="Update"
                                                        checked={f.value}
                                                        onChange={f.onChange}
                                                        color="amber"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Delete */}
                                        <div className="flex justify-center">
                                            <Controller
                                                name={`permissions.${index}.canDelete`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <PermissionCheckbox
                                                        label="Delete"
                                                        checked={f.value}
                                                        onChange={f.onChange}
                                                        color="red"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Remove */}
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Remove module"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                    Creating...
                                </>
                            ) : (
                                "Create Role"
                            )}
                        </Button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default CreateRolesAndPermission;
