import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchSettings, updateSettingsAction } from "./services/settingsSlice";
import { fetchUserProfile } from "@/Pages/login/services/userSlice";
import ComponentCard from "@/components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/UI/table";
import PageMeta from "@/components/common/PageMeta";
import Loader from "@/components/UI/Loader";
import { EditIcon, Eyeicon } from "@/icons/icons";
import { Modal, Form, Button as AntButton, message, Row, Col, Checkbox } from "antd";
import InputField from "@/components/form/input/InputField";
import { RefreshCcw } from "lucide-react";
import { loginApi } from "@/Pages/login/services/authService";

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error, updating } = useSelector((state: RootState) => state.settings);
  const { profile } = useSelector((state: RootState) => state.user);

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

  useEffect(() => {
    dispatch(fetchSettings());
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  const handleEditClick = (section: string, data: any) => {
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
        message.success(`${editSection?.charAt(0).toUpperCase()}${editSection?.slice(1)} settings updated successfully`);
        setIsModalOpen(false);
        // Refetch settings after successful update
        dispatch(fetchSettings());
      } else {
        message.error(resultAction.payload as string || "Failed to update settings");
      }
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      message.warning("Please enter your password");
      return;
    }

    setIsVerifying(true);
    try {
      const userEmail = profile?.email || profile?.owner?.email || profile?.user?.email;

      if (!userEmail) {
        message.error("User email not found. Please try logging in again.");
        return;
      }

      const credentials = {
        email: userEmail,
        password: verifyPassword
      };

      const response = await loginApi(credentials);
      if (response.success) {
        setIsSecretsRevealed(true);
        setIsVerifyModalOpen(false);
        setVerifyPassword("");
        message.success("Identity verified. Secrets unmasked.");
      } else {
        message.error("Verification failed. Incorrect password.");
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleFieldVisibility = (key: string) => {
    setShowFieldSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
            onClick={() => handleEditClick(sectionKey, data)}
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

  return (
    <>
      <PageMeta title="Settings | Vyapar Setu" description="Platform settings and configurations" />

      <div className=" space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
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
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">
            Edit {editSection?.charAt(0).toUpperCase()}{editSection?.slice(1)} Settings
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setIsModalOpen(false)} className="rounded-lg h-10">
            Cancel
          </AntButton>,
          <AntButton
            key="save"
            type="primary"
            loading={updating}
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 h-10 rounded-lg px-6 font-medium"
          >
            Save Changes
          </AntButton>
        ]}
        width={800}
        centered
        destroyOnClose
        bodyStyle={{ paddingTop: '20px' }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-2"
        >
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
                              if (isSecretsRevealed) {
                                toggleFieldVisibility(key);
                              } else {
                                setIsVerifyModalOpen(true);
                              }
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

      {/* Security Verification Modal */}
      <Modal
        title={
          <span className="text-red-600 dark:text-red-400 text-lg font-bold flex items-center gap-2">
            Security Verification
          </span>
        }
        open={isVerifyModalOpen}
        onCancel={() => {
          setIsVerifyModalOpen(false);
          setVerifyPassword("");
        }}
        footer={[
          <AntButton key="cancel" onClick={() => setIsVerifyModalOpen(false)}>
            Cancel
          </AntButton>,
          <AntButton
            key="verify"
            type="primary"
            danger
            loading={isVerifying}
            onClick={handleVerifyPassword}
            className="bg-red-600 hover:bg-red-700"
          >
            Verify & Show
          </AntButton>
        ]}
        width={400}
        centered
      >
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            To view sensitive keys, please enter your administrative password for <strong>{profile?.email || profile?.owner?.email || profile?.user?.email}</strong>.
          </p>
          <Form layout="vertical">
            <Form.Item
              label={<span className="text-xs font-bold uppercase tracking-wider text-gray-500">Administrator Password</span>}
              required
            >
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
    </>
  );
};

export default Settings;
