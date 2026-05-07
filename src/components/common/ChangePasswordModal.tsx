import React, { useState } from 'react';
import { Modal } from 'antd';
import { ShieldCheck, User, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginApi } from "@/Pages/login/services/authService";
import { changePassword } from "@/Pages/login/services/authSlice";
import type { AppDispatch, RootState } from '@/store';
import InputField from "@/components/form/input/InputField";
import { Label } from '@/components/layout/label';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);
  const { changingPassword } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setStep(1);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsVerifying(false);
  };

  const handleVerifyOldPassword = async () => {
    if (!oldPassword) {
      toast.warning("Please enter your old password");
      return;
    }

    setIsVerifying(true);
    try {
      const userEmail = profile?.email || profile?.owner?.email || profile?.user?.email;
      if (!userEmail) {
        toast.error("User email not found. Please try logging in again.");
        return;
      }

      const response = await loginApi({ email: userEmail, password: oldPassword });
      if (response.success) {
        setStep(2);
        toast.success("Identity verified. Now enter your new password.");
      } else {
        toast.error("Verification failed. Incorrect password.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
        toast.warning("Password must be at least 6 characters long");
        return;
    }

    try {
      const resultAction = await dispatch(changePassword({ 
        currentPassword: oldPassword, 
        newPassword 
      }));
      
      if (changePassword.fulfilled.match(resultAction)) {
        toast.success("Password changed successfully");
        onClose();
        resetForm();
      } else {
        toast.error(resultAction.payload as string || "Failed to change password");
      }
    } catch (err) {
      toast.error("An error occurred while changing password");
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={20} />
          <span className="text-xl font-bold">Change Password</span>
        </div>
      }
      open={isOpen}
      onCancel={() => {
        onClose();
        resetForm();
      }}
      footer={null}
      centered
      width={450}
      styles={{ body: { padding: '24px' } }}
    >
      <div className="space-y-6">
        {step === 1 ? (
          <>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                To protect your account, please verify your identity by entering your current password.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Current Password
                </Label>
                <div className="relative">
                  <InputField
                    type={showOld ? "text" : "password"}
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOldPassword()}
                    className="!rounded-xl pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <User className="text-blue-500" size={18} />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 truncate">
                  {profile?.email || profile?.owner?.email || profile?.user?.email}
                </span>
              </div>

              <button
                onClick={handleVerifyOldPassword}
                disabled={isVerifying}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verification successful. Please enter your new password below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  New Password
                </Label>
                <div className="relative">
                  <InputField
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="!rounded-xl pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <InputField
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                    className="!rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
