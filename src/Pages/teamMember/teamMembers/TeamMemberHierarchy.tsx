import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Popover } from "antd";
import * as d3 from "d3";
import {
  Users, Crown, User, Shield, Mail,
  ChevronDown, ChevronRight,
  Check, X, MapPin, CreditCard, Loader2, Phone
} from "lucide-react";

import type { AppDispatch, RootState } from "../../../store";
import { fetchHierarchy, fetchTeamMemberById, clearCurrentTeamMember } from "./services/teamMemberSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import Loader from "@/components/UI/Loader";

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_WIDTH = 220;
const CARD_HEIGHT = 130;
const HORIZONTAL_SPACING = 270;
const VERTICAL_SPACING = 200;

const GRADIENTS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

const getInitials = (name: string) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const resolveDesignation = (d: any) =>
  d ? (typeof d === "object" ? d.name : d) : null;

// ── Permission badge ──────────────────────────────────────────────────────────
const PermBadge = ({ on, label }: { on: boolean; label: string }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${on ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50" : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 border border-gray-100 dark:border-gray-800/50"}`}>
    {on ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3]" />} {label}
  </div>
);

// ── Microsoft Teams Style Profile Card for Hover ────────────────────────────
const TeamsProfileCard = ({ member, onOpenModal }: { member: any; onOpenModal: (member: any) => void }) => {
  const designation = resolveDesignation(member.designation);
  const grad = GRADIENTS[0]; // Premium blue/indigo gradient

  return (
    <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800/80 text-gray-700 dark:text-gray-300">
      {/* Sleek top banner */}
      <div className={`h-16 bg-gradient-to-r ${grad} relative`} />

      {/* Profile Content */}
      <div className="px-5 pb-5 pt-0 relative">
        {/* Overlapping Avatar with Status Badge */}
        <div className="absolute -top-8 left-5 flex items-end">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900 shrink-0">
            {getInitials(member.name)}
          </div>
          {/* Available Status Dot */}
          <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 absolute -bottom-0.5 -right-0.5 shadow-md animate-pulse" title="Available" />
        </div>

        {/* Space for overlapping avatar */}
        <div className="h-9" />

        {/* Member name & email */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">{member.name}</h3>
            {member.userType === "owner" && (
              <span className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                Owner
              </span>
            )}
          </div>
          <p className="text-[14px] text-gray-400 truncate">{member.email}</p>
        </div>

        {/* Details Grid */}
        <div className="mt-3.5 space-y-2 border-t border-b border-gray-100 dark:border-gray-800/80 py-3 text-[14px]">
          {member.role?.roleName && (
            <div className="flex items-center gap-2.5">
              <Shield size={13} className="text-indigo-500 shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Role:</span>
              <span className="text-gray-500 dark:text-gray-400">{member.role.roleName}</span>
            </div>
          )}
          {designation && (
            <div className="flex items-center gap-2.5">
              <User size={13} className="text-indigo-500 shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Designation:</span>
              <span className="text-gray-500 dark:text-gray-400">{designation}</span>
            </div>
          )}
          {member.reportingManager && (
            <div className="flex items-center gap-2.5">
              <Crown size={12} className="text-indigo-500 shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">Reports to:</span>
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {typeof member.reportingManager === "object" ? member.reportingManager.name : "Reporting Manager"}
              </span>
            </div>
          )}
          {member.reports?.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Users size={12} className="text-emerald-500 shrink-0" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Direct Reports:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{member.reports.length}</span>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="mt-4 flex gap-2">
          <a
            href={`mailto:${member.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md transition-all active:scale-[0.98]"
          >
            <Mail size={12} /> Email
          </a>
          <button
            onClick={() => onOpenModal(member)}
            className="flex-1 py-2 px-3 rounded-xl text-[14px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all border border-gray-200/60 dark:border-gray-700/60 active:scale-[0.98]"
          >
            Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Card inside D3 Hierarchy Tree with Hover Popover ──────────────────────────
const TeamsPopoverCard = ({
  member, depth, isExpanded, hasChildren, onToggle, onOpenModal
}: {
  member: any; depth: number; isExpanded: boolean; hasChildren: boolean;
  onToggle: (id: string) => void; onOpenModal: (member: any) => void;
}) => {
  const isOwner = member.userType === "owner";
  const grad = GRADIENTS[depth % GRADIENTS.length];
  const designation = resolveDesignation(member.designation);

  return (
    <div
      className={`relative w-[220px] h-[130px] rounded-2xl border p-3.5 bg-white dark:bg-gray-900 transition-all duration-300 select-none flex flex-col justify-between ${isOwner
        ? "border-primary/50 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.03]"
        : "border-gray-200 dark:border-gray-800/80 shadow-sm hover:border-primary/50 hover:shadow-md hover:scale-[1.03]"
        }`}
    >
      {/* Left Accent Gradient Bar */}
      <div className={`absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-gradient-to-b ${grad}`} />

      {/* Upper part of card */}
      <div className="flex gap-2.5 items-start pl-1.5">
        {/* Initials Avatar Popover */}
        <Popover
          content={<TeamsProfileCard member={member} onOpenModal={onOpenModal} />}
          trigger="hover"
          placement="right"
          mouseEnterDelay={0.3}
          mouseLeaveDelay={0.3}
          overlayStyle={{ padding: 0 }}
          overlayInnerStyle={{ background: "transparent", padding: 0, boxShadow: "none" }}
        >
          <div
            onClick={(e) => { e.stopPropagation(); onOpenModal(member); }}
            title="View Profile"
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-[15px] font-bold text-white shadow cursor-pointer shrink-0 transition-transform hover:scale-105`}
          >
            {getInitials(member.name)}
          </div>
        </Popover>

        {/* Name and Email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p
              onClick={(e) => { e.stopPropagation(); onOpenModal(member); }}
              className="text-[14px] font-bold text-gray-900 dark:text-white truncate leading-tight hover:text-primary transition-colors cursor-pointer"
            >
              {member.name}
            </p>
            {isOwner && <Crown size={9} className="text-amber-500 shrink-0" />}
          </div>
          <p className="text-[12px] text-gray-400 truncate leading-none mt-1">{member.email}</p>
        </div>
      </div>

      {/* Lower part of card (Role/Designation) */}
      <div className="space-y-1 pl-1.5">
        {member.role?.roleName ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 dark:bg-primary/10 border border-primary/10 max-w-full">
            <Shield size={9} className="text-primary shrink-0" />
            <span className="text-[11px] font-bold text-primary truncate uppercase tracking-wider">{member.role.roleName}</span>
          </div>
        ) : designation ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 max-w-full">
            <User size={9} className="text-gray-400 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">{designation}</span>
          </div>
        ) : (
          <div className="px-2 py-0.5 rounded bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-800/80 max-w-full text-center">
            <span className="text-[11px] text-gray-400 italic">No assigned role</span>
          </div>
        )}
      </div>

      {/* Floating Expand/Collapse Button */}
      {hasChildren && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(member._id); }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 border ${isExpanded
              ? "bg-primary text-white border-primary hover:bg-primary-dark hover:scale-105"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-750 hover:border-primary hover:text-primary hover:scale-105"
              }`}
            title={isExpanded ? "Collapse Team" : "Expand Team"}
          >
            {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {/* Small count badge next to it if collapsed */}
          {!isExpanded && (
            <span className="absolute left-7 bg-emerald-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap animate-fade-in">
              {member.reports.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ── Member Detail Modal (fetches full data) ──────────────────────────────────
const MemberModal = ({ member, onClose }: { member: any | null; onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTeamMember: fullMember, fetchingCurrent } = useSelector((state: RootState) => state.teamMember);

  useEffect(() => {
    if (member?._id) {
      dispatch(fetchTeamMemberById(member._id));
    }
    return () => {
      dispatch(clearCurrentTeamMember());
    };
  }, [member?._id, dispatch]);

  if (!member) return null;

  const displayMember = fullMember || member;
  const grad = GRADIENTS[0];
  const designation = resolveDesignation(displayMember.designation);
  const userTypePretty = displayMember.userType === "owner" ? "Owner" : "Team Member";

  return (
    <Modal
      open={!!member}
      onCancel={onClose}
      footer={null}
      width={650}
      centered
      className="custom-premium-modal"
    >
      <div className="space-y-5 pt-1.5">
        {/* Header */}
        <div className={`flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br ${grad} text-white shadow-lg relative`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg backdrop-blur-md border-2 border-white/30">
            {getInitials(displayMember.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold tracking-tight">{displayMember.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-white/90">
              <span className="text-[14px] font-medium flex items-center gap-1"><Mail size={12} /> {displayMember.email}</span>
              {displayMember.phone && <span className="text-[14px] font-medium flex items-center gap-1"><Phone size={12} /> {displayMember.phone}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[12px] bg-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{userTypePretty}</span>
              {displayMember.role?.roleName && (
                <span className="text-[12px] font-bold bg-white/25 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Shield size={10} />{displayMember.role.roleName}
                </span>
              )}
              {designation && (
                <span className="text-[12px] bg-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{designation}</span>
              )}
            </div>
          </div>
        </div>

        {fetchingCurrent ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin mb-3 text-primary" size={28} />
            <p className="text-[14px] font-medium uppercase tracking-wider">Loading full profile...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 thin-scrollbar">

            {/* Contact & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${displayMember.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-200">{displayMember.isActive !== false ? 'Active Account' : 'Inactive Account'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-200">{displayMember.createdAt ? new Date(displayMember.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {/* Address */}
            {displayMember.address && (displayMember.address.city || displayMember.address.street) && (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <MapPin size={14} className="text-rose-500 shrink-0" />
                  <span className="text-[14px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Address Information</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Street</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.address.street || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">City</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.address.city || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">State</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.address.state || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Zip Code</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.address.zipCode || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Country</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.address.country || '-'}</p></div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {displayMember.bankDetails && (displayMember.bankDetails.accountNumber || displayMember.bankDetails.bankName) && (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <CreditCard size={14} className="text-amber-500 shrink-0" />
                  <span className="text-[14px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bank Details</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Account Holder</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.bankDetails.accountHolderName || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Bank Name</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.bankDetails.bankName || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Account Number</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.bankDetails.accountNumber || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">IFSC Code</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.bankDetails.ifscCode || '-'}</p></div>
                  <div><p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Branch Name</p><p className="text-[14px] font-medium dark:text-gray-200">{displayMember.bankDetails.branchName || '-'}</p></div>
                </div>
              </div>
            )}

            {/* Role details */}
            {displayMember.role?.roleName && (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/50">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <Shield size={14} className="text-primary shrink-0" />
                  <span className="text-[14px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Permissions for {displayMember.role.roleName}</span>
                </div>
                {displayMember.role.permissions?.length > 0 ? (
                  <div className="p-4 space-y-3">
                    {displayMember.role.permissions.map((p: any) => (
                      <div key={p.slug} className="flex items-center gap-3 justify-between sm:justify-start">
                        <span className="w-28 text-[14px] font-extrabold text-gray-500 dark:text-gray-400 shrink-0 uppercase tracking-wider">{p.module}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          <PermBadge on={p.canRead} label="Read" />
                          <PermBadge on={p.canWrite} label="Write" />
                          <PermBadge on={p.canUpdate} label="Update" />
                          <PermBadge on={p.canDelete} label="Delete" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-gray-405 italic px-4 py-3 text-center">No modules configured for this role</p>
                )}
              </div>
            )}

            {/* Reporting structure */}
            {displayMember.reportingManager && typeof displayMember.reportingManager === "object" && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-[14px] font-bold text-white shrink-0 shadow-sm">
                  {getInitials(displayMember.reportingManager.name)}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reporting Manager</p>
                  <p className="text-[15px] font-bold text-gray-800 dark:text-gray-150">{displayMember.reportingManager.name}</p>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400">{displayMember.reportingManager.email}</p>
                </div>
              </div>
            )}

            {/* Direct reports count */}
            {displayMember.reports?.length > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400">
                  Manages {displayMember.reports.length} direct team member{displayMember.reports.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Unmanaged compact card ────────────────────────────────────────────────────
const UnmanagedCard = ({ member, onOpenModal }: { member: any; onOpenModal: (member: any) => void }) => {
  const designation = resolveDesignation(member.designation);
  return (
    <Popover
      content={<TeamsProfileCard member={member} onOpenModal={onOpenModal} />}
      trigger="hover"
      placement="top"
      mouseEnterDelay={0.3}
      mouseLeaveDelay={0.3}
      overlayInnerStyle={{ background: "transparent", padding: 0, boxShadow: "none" }}
    >
      <div
        onClick={() => onOpenModal(member)}
        className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-primary/50 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group relative pl-5"
      >
        <div className={`absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-gradient-to-b ${GRADIENTS[3]}`} />

        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[3]} flex items-center justify-center text-[15px] font-bold text-white shrink-0 shadow`}>
          {getInitials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-gray-950 dark:text-white truncate group-hover:text-primary transition-colors">{member.name}</p>
          <p className="text-[14px] text-gray-400 truncate">{member.email}</p>
          {designation && <p className="text-[12px] text-primary/70 font-semibold truncate mt-0.5 uppercase tracking-wider">{designation}</p>}
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shrink-0">
          No Manager
        </span>
      </div>
    </Popover>
  );
};

// ── Divider label ─────────────────────────────────────────────────────────────
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-850 to-transparent" />
    <span className="text-[12px] font-extrabold text-gray-400 uppercase tracking-widest px-3">{label}</span>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-850 to-transparent" />
  </div>
);

// ── D3 Collapsible Tree Chart Component ──────────────────────────────────────
interface D3HierarchyTreeProps {
  rootNodes: any[];
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onOpenModal: (member: any) => void;
}

const D3HierarchyTree: React.FC<D3HierarchyTreeProps> = ({
  rootNodes, expandedNodes, onToggle, onOpenModal
}) => {
  // We construct a single virtual root node containing all our real roots as its reports.
  // This lets D3 compute the alignment for multiple roots in a single elegant layout!
  const virtualRoot = {
    _id: "virtual-root",
    name: "Organization",
    isVirtual: true,
    reports: rootNodes,
  };

  const root = d3.hierarchy<any>(virtualRoot, (d) => {
    if (d._id === "virtual-root") return d.reports;
    // Only return reports if the node is expanded
    return expandedNodes.has(d._id) ? d.reports : null;
  });

  const treeLayout = d3.tree<any>().nodeSize([HORIZONTAL_SPACING, VERTICAL_SPACING]);
  const pointRoot = treeLayout(root);

  const descendants = pointRoot.descendants();
  const links = pointRoot.links();

  // Shift coordinates so that the real roots are aligned at y = 0
  const processedNodes = descendants
    .filter((d) => !d.data.isVirtual)
    .map((d) => ({
      id: d.data._id,
      x: d.x,
      y: d.y - VERTICAL_SPACING,
      data: d.data,
      depth: d.depth - 1,
      hasChildren: d.data.reports && d.data.reports.length > 0,
    }));

  const processedLinks = links
    .filter((l) => !l.source.data.isVirtual)
    .map((l) => ({
      source: {
        x: l.source.x,
        y: l.source.y - VERTICAL_SPACING,
      },
      target: {
        x: l.target.x,
        y: l.target.y - VERTICAL_SPACING,
      },
    }));

  // Elbow connectors (orthogonal step connectors) with premium crisp path styling
  const drawElbowLink = (d: any) => {
    const sourceX = d.source.x;
    const sourceY = d.source.y + CARD_HEIGHT / 2;
    const targetX = d.target.x;
    const targetY = d.target.y - CARD_HEIGHT / 2;

    const midY = (sourceY + targetY) / 2;
    return `M${sourceX},${sourceY} L${sourceX},${midY} L${targetX},${midY} L${targetX},${targetY}`;
  };

  // Find dynamic boundary box to ensure SVG size is absolute-perfect
  let minX = -CARD_WIDTH / 2;
  let maxX = CARD_WIDTH / 2;
  let minY = 0;
  let maxY = CARD_HEIGHT;

  if (processedNodes.length > 0) {
    minX = d3.min(processedNodes, (d) => d.x) ?? -CARD_WIDTH / 2;
    maxX = d3.max(processedNodes, (d) => d.x) ?? CARD_WIDTH / 2;
    minY = d3.min(processedNodes, (d) => d.y) ?? 0;
    maxY = d3.max(processedNodes, (d) => d.y) ?? CARD_HEIGHT;
  }

  const padding = 60;
  const svgWidth = maxX - minX + CARD_WIDTH + padding * 2;
  const svgHeight = maxY - minY + CARD_HEIGHT + padding * 2;

  const translateX = -minX + CARD_WIDTH / 2 + padding;
  const translateY = -minY + CARD_HEIGHT / 2 + padding;

  return (
    <div className="w-full overflow-x-auto pb-8 pt-4 flex justify-center">
      <div className="min-w-max">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="transition-all duration-500 ease-in-out select-none overflow-visible"
        >
          <defs>
            <linearGradient id="elbow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <g
            transform={`translate(${translateX}, ${translateY})`}
            className="transition-transform duration-500 ease-in-out"
          >
            {/* Crisp Connection Links */}
            {processedLinks.map((link, i) => (
              <path
                key={`link-${i}`}
                d={drawElbowLink(link)}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-primary/40 dark:text-primary/50 transition-all duration-500 ease-in-out"
              />
            ))}

            {/* Render Cards inside SVG foreignObject */}
            {processedNodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="transition-transform duration-500 ease-in-out"
              >
                <foreignObject
                  x={-CARD_WIDTH / 2}
                  y={-CARD_HEIGHT / 2}
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT + 24}
                  className="overflow-visible"
                >
                  <div className="w-full h-full p-1 overflow-visible">
                    <TeamsPopoverCard
                      member={node.data}
                      depth={node.depth}
                      isExpanded={expandedNodes.has(node.id)}
                      hasChildren={node.hasChildren}
                      onToggle={onToggle}
                      onOpenModal={onOpenModal}
                    />
                  </div>
                </foreignObject>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TeamMemberHierarchy: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hierarchy, loadingHierarchy } = useSelector((state: RootState) => state.teamMember);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["virtual-root"]));
  const [modalMember, setModalMember] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchHierarchy());
  }, [dispatch]);

  // Keep sub-member graphs CLOSED initially by default (only expand virtual-root)
  useEffect(() => {
    if (hierarchy?.length) {
      setExpandedNodes(new Set(["virtual-root"]));
    }
  }, [hierarchy]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const rootNodes = (hierarchy || []).filter(
    (n: any) => n.userType === "owner" || (!n.reportingManager && n.reports?.length > 0)
  );

  const unmanaged = (hierarchy || []).filter(
    (n: any) =>
      n.userType !== "owner" &&
      (!n.reports || n.reports.length === 0) &&
      !n.reportingManager
  );

  return (
    <div className="space-y-6">
      <PageMeta title="Team Hierarchy | VyaparSetu" description="Organization hierarchy" />

      <ComponentCard
        title="Organization Hierarchy"
        rightButtonNode={
          <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-150/40 dark:border-gray-700/40">
            <Users size={13} className="text-primary" />
            <span>{(hierarchy || []).length} members total</span>
          </div>
        }
      >
        {loadingHierarchy ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader />
          </div>
        ) : (hierarchy || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={40} className="mb-4 opacity-20" />
            <p className="text-[15px] italic font-medium">No team members yet</p>
          </div>
        ) : (
          <div className="">
            {rootNodes.length > 0 && (
              <div>
                {/* <SectionDivider label="Reporting Structure" /> */}

                <D3HierarchyTree
                  rootNodes={rootNodes}
                  expandedNodes={expandedNodes}
                  onToggle={toggleExpand}
                  onOpenModal={setModalMember}
                />
              </div>
            )}

            {unmanaged.length > 0 && (
              <div>
                <SectionDivider label="Independent Members" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {unmanaged.map((m: any) => (
                    <UnmanagedCard key={m._id} member={m} onOpenModal={setModalMember} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ComponentCard>

      <MemberModal member={modalMember} onClose={() => setModalMember(null)} />
    </div>
  );
};

export default TeamMemberHierarchy;

