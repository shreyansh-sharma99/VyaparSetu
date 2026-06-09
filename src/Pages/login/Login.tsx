import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Modal, ConfigProvider, theme } from 'antd';
import type { AppDispatch, RootState } from '@/store';
import { loginUser, forgotPassword } from '@/Pages/login/services/authSlice';
import { Input } from '@/components/layout/input';
import { Button } from '@/components/layout/button';
import { Label } from '@/components/layout/label';
import { toast } from 'react-toastify';

export default function Login() {
    const { register, handleSubmit, getValues, formState: { errors } } = useForm();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, forgotPasswordLoading } = useSelector((state: RootState) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const currentTheme = useSelector((state: RootState) => state.ui?.theme || 'light');
    const isDark = currentTheme === 'dark';
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const onSubmit = (data: any) => {
        dispatch(loginUser(data));
    };

    const handleForgotPasswordClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const emailVal = getValues('email');
        setForgotEmail(emailVal || '');
        setIsForgotModalOpen(true);
    };

    const handleSendResetLink = async () => {
        if (!forgotEmail) {
            toast.warning("Please enter your email address");
            return;
        }
        const emailPattern = /^\S+@\S+$/i;
        if (!emailPattern.test(forgotEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        try {
            const resultAction = await dispatch(forgotPassword({ email: forgotEmail }));
            if (forgotPassword.fulfilled.match(resultAction)) {
                toast.success("Password reset link sent to your email!");
                setIsForgotModalOpen(false);
                setForgotEmail('');
            } else {
                toast.error(resultAction.payload as string || "Failed to send reset link");
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
                    {/* Subtle background glow/gradient */}
                    <div className="absolute top-[-10%] left-[-10%] w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    {/* Logo at the top of the graphics card */}
                    <img
                        src="/image/logos/newLogo.png"
                        alt="VyaparSetu Logo"
                        className="w-full max-w-[250px]  object-contain drop-shadow-2xl z-10 animate-in fade-in zoom-in duration-1000"
                    />

                    <div className="text-center z-10 mb-8 space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Welcome to {import.meta.env.VITE_PLATFORM_NAME}
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                            Log in to manage your inventory, analyze sales, and oversee operations seamlessly across your business.
                        </p>
                    </div>

                    {/* Hero Illustration */}
                    {/* <img
                        src="/image/logos/logo.png"
                        alt="Dashboard Illustration"
                        className="w-full max-w-[250px] object-contain drop-shadow-2xl z-10 animate-in fade-in zoom-in duration-1000"
                    /> */}
                </div>

                {/* Right Section - Login Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-background/50 backdrop-blur-sm">
                    <div className="w-full max-w-[350px] mx-auto space-y-8">
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tighter">Sign In</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials to access your account.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center animate-in slide-in-from-top-2 duration-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid format" }
                                        })}
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 h-11 bg-muted/40 border-transparent focus:bg-background focus:border-primary/50 transition-all shadow-sm"
                                    />
                                </div>
                                {errors.email && <span className="text-xs text-destructive font-medium">{(errors.email as any).message}</span>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Password</Label>
                                    <button
                                        type="button"
                                        onClick={handleForgotPasswordClick}
                                        className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
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

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    {loading ? "Authenticating..." : "Sign In to Dashboard"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ConfigProvider
                theme={{
                    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    components: {
                        Modal: {
                            contentBg: isDark ? '#111827' : '#ffffff',
                            headerBg: isDark ? '#111827' : '#ffffff',
                        },
                    },
                }}
            >
                <Modal
                    title={
                        <div className={`flex items-center gap-2.5 pb-2 border-b border-border/44 ${isDark ? "text-gray-100" : ""}`}>
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Lock size={20} />
                            </div>
                            <span className="text-xl font-bold">Forgot Password?</span>
                        </div>
                    }
                    open={isForgotModalOpen}
                    onCancel={() => {
                        setIsForgotModalOpen(false);
                        setForgotEmail('');
                    }}
                    footer={null}
                    centered
                    width={450}
                    styles={{ body: { padding: '24px' } }}
                >
                    <div className="space-y-6 mt-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Enter the email address associated with your account and we will send you a link to reset your password.
                        </p>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendResetLink()}
                                    className="pl-10 h-11 bg-muted/40 border-transparent focus:bg-background focus:border-primary/50 transition-all shadow-sm"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsForgotModalOpen(false);
                                    setForgotEmail('');
                                }}
                                className="flex-1 h-11 text-base font-semibold border-border bg-transparent hover:bg-muted transition-all duration-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSendResetLink}
                                disabled={forgotPasswordLoading}
                                className="flex-[2] h-11 text-base font-semibold tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                            >
                                {forgotPasswordLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </ConfigProvider>
        </div>
    );
}
