import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Loader2, Eye, EyeOff, User, MapPin,
  CreditCard, ShieldCheck,
} from "lucide-react";
import Select from "@/components/form/Select";

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

  const roleOptions = (roles || []).map((r: any) => ({
    value: r._id,
    label: r.roleName,
    element: (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{r.roleName}</span>
        {r.description && <span className="text-[11px] text-gray-400">{r.description}</span>}
      </div>
    )
  }));
  const managerOptions = (managers || []).map((m: any) => ({
    value: m._id,
    label: m.name,
    element: (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{m.name}</span>
        <span className="text-[11px] text-gray-400">{m.email}{m.userType === "owner" ? " · Owner" : ""}</span>
      </div>
    )
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

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={ShieldCheck} title="Role & Reporting" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Role <span className="text-red-500">*</span></Label>
                <Select
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
                <Select
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
