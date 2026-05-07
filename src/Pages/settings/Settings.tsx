import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchSettings, updateSettingsAction } from "./services/settingsSlice";
import type { PlanFeatureDefinition } from "./services/settingsSlice";
import { fetchUserProfile } from "@/Pages/login/services/userSlice";
import ComponentCard from "@/components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/UI/table";
import PageMeta from "@/components/common/PageMeta";
import Loader from "@/components/UI/Loader";
import { EditIcon, Eyeicon } from "@/icons/icons";
import { Modal, Form, Button as AntButton, Row, Col, Checkbox, Switch, Tag, ConfigProvider, theme } from "antd";
import { toast } from "react-toastify";
import InputField from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/Select";
import { loginApi } from "@/Pages/login/services/authService";

const EMPTY_FEATURE: Omit<PlanFeatureDefinition, "_id"> = {
  key: "",
  label: "",
  systemHook: "none",
  type: "number",
  defaultValue: 0,
  description: "",
  isActive: true,
  sortOrder: 0,
};

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error, updating } = useSelector((state: RootState) => state.settings);
  const { profile } = useSelector((state: RootState) => state.user);
  const currentTheme = useSelector((state: RootState) => state.ui.theme);
  const isDark = currentTheme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Security states
  const [isSecretsRevealed, setIsSecretsRevealed] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Local state for toggling visibility of fields within the edit modal
  const [showFieldSecrets, setShowFieldSecrets] = useState<{ [key: string]: boolean }>({});

  // Plan feature definition modal state
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PlanFeatureDefinition | null>(null);
  const [featureForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchSettings());
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  const openEditModal = (section: string, data: any) => {
    setEditSection(section);
    form.setFieldsValue(data);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { [editSection!]: values };

      const resultAction = await dispatch(updateSettingsAction(payload));
      if (updateSettingsAction.fulfilled.match(resultAction)) {
        toast.success(`${editSection?.charAt(0).toUpperCase()}${editSection?.slice(1)} settings updated successfully`);
        setIsModalOpen(false);
        dispatch(fetchSettings());
      } else {
        toast.error(resultAction.payload as string || "Failed to update settings");
      }
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      toast.warning("Please enter your password");
      return;
    }
    setIsVerifying(true);
    try {
      const userEmail = profile?.email || profile?.owner?.email || profile?.user?.email;
      if (!userEmail) {
        toast.error("User email not found. Please try logging in again.");
        return;
      }
      const response = await loginApi({ email: userEmail, password: verifyPassword });
      if (response.success) {
        setIsSecretsRevealed(true);
        setIsVerifyModalOpen(false);
        setVerifyPassword("");
        toast.success("Identity verified. Secrets unmasked.");
      } else {
        toast.error("Verification failed. Incorrect password.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleFieldVisibility = (key: string) => {
    setShowFieldSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Plan Feature Definition helpers ──────────────────────────────────────

  const openAddFeature = () => {
    setEditingFeature(null);
    featureForm.setFieldsValue({ ...EMPTY_FEATURE });
    setIsFeatureModalOpen(true);
  };

  const openEditFeature = (feature: PlanFeatureDefinition) => {
    setEditingFeature(feature);
    featureForm.setFieldsValue({ ...feature });
    setIsFeatureModalOpen(true);
  };

  const handleFeatureSave = async () => {
    try {
      const values = await featureForm.validateFields();

      // Convert string boolean back to actual boolean if type is boolean
      if (values.type === 'boolean' && typeof values.defaultValue === 'string') {
        values.defaultValue = values.defaultValue === 'true';
      }

      const currentDefs: PlanFeatureDefinition[] = settings?.planFeatureDefinitions ?? [];

      let updatedDefs: PlanFeatureDefinition[];
      if (editingFeature) {
        updatedDefs = currentDefs.map(d =>
          d._id === editingFeature._id ? { ...d, ...values } : d
        );
      } else {
        // New feature — backend will assign _id; send without it
        updatedDefs = [...currentDefs, { ...values, _id: undefined }];
      }

      const resultAction = await dispatch(updateSettingsAction({ planFeatureDefinitions: updatedDefs }));
      if (updateSettingsAction.fulfilled.match(resultAction)) {
        toast.success(editingFeature ? "Feature definition updated." : "Feature definition added.");
        setIsFeatureModalOpen(false);
        dispatch(fetchSettings());
      } else {
        toast.error(resultAction.payload as string || "Failed to save feature definition");
      }
    } catch (err) {
      console.error("Feature form validation failed:", err);
    }
  };

  const handleToggleFeatureActive = async (feature: PlanFeatureDefinition, checked: boolean) => {
    const currentDefs: PlanFeatureDefinition[] = settings?.planFeatureDefinitions ?? [];
    const updatedDefs = currentDefs.map(d =>
      d._id === feature._id ? { ...d, isActive: checked } : d
    );
    const resultAction = await dispatch(updateSettingsAction({ planFeatureDefinitions: updatedDefs }));
    if (updateSettingsAction.fulfilled.match(resultAction)) {
      toast.success(`"${feature.label}" ${checked ? "activated" : "deactivated"}.`);
      dispatch(fetchSettings());
    } else {
      toast.error("Failed to update feature status.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading && !settings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 font-medium">
        Error: {error}
      </div>
    );
  }

  if (!settings) return null;

  const renderTable = (title: string, sectionKey: string, data: Record<string, any>) => {
    const keys = Object.keys(data).filter(key => key !== "_id" && key !== "__v");

    return (
      <ComponentCard
        title={title}
        className="mb-6 shadow-sm border-gray-100 dark:border-gray-800"
        rightButtonNode={
          <button
            onClick={() => openEditModal(sectionKey, data)}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors text-blue-600 dark:text-blue-400"
            title={`Edit ${title}`}
          >
            <EditIcon className="w-5 h-5" />
          </button>
        }
      >
        <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="px-5 py-4 font-semibold text-gray-700 dark:text-white/80 text-theme-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-800 text-left w-1/3">
                  Field
                </TableCell>
                <TableCell isHeader className="px-5 py-4 font-semibold text-gray-700 dark:text-white/80 text-theme-sm whitespace-nowrap text-left">
                  Value
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {keys.map((key) => {
                const isSecret = key.toLowerCase().includes('secret') || key.toLowerCase().includes('password');
                return (
                  <TableRow key={key} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800 whitespace-nowrap">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
                      {key === 'logoUrl' && data[key] ? (
                        <div className="flex items-center gap-3">
                          <img src={data[key]} alt="Logo" className="h-10 w-auto object-contain rounded border border-gray-200 dark:border-gray-700 p-1 bg-white" />
                          <span className="text-xs text-gray-400 font-sans truncate max-w-xs">{data[key]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <span>
                            {isSecret && !isSecretsRevealed
                              ? "••••••••••••••••"
                              : typeof data[key] === 'boolean'
                                ? (data[key] ? "Yes" : "No")
                                : data[key]?.toString() || "—"}
                          </span>
                          {isSecret && !isSecretsRevealed && (
                            <button
                              onClick={() => setIsVerifyModalOpen(true)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Show secret"
                            >
                              <Eyeicon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ComponentCard>
    );
  };

  const typeColors: Record<string, string> = {
    number: "blue",
    boolean: "purple",
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          Modal: {
            contentBg: isDark ? '#0B0F19' : '#ffffff',
            headerBg: isDark ? '#0B0F19' : '#ffffff',
          },
        },
      }}
    >
      <PageMeta title="Settings | Vyapar Setu" description="Platform settings and configurations" />

      <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {renderTable("Platform Details", "platform", settings.platform)}
            {renderTable("Billing Configuration", "billing", settings.billing)}
          </div>
          <div className="space-y-6">
            {renderTable("Razorpay Configuration", "razorpay", settings.razorpay)}
            {renderTable("SMTP Configuration", "smtp", settings.smtp)}
          </div>
        </div>

        {/* ── Plan Feature Definitions ──────────────────────────────────── */}
        <ComponentCard
          title="Plan Feature Definitions"
          className="shadow-sm border-gray-100 dark:border-gray-800"
          rightButtonNode={
            <button
              onClick={openAddFeature}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              + Add Feature
            </button>
          }
        >
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow>
                  {["Label", "Type", "Default", "Description", "Active", "Actions"].map(h => (
                    <TableCell key={h} isHeader className="px-4 py-3 font-semibold text-gray-700 dark:text-white/80 text-theme-sm whitespace-nowrap text-left border-r last:border-r-0 border-gray-100 dark:border-gray-800">
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {(settings.planFeatureDefinitions ?? [])
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((feat) => (
                    <TableRow key={feat._id} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-800 whitespace-nowrap">
                        {feat.label}
                      </TableCell>
                      <TableCell className="px-4 py-3 border-r border-gray-100 dark:border-gray-800">
                        <Tag color={typeColors[feat.type]}>{feat.type}</Tag>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800">
                        {typeof feat.defaultValue === "boolean" ? (feat.defaultValue ? "true" : "false") : String(feat.defaultValue)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800 max-w-sm">
                        <span className="block whitespace-normal break-words">{feat.description}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 border-r border-gray-100 dark:border-gray-800">
                        <Switch
                          checked={feat.isActive}
                          size="small"
                          loading={updating}
                          onChange={(checked) => handleToggleFeatureActive(feat, checked)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => openEditFeature(feat)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors text-blue-600 dark:text-blue-400"
                          title="Edit feature"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                {(!settings.planFeatureDefinitions || settings.planFeatureDefinitions.length === 0) && (
                  <TableRow>
                    <TableCell className="px-4 py-8 text-center text-gray-400 dark:text-gray-600 text-sm" colSpan={6}>
                      No feature definitions found. Click "Add Feature" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>

      {/* ── General Section Edit Modal ──────────────────────────────────── */}
      <Modal
        title={
          <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">
            Edit {editSection?.charAt(0).toUpperCase()}{editSection?.slice(1)} Settings
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setIsModalOpen(false)} className="rounded-lg h-10">Cancel</AntButton>,
          <AntButton key="save" type="primary" loading={updating} onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 h-10 rounded-lg px-6 font-medium">
            Save Changes
          </AntButton>,
        ]}
        width={800}
        centered
        destroyOnClose
        className="plan-details-modal"
        classNames={{
          header: 'dark:bg-[#0B0F19] dark:border-b dark:border-gray-800 pb-2',
          body: 'dark:bg-[#0B0F19]',
        }}
        bodyStyle={{ paddingTop: '20px' }}
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Row gutter={[24, 0]}>
            {editSection && Object.keys((settings as any)[editSection]).filter(k => k !== '_id' && k !== '__v').map(key => {
              const isSecret = key.toLowerCase().includes('secret') || key.toLowerCase().includes('password');
              const isFieldVisible = isSecretsRevealed || showFieldSecrets[key];

              return (
                <Col xs={24} sm={12} key={key}>
                  <Form.Item
                    name={key}
                    valuePropName={typeof (settings as any)[editSection][key] === 'boolean' ? 'checked' : 'value'}
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isSecretsRevealed) toggleFieldVisibility(key);
                              else setIsVerifyModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Eyeicon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    }
                    rules={[{ required: typeof (settings as any)[editSection][key] !== 'boolean', message: `Please enter ${key}` }]}
                    getValueFromEvent={key === 'port' || typeof (settings as any)[editSection][key] === 'number' ? (e) => Number(e.target.value) : undefined}
                  >
                    {typeof (settings as any)[editSection][key] === 'boolean' ? (
                      <Checkbox className="text-gray-600 dark:text-gray-400">
                        Enable {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Checkbox>
                    ) : (
                      <InputField
                        placeholder={`Enter ${key}`}
                        autoComplete={isSecret ? "new-password" : "off"}
                        type={
                          isSecret && !isFieldVisible
                            ? "password"
                            : (key === 'port' || typeof (settings as any)[editSection][key] === 'number' ? 'number' : 'text')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </Modal>

      {/* ── Plan Feature Definition Modal ──────────────────────────────── */}
      <Modal
        title={
          <span className="text-indigo-600 dark:text-indigo-400 text-lg font-bold">
            {editingFeature ? "Edit Feature Definition" : "Add Feature Definition"}
          </span>
        }
        open={isFeatureModalOpen}
        onCancel={() => setIsFeatureModalOpen(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setIsFeatureModalOpen(false)} className="rounded-lg h-10">Cancel</AntButton>,
          <AntButton key="save" type="primary" loading={updating} onClick={handleFeatureSave} className="h-10 rounded-lg px-6 font-medium" style={{ backgroundColor: '#4f46e5' }}>
            {editingFeature ? "Save Changes" : "Add Feature"}
          </AntButton>,
        ]}
        width={720}
        centered
        destroyOnClose
        className="plan-details-modal"
        classNames={{
          header: 'dark:bg-[#0B0F19] dark:border-b dark:border-gray-800 pb-2',
          body: 'dark:bg-[#0B0F19]',
        }}
        bodyStyle={{ paddingTop: '20px' }}
      >
        <Form form={featureForm} layout="vertical" className="mt-2">
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item name="label" label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Label</span>}
                rules={[{ required: true, message: "Label is required" }]}>
                <InputField placeholder="e.g. Maximum Products" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="type" label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</span>}
                rules={[{ required: true }]}>
                <CustomSelect placeholder="Select type" options={[{ value: "number", label: "Number" }, { value: "boolean", label: "Boolean" }]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) => {
                  const isBoolean = getFieldValue('type') === 'boolean';
                  return (
                    <Form.Item
                      name="defaultValue"
                      label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Default Value</span>}
                      rules={[{ required: true, message: "Default value is required" }]}
                    >
                      {isBoolean ? (
                        <CustomSelect
                          options={[
                            { value: "true", label: "True" },
                            { value: "false", label: "False" }
                          ]}
                        />
                      ) : (
                        <InputField placeholder="e.g. 100" type="number" min={0} />
                      )}
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</span>}>
                <InputField placeholder="Short description of this feature" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="isActive" valuePropName="checked" label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active</span>}>
                <Checkbox>Feature is active</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Security Verification Modal ─────────────────────────────────── */}
      <Modal
        title={
          <span className="text-red-600 dark:text-red-400 text-lg font-bold flex items-center gap-2">
            Security Verification
          </span>
        }
        open={isVerifyModalOpen}
        onCancel={() => { setIsVerifyModalOpen(false); setVerifyPassword(""); }}
        footer={[
          <AntButton key="cancel" onClick={() => setIsVerifyModalOpen(false)}>Cancel</AntButton>,
          <AntButton key="verify" type="primary" danger loading={isVerifying} onClick={handleVerifyPassword} className="bg-red-600 hover:bg-red-700">
            Verify & Show
          </AntButton>,
        ]}
        width={400}
        centered
        className="plan-details-modal"
        classNames={{
          header: 'dark:bg-[#0B0F19] dark:border-b dark:border-gray-800 pb-2',
          body: 'dark:bg-[#0B0F19] pt-4',
        }}
      >
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            To view sensitive keys, please enter your administrative password for <strong>{profile?.email || profile?.owner?.email || profile?.user?.email}</strong>.
          </p>
          <Form layout="vertical">
            <Form.Item label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500">Administrator Password</span>} required>
              <InputField
                type="password"
                placeholder="Enter your login password"
                autoComplete="new-password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                autoFocus
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default Settings;
