import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  User,
  FileText,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store";
import { fetchRoleById, clearCurrentRole } from "./services/rolesSlice";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/UI/button/Button";
import Loader from "../../components/UI/Loader";
import PageMeta from "@/components/common/PageMeta";
import { formatDateWithTiming } from "../../components/common/dateFormat";

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
    {
        module: "Help Desk",
        slug: "#helpdesk",
        subModules: [
            { module: "Dashboard Stats", slug: "/HelpDesk/stats" },
            { module: "Tickets", slug: "/HelpDesk" },
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

const PERM_COLORS = {
  canRead: { yes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Read" },
  canWrite: { yes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Write" },
  canUpdate: { yes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Update" },
  canDelete: { yes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Delete" },
};

const PermBadge = ({
  granted,
  label,
  colorClass,
}: {
  granted: boolean;
  label: string;
  colorClass: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
      granted
        ? `${colorClass} border-transparent`
        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 border-gray-200 dark:border-gray-700"
    }`}
  >
    {granted ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
    {label}
  </span>
);

const RoleDetails: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const { currentRole: role, fetchingCurrent: loading } = useSelector(
    (state: RootState) => state.roles
  );

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  useEffect(() => {
    if (roleId) {
      dispatch(fetchRoleById(roleId));
    }
    return () => {
      dispatch(clearCurrentRole());
    };
  }, [dispatch, roleId]);

  useEffect(() => {
    if (role?.permissions) {
      const initialExpanded: Record<string, boolean> = {};
      const flatList = flattenModules();
      role.permissions.forEach((p: any) => {
        const matchedModule = flatList.find((m) => m.slug === p.slug);
        if (matchedModule?.parentSlug && (p.canRead || p.canWrite || p.canUpdate || p.canDelete)) {
          initialExpanded[matchedModule.parentSlug] = true;
        }
      });
      setExpandedGroups(initialExpanded);
    }
  }, [role]);

  const permissionsMap = React.useMemo(() => {
    const initialPerms = getInitialPermissions();
    if (role?.permissions) {
      role.permissions.forEach((p: any) => {
        if (initialPerms[p.slug]) {
          initialPerms[p.slug] = {
            ...initialPerms[p.slug],
            canRead: p.canRead,
            canWrite: p.canWrite,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          };
        }
      });
    }
    return initialPerms;
  }, [role]);

  const flatModulesList = flattenModules();

  return (
    <div className="space-y-6">
      <PageMeta
        title={`${role?.roleName || "Role"} Details | VyaparSetu`}
        description="View role details and permissions"
      />

      <ComponentCard
        title={role?.roleName || "Role Details"}
        rightButtonNode={
          role && (
            <div className="flex items-center gap-2">
              {!role.isSystemRole && (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => navigate(`/roles/edit/${role._id}`)}
                  className="flex items-center gap-1.5 !rounded-xl !px-4"
                >
                  Edit Role
                </Button>
              )}
              <Button
                variant="danger"
                size="xs"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 !rounded-xl !px-4 shadow-sm font-semibold"
              >
                Back
              </Button>
            </div>
          )
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader />
          </div>
        ) : role ? (
          <div className="space-y-8">
            {/* Role Hero Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 border border-primary/10 dark:border-primary/20">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {role.roleName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed max-w-md">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    role.isSystemRole
                      ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/40"
                      : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40"
                  }`}
                >
                  <ShieldCheck size={12} />
                  {role.isSystemRole ? "System Role" : "Custom Role"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                  {role.permissions?.length || 0} Modules
                </span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: User,
                  label: "Role Name",
                  value: role.roleName,
                  color: "text-blue-500",
                },
                {
                  icon: Clock,
                  label: "Created At",
                  value: formatDateWithTiming(role.createdAt),
                  color: "text-emerald-500",
                },
                {
                  icon: Clock,
                  label: "Last Updated",
                  value: formatDateWithTiming(role.updatedAt),
                  color: "text-amber-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50/60 dark:bg-white/[0.02] border border-gray-100/80 dark:border-white/[0.05]"
                >
                  <div
                    className={`mt-0.5 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 ${item.color} shrink-0`}
                  >
                    <item.icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-words">
                      {item.value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Permissions Matrix */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/[0.03] dark:to-white/[0.01] border-b border-gray-200 dark:border-gray-700">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <FileText size={15} className="text-primary" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Module Permissions
                </h3>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                  {role.permissions?.length || 0} modules
                </span>
              </div>

              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_repeat(4,_100px)] px-5 py-3 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <div>Module</div>
                <div className="text-center">Read</div>
                <div className="text-center">Write</div>
                <div className="text-center">Update</div>
                <div className="text-center">Delete</div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {(role.permissions || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ShieldCheck size={32} className="mb-3 opacity-30" />
                    <p className="text-sm italic">No permissions assigned</p>
                  </div>
                ) : (
                  flatModulesList.map((m) => {
                    const perm = permissionsMap[m.slug];
                    if (!perm) return null;

                    if (m.parentSlug && !expandedGroups[m.parentSlug]) return null;

                    return (
                      <div
                        key={m.slug}
                        className={`flex flex-col sm:grid sm:grid-cols-[1fr_repeat(4,_100px)] px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors gap-3 sm:gap-0 items-center ${
                          m.isGroup ? "bg-gray-50/30 dark:bg-white/[0.01]" : ""
                        }`}
                      >
                        {/* Module Name */}
                        <div
                          className={`flex items-center gap-2.5 w-full sm:w-auto ${
                            m.parentSlug ? "pl-6" : ""
                          } ${m.isGroup ? "cursor-pointer select-none" : ""}`}
                          onClick={() => {
                            if (m.isGroup) toggleGroup(m.slug);
                          }}
                        >
                          {!m.parentSlug && !m.isGroup && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                          )}
                          {m.isGroup && (
                            <div className="text-gray-400">
                              {expandedGroups[m.slug] ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </div>
                          )}
                          {m.parentSlug && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              m.isGroup
                                ? "font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
                                : "font-medium text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {m.module}
                          </span>
                        </div>

                        {/* Permissions — Desktop */}
                        {(
                          [
                            { key: "canRead", ...PERM_COLORS.canRead },
                            { key: "canWrite", ...PERM_COLORS.canWrite },
                            { key: "canUpdate", ...PERM_COLORS.canUpdate },
                            { key: "canDelete", ...PERM_COLORS.canDelete },
                          ] as Array<{ key: keyof typeof perm; yes: string; label: string }>
                        ).map((p) => (
                          <div key={p.key} className="hidden sm:flex justify-center items-center">
                            <PermBadge
                              granted={perm[p.key] as boolean}
                              label={p.label}
                              colorClass={p.yes}
                            />
                          </div>
                        ))}

                        {/* Permissions — Mobile */}
                        <div className="sm:hidden flex flex-wrap gap-2 w-full">
                          {(
                            [
                              { key: "canRead", ...PERM_COLORS.canRead },
                              { key: "canWrite", ...PERM_COLORS.canWrite },
                              { key: "canUpdate", ...PERM_COLORS.canUpdate },
                              { key: "canDelete", ...PERM_COLORS.canDelete },
                            ] as Array<{ key: keyof typeof perm; yes: string; label: string }>
                          ).map((p) => (
                            <PermBadge
                              key={p.key}
                              granted={perm[p.key] as boolean}
                              label={p.label}
                              colorClass={p.yes}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShieldCheck size={40} className="mb-4 opacity-20" />
            <p className="italic">No role data available</p>
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default RoleDetails;
