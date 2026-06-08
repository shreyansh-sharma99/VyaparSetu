import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import {
  Loader2, Users, Crown, User, Shield, Mail,
  ChevronDown, ChevronRight,
  Check, X,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store";
import { fetchHierarchy } from "./services/teamMemberSlice";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_W = 208;
const CHILD_GAP = 32;
const PER_SLOT = CARD_W + CHILD_GAP;
const CARD_CENTER = CARD_W / 2;

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
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
  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${on ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
    {on ? <Check size={9} /> : <X size={9} />} {label}
  </div>
);

// ── Member Detail Modal (uses card data — no extra API call) ──────────────────
const MemberModal = ({ member, onClose }: { member: any | null; onClose: () => void }) => {
  if (!member) return null;
  const grad = GRADIENTS[0];
  const designation = resolveDesignation(member.designation);
  const userTypePretty = member.userType === "owner" ? "Owner" : "Team Member";

  return (
    <Modal open={!!member} onCancel={onClose} footer={null} width={560} centered>
      <div className="space-y-4 pt-1">
        {/* Header */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${grad} text-white`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{member.name}</h2>
            <p className="text-sm opacity-80">{member.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{userTypePretty}</span>
              {member.role?.roleName && (
                <span className="text-[11px] font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
                  <Shield size={8} className="inline mr-1" />{member.role.roleName}
                </span>
              )}
              {designation && (
                <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full">{designation}</span>
              )}
            </div>
          </div>
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><Mail size={13} className="text-primary" /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{member.email}</p>
          </div>
        </div>

        {/* Role details */}
        {member.role?.roleName && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <Shield size={13} className="text-primary" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Role — {member.role.roleName}</span>
            </div>
            {member.role.permissions?.length > 0 ? (
              <div className="p-3 space-y-2">
                {member.role.permissions.map((p: any) => (
                  <div key={p.slug} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">{p.module}</span>
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
              <p className="text-xs text-gray-400 italic px-4 py-3">No permissions configured</p>
            )}
          </div>
        )}

        {/* Reporting to */}
        {member.reportingManager && typeof member.reportingManager === "object" && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(member.reportingManager.name)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reports To</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{member.reportingManager.name}</p>
              <p className="text-xs text-gray-400">{member.reportingManager.email}</p>
            </div>
          </div>
        )}

        {/* Direct reports count */}
        {member.reports?.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <Users size={14} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {member.reports.length} direct report{member.reports.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Tree Node Card ────────────────────────────────────────────────────────────
const MemberCard = ({
  member, depth, expandedNodes, onToggle, onOpenModal,
}: {
  member: any; depth: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onOpenModal: (member: any) => void;
}) => {
  const isExpanded = expandedNodes.has(member._id);
  const hasChildren = (member.reports?.length ?? 0) > 0;
  const isOwner = member.userType === "owner";
  const grad = GRADIENTS[depth % GRADIENTS.length];
  const designation = resolveDesignation(member.designation);
  const connectorW = (member.reports?.length ?? 0) > 1 ? ((member.reports.length - 1) * PER_SLOT) : 0;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Card */}
      <div
        onClick={() => hasChildren && onToggle(member._id)}
        className={`relative w-52 rounded-2xl border-2 p-4 transition-all duration-300 ${hasChildren ? "cursor-pointer" : "cursor-default"
          } ${isOwner
            ? "border-primary/40 bg-gradient-to-br from-primary/8 to-transparent shadow-lg shadow-primary/15 dark:from-primary/15 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20"
            : isExpanded && hasChildren
              ? "border-primary/30 bg-white dark:bg-gray-900 shadow-md hover:scale-[1.02] hover:shadow-lg"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/40 hover:shadow-lg hover:scale-[1.02]"
          }`}
      >
        {/* Owner badge */}
        {isOwner && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow">
              <Crown size={9} /> Owner
            </div>
          </div>
        )}

        {/* Expand chevron */}
        {hasChildren && (
          <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${isExpanded ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
            {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </div>
        )}

        <div className="flex flex-col items-center">
          {/* Avatar — click opens modal */}
          <div
            onClick={(e) => { e.stopPropagation(); onOpenModal(member); }}
            title="View details"
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg font-bold text-white shadow-lg cursor-pointer ring-2 ring-transparent hover:ring-4 hover:ring-white/60 hover:scale-110 transition-all duration-200 mb-3 mt-1`}
          >
            {getInitials(member.name)}
          </div>

          <p className="text-sm font-bold text-gray-900 dark:text-white text-center truncate w-full leading-tight">{member.name}</p>
          <p className="text-[11px] text-gray-400 text-center truncate w-full mt-0.5 mb-2">{member.email}</p>

          <div className="flex flex-col gap-1.5 w-full">
            {member.role?.roleName && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10">
                <Shield size={10} className="text-primary shrink-0" />
                <span className="text-[11px] font-semibold text-primary truncate">{member.role.roleName}</span>
              </div>
            )}
            {designation && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                <User size={10} className="text-gray-500 shrink-0" />
                <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{designation}</span>
              </div>
            )}
            {!member.role?.roleName && !designation && !isOwner && (
              <div className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <span className="text-[10px] text-gray-400 italic">No role assigned</span>
              </div>
            )}
          </div>

          {hasChildren && (
            <div className={`mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${isExpanded ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
              <Users size={8} /> {member.reports.length} report{member.reports.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Children subtree */}
      {hasChildren && (
        <div
          className="flex flex-col items-center overflow-hidden transition-all duration-500"
          style={{ maxHeight: isExpanded ? "5000px" : "0px", opacity: isExpanded ? 1 : 0 }}
        >
          <div className="w-0.5 h-6 bg-gradient-to-b from-primary/50 to-primary/20 mt-1" />
          <div className="relative">
            {member.reports.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-primary/25 rounded-full"
                style={{ left: `${CARD_CENTER}px`, width: `${connectorW}px` }}
              />
            )}
            <div className="flex items-start gap-8">
              {member.reports.map((child: any) => (
                <div key={child._id} className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-primary/20 to-primary/50" />
                  <MemberCard
                    member={child} depth={depth + 1}
                    expandedNodes={expandedNodes}
                    onToggle={onToggle}
                    onOpenModal={onOpenModal}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Unmanaged compact card ────────────────────────────────────────────────────
const UnmanagedCard = ({ member, onOpenModal }: { member: any; onOpenModal: (member: any) => void }) => {
  const designation = resolveDesignation(member.designation);
  return (
    <div
      onClick={() => onOpenModal(member)}
      className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-white/[0.02] hover:border-primary/40 hover:bg-primary/3 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[3]} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow`}>
        {getInitials(member.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">{member.name}</p>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
        {designation && <p className="text-xs text-primary/70 font-medium truncate">{designation}</p>}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">
        No Manager
      </span>
    </div>
  );
};

// ── Divider label ─────────────────────────────────────────────────────────────
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest px-3">{label}</span>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const TeamMemberHierarchy: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hierarchy, loadingHierarchy } = useSelector((state: RootState) => state.teamMember);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [modalMember, setModalMember] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchHierarchy());
  }, [dispatch]);

  // Auto-expand all nodes on first load
  useEffect(() => {
    if (hierarchy?.length) {
      const ids = new Set<string>();
      const collect = (nodes: any[]) => {
        nodes.forEach((n) => {
          ids.add(n._id);
          if (n.reports?.length) collect(n.reports);
        });
      };
      collect(hierarchy);
      setExpandedNodes(ids);
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
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Users size={13} />
            <span>{(hierarchy || []).length} members total</span>
          </div>
        }
      >
        {loadingHierarchy ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-400">Building hierarchy...</p>
          </div>
        ) : (hierarchy || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users size={40} className="mb-4 opacity-20" />
            <p className="text-sm italic">No team members yet</p>
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {rootNodes.length > 0 && (
              <div>
                <SectionDivider label="Reporting Structure" />
                <p className="text-center text-xs text-gray-400 mb-6">Click a card to expand · Click avatar to view details</p>
                <div className="overflow-x-auto pb-6">
                  <div className="flex justify-center">
                    <div className="flex gap-16 items-start min-w-max px-8 py-4">
                      {rootNodes.map((node: any) => (
                        <MemberCard
                          key={node._id}
                          member={node}
                          depth={0}
                          expandedNodes={expandedNodes}
                          onToggle={toggleExpand}
                          onOpenModal={setModalMember}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {unmanaged.length > 0 && (
              <div>
                <SectionDivider label="Independent Members" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
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
