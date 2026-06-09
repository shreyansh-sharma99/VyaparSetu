import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { resetPassword } from '@/Pages/login/services/authSlice';
import { Input } from '@/components/layout/input';
import { Button } from '@/components/layout/button';
import { Label } from '@/components/layout/label';
import { toast } from 'react-toastify';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { resetPasswordLoading } = useSelector((state: RootState) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (data: any) => {
        if (!token) {
            toast.error("Invalid token. Please check your reset link.");
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const resultAction = await dispatch(resetPassword({
                token,
                password: data.password
            }));

            if (resetPassword.fulfilled.match(resultAction)) {
                toast.success("Password reset successfully!");
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(resultAction.payload as string || "Failed to reset password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 selection:bg-primary/20">
            <div className="w-full max-w-[1000px] h-[600px] bg-card rounded-[2rem] shadow-2xl flex overflow-hidden border border-border/50 relative z-10">

                {/* Left Section - Graphic / Branding */}
                <div className="hidden md:flex md:w-1/2 relative bg-primary/5 flex-col items-center justify-center p-12 overflow-hidden border-r border-border/50">
                    <div className="absolute top-[-10%] left-[-10%] w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <img
                        src="/image/logos/newLogo.png"
                        alt="VyaparSetu Logo"
                        className="w-full max-w-[250px] object-contain drop-shadow-2xl z-10 animate-in fade-in zoom-in duration-1000"
                    />

                    <div className="text-center z-10 mb-8 space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Secure Your Account
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                            Create a strong, new password to access your dashboard. Keep it secure and private.
                        </p>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-background/50 backdrop-blur-sm">
                    <div className="w-full max-w-[350px] mx-auto space-y-8">
                        {!token ? (
                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                                    <AlertCircle size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold tracking-tighter">Invalid Link</h1>
                                    <p className="text-sm text-muted-foreground">
                                        This password reset link is missing a secure token or is invalid. Please request a new link.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full h-11 text-base font-semibold"
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        ) : isSuccess ? (
                            <div className="space-y-6 text-center animate-in fade-in duration-500">
                                <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold tracking-tighter">Password Reset</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Your password has been reset successfully. Redirecting you to the Sign In page...
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full h-11 text-base font-semibold"
                                >
                                    Sign In Now
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h1 className="text-3xl font-bold tracking-tighter">Reset Password</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Please enter your new password below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: { value: 6, message: "At least 6 characters required" }
                                                })}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-muted/40 border-transparent focus:bg-background focus:border-primary/50 transition-all shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <span className="text-xs text-destructive font-medium">{(errors.password as any).message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                    minLength: { value: 6, message: "At least 6 characters required" }
                                                })}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-muted/40 border-transparent focus:bg-background focus:border-primary/50 transition-all shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <span className="text-xs text-destructive font-medium">{(errors.confirmPassword as any).message}</span>}
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                                            disabled={resetPasswordLoading}
                                        >
                                            {resetPasswordLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                            {resetPasswordLoading ? "Saving Password..." : "Reset Password"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
