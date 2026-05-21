import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Loader2, User, MapPin, CreditCard, ShieldCheck, ChevronDown,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store";
import { updateTeamMember, fetchTeamMemberById, clearCurrentTeamMember, fetchManagers } from "./services/teamMemberSlice";
import { fetchRoles } from "../RolesAndPermission/services/rolesSlice";
import { decryptData } from "@/utility/crypto";

import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Button from "../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import PageMeta from "@/components/common/PageMeta";

interface EditTeamMemberForm {
  name: string;
  phone: string;
  address: { street: string; city: string; state: string; zipCode: string; country: string };
  bankDetails: { accountHolderName: string; accountNumber: string; bankName: string; ifscCode: string; branchName: string };
}

// Reusable styled select
const StyledSelect = ({
  value,
  onChange,
  options,
  placeholder,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; sub?: string }[];
  placeholder: string;
  loading?: boolean;
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
        className={`w-full flex items-center justify-between h-11 px-4 rounded-xl border text-sm transition-all bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/50 ${open ? "border-primary ring-2 ring-primary/20" : ""}`}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-gray-400"><Loader2 size={14} className="animate-spin" />Loading...</span>
        ) : selected ? (
          <span className="text-gray-800 dark:text-gray-100 font-medium truncate">{selected.label}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
            {placeholder}
          </button>
          {options.map((opt) => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex flex-col gap-0.5 ${opt.value === value ? "bg-primary/10 text-primary font-semibold" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
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
    <div className="p-1.5 rounded-lg bg-primary/10"><Icon size={15} className="text-primary" /></div>
    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">{title}</h3>
  </div>
);

const EditTeamMember: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [decryptedId, setDecryptedId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [reportingManager, setReportingManager] = useState("");

  const { currentTeamMember: member, submitting, fetchingCurrent, managers, loadingManagers } = useSelector(
    (state: RootState) => state.teamMember
  );
  const { roles, loading: loadingRoles } = useSelector((state: RootState) => state.roles);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditTeamMemberForm>({
    defaultValues: {
      name: "", phone: "",
      address: { street: "", city: "", state: "", zipCode: "", country: "India" },
      bankDetails: { accountHolderName: "", accountNumber: "", bankName: "", ifscCode: "", branchName: "" },
    },
  });

  // Decrypt ID and load member
  useEffect(() => {
    if (id) {
      try {
        const decId = decryptData(decodeURIComponent(id));
        if (decId) {
          setDecryptedId(decId);
          dispatch(fetchTeamMemberById(decId));
        } else {
          toast.error("Invalid ID");
          navigate("/TeamMembers");
        }
      } catch {
        toast.error("Error decrypting ID");
        navigate("/TeamMembers");
      }
    }
    dispatch(fetchManagers());
    dispatch(fetchRoles({ page: 1, limit: 100 }));
    return () => { dispatch(clearCurrentTeamMember()); };
  }, [id, dispatch, navigate]);

  // Pre-populate form when member loads
  useEffect(() => {
    if (member) {
      reset({
        name: member.name || "",
        phone: member.phone || "",
        address: {
          street: member.address?.street || "",
          city: member.address?.city || "",
          state: member.address?.state || "",
          zipCode: member.address?.zipCode || "",
          country: member.address?.country || "India",
        },
        bankDetails: {
          accountHolderName: member.bankDetails?.accountHolderName || "",
          accountNumber: member.bankDetails?.accountNumber || "",
          bankName: member.bankDetails?.bankName || "",
          ifscCode: member.bankDetails?.ifscCode || "",
          branchName: member.bankDetails?.branchName || "",
        },
      });
      setRoleId(member.role?._id || "");
      setReportingManager(member.reportingManager?._id || "");
    }
  }, [member, reset]);

  const roleOptions = (roles || []).map((r: any) => ({ value: r._id, label: r.roleName, sub: r.description }));
  const managerOptions = (managers || [])
    .filter((m: any) => m._id !== decryptedId) // can't report to self
    .map((m: any) => ({
      value: m._id,
      label: m.name,
      sub: m.email + (m.userType === "owner" ? " · Owner" : ""),
    }));

  const onSubmit = async (data: EditTeamMemberForm) => {
    const payload: any = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      bankDetails: data.bankDetails,
    };
    if (roleId) payload.roleId = roleId;
    if (reportingManager) payload.reportingManager = reportingManager;

    const result = await dispatch(updateTeamMember({ id: decryptedId, teamMemberData: payload }));
    if (updateTeamMember.fulfilled.match(result)) navigate("/TeamMembers");
  };

  if (fetchingCurrent) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title="Edit Team Member | VyaparSetu" description="Edit team member details" />
      <ComponentCard
        title={`Edit: ${member?.name || "Team Member"}`}
        rightButtonNode={<Button variant="danger" size="xs" onClick={() => navigate(-1)}>Back</Button>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4" autoComplete="off">

          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={User} title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Full Name <span className="text-red-500">*</span></Label>
                <Input {...register("name", { required: "Name is required" })}
                  placeholder="Enter full name" error={!!errors.name} hint={errors.name?.message} />
              </div>
              <div>
                <Label>Email Address</Label>
                <input
                  type="email"
                  value={member?.email || ""}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
              </div>
              <div>
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <Input {...register("phone", {
                  required: "Phone is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Enter valid 10-digit number" },
                })}
                  placeholder="9876543210" error={!!errors.phone} hint={errors.phone?.message} />
              </div>
            </div>
          </div>

          {/* Role & Manager */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={ShieldCheck} title="Role & Reporting" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Role</Label>
                <StyledSelect value={roleId} onChange={setRoleId} options={roleOptions}
                  placeholder="Select a role" loading={loadingRoles} />
              </div>
              <div>
                <Label>Reporting Manager</Label>
                <StyledSelect value={reportingManager} onChange={setReportingManager}
                  options={managerOptions} placeholder="Select manager (optional)" loading={loadingManagers} />
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
              <div><Label>City</Label><Input {...register("address.city")} placeholder="Mumbai" /></div>
              <div><Label>State</Label><Input {...register("address.state")} placeholder="Maharashtra" /></div>
              <div><Label>ZIP Code</Label><Input {...register("address.zipCode")} placeholder="400001" /></div>
              <div><Label>Country</Label><Input {...register("address.country")} placeholder="India" /></div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <SectionHeader icon={CreditCard} title="Bank Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><Label>Account Holder Name</Label><Input {...register("bankDetails.accountHolderName")} placeholder="John Doe" /></div>
              <div><Label>Account Number</Label><Input {...register("bankDetails.accountNumber")} placeholder="1234567890" /></div>
              <div><Label>Bank Name</Label><Input {...register("bankDetails.bankName")} placeholder="HDFC Bank" /></div>
              <div><Label>IFSC Code</Label><Input {...register("bankDetails.ifscCode")} placeholder="HDFC0001234" /></div>
              <div><Label>Branch Name</Label><Input {...register("bankDetails.branchName")} placeholder="Andheri West" /></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => navigate("/TeamMembers")}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Team Member"}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditTeamMember;
