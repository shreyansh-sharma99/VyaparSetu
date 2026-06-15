import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Loader2, Eye, EyeOff, User, MapPin,
  CreditCard, ChevronDown, ShieldCheck,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store";
import { createTeamMember, fetchManagers } from "./services/teamMemberSlice";
import { fetchRoles } from "../RolesAndPermission/services/rolesSlice";

import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import PageMeta from "@/components/common/PageMeta";

interface AddTeamMemberForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  roleId: string;
  reportingManager: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
}

// Reusable styled select dropdown
const StyledSelect = ({
  value,
  onChange,
  options,
  placeholder,
  loading,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; sub?: string }[];
  placeholder: string;
  loading?: boolean;
  error?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between h-11 px-4 rounded-xl border text-sm transition-all bg-white dark:bg-gray-900 ${error
          ? "border-red-400 dark:border-red-500"
          : "border-gray-200 dark:border-gray-700 hover:border-primary/50 focus:border-primary"
          } ${open ? "border-primary ring-2 ring-primary/20" : ""}`}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </span>
        ) : selected ? (
          <span className="text-gray-800 dark:text-gray-100 font-medium truncate">{selected.label}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex flex-col gap-0.5 ${opt.value === value
                ? "bg-primary/10 text-primary font-semibold"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <span>{opt.label}</span>
              {opt.sub && <span className="text-[11px] text-gray-400">{opt.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
    <div className="p-1.5 rounded-lg bg-primary/10">
      <Icon size={15} className="text-primary" />
    </div>
    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">{title}</h3>
  </div>
);

const AddTeamMember: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [reportingManager, setReportingManager] = useState("");

  const { submitting, managers, loadingManagers } = useSelector((state: RootState) => state.teamMember);
  const { roles, loading: loadingRoles } = useSelector((state: RootState) => state.roles);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AddTeamMemberForm>({
    defaultValues: {
      name: "", email: "", password: "", confirmPassword: "", phone: "",
      address: { street: "", city: "", state: "", zipCode: "", country: "India" },
      bankDetails: { accountHolderName: "", accountNumber: "", bankName: "", ifscCode: "", branchName: "" },
    },
  });

  useEffect(() => {
    dispatch(fetchManagers());
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  const roleOptions = (roles || []).map((r: any) => ({ value: r._id, label: r.roleName, sub: r.description }));
  const managerOptions = (managers || []).map((m: any) => ({
    value: m._id,
    label: m.name,
    sub: m.email + (m.userType === "owner" ? " · Owner" : ""),
  }));

  const onSubmit = async (data: AddTeamMemberForm) => {
    if (!roleId) { toast.error("Please select a role"); return; }
    const payload: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      roleId,
      address: data.address,
      bankDetails: data.bankDetails,
    };
    if (reportingManager) payload.reportingManager = reportingManager;

    const result = await dispatch(createTeamMember(payload));
    if (createTeamMember.fulfilled.match(result)) navigate("/TeamMembers");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Add Team Member | VyaparSetu" description="Add a new team member" />
      <ComponentCard
        title="Add New Team Member"
        rightButtonNode={
          <Button variant="danger" size="xs" onClick={() => navigate(-1)}>Back</Button>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4" autoComplete="off">

          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={User} title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input {...register("name", { required: "Name is required" })}
                  placeholder="e.g. John Doe" error={!!errors.name} hint={errors.name?.message} />
              </div>
              <div>
                <Label>Email Address <span className="text-red-500">*</span></Label>
                <Input type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                  })}
                  placeholder="john@example.com" autoComplete="off"
                  error={!!errors.email} hint={errors.email?.message} />
              </div>
              <div>
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <Input {...register("phone", {
                  required: "Phone is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Enter valid 10-digit number" },
                })}
                  placeholder="9876543210" error={!!errors.phone} hint={errors.phone?.message} />
              </div>
              <div>
                <Label>Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"}
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                    placeholder="Enter password" autoComplete="new-password"
                    error={!!errors.password} hint={errors.password?.message} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                      validate: (val) => val === watch("password") || "Passwords do not match",
                    })}
                    placeholder="Confirm password" autoComplete="new-password"
                    error={!!errors.confirmPassword} hint={errors.confirmPassword?.message} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Manager */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={ShieldCheck} title="Role & Reporting" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Role <span className="text-red-500">*</span></Label>
                <StyledSelect
                  value={roleId}
                  onChange={setRoleId}
                  options={roleOptions}
                  placeholder="Select a role"
                  loading={loadingRoles}
                  error={!roleId}
                />
              </div>
              <div>
                <Label>Reporting Manager</Label>
                <StyledSelect
                  value={reportingManager}
                  onChange={setReportingManager}
                  options={managerOptions}
                  placeholder="Select reporting manager (optional)"
                  loading={loadingManagers}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={MapPin} title="Address" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label>Street</Label>
                <Input {...register("address.street")} placeholder="123 Tech Lane" />
              </div>
              <div>
                <Label>City</Label>
                <Input {...register("address.city")} placeholder="Mumbai" />
              </div>
              <div>
                <Label>State</Label>
                <Input {...register("address.state")} placeholder="Maharashtra" />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input {...register("address.zipCode")} placeholder="400001" />
              </div>
              <div>
                <Label>Country</Label>
                <Input {...register("address.country")} placeholder="India" />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={CreditCard} title="Bank Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Account Holder Name</Label>
                <Input {...register("bankDetails.accountHolderName")} placeholder="John Doe" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input {...register("bankDetails.accountNumber")} placeholder="1234567890" />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input {...register("bankDetails.bankName")} placeholder="HDFC Bank" />
              </div>
              <div>
                <Label>IFSC Code</Label>
                <Input {...register("bankDetails.ifscCode")} placeholder="HDFC0001234" />
              </div>
              <div>
                <Label>Branch Name</Label>
                <Input {...register("bankDetails.branchName")} placeholder="Andheri West" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => navigate("/TeamMembers")}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Team Member"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddTeamMember;
