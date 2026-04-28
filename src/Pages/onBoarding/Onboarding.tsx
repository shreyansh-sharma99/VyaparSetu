import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../utility/Http';
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';

const hasTrial = (plan: Plan) =>
  plan.trial?.enabled === true && (plan.trial?.durationDays ?? 0) > 0;

interface BillingCycle {
  tenure: string;
  durationMonths: number;
  discountPercent: number;
  label: string;
  razorpayPlanId: string;
}

interface Plan {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  trial: { enabled: boolean; durationDays: number };
  billingCycles: BillingCycle[];
  limits: any;
  features: any;
}

export default function Onboarding() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<{ [planName: string]: string }>({}); // planName -> razorpayPlanId
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No onboarding token provided in URL.');
      setLoading(false);
      return;
    }

    validateTokenAndFetchPlans();
  }, [token]);

  const validateTokenAndFetchPlans = async () => {
    try {
      // 1. Validate Token First
      const valRes = await apiClient.get(`/onboarding/validate-token?token=${token}`);
      const valData = valRes.data?.data || valRes.data;

      // If the backend returns a 200 OK but explicitly says valid: false
      if (valData && valData.valid === false) {
        setErrorMsg('Link expired, already used, or account not found.');
        setLoading(false);
        return;
      }

      if (valData && valData.adminName) {
        setAdminName(valData.adminName);
      }
      if (valData && valData.adminEmail) {
        setAdminEmail(valData.adminEmail);
      }

    } catch (err: any) {
      console.error("Validation Error:", err);
      setErrorMsg(err.response?.data?.message || 'Link expired, already used, or account not found.');
      setLoading(false);
      return;
    }

    try {
      // 2. Fetch Plans if token is valid
      const plansRes = await apiClient.get(`/onboarding/plans?token=${token}`);
      const plansDataObj = plansRes.data?.data || plansRes.data || {};
      const fetchedPlans: Plan[] = Array.isArray(plansDataObj)
        ? plansDataObj
        : (Array.isArray(plansDataObj.plans) ? plansDataObj.plans : []);

      setPlans(fetchedPlans);

      // Pre-select the first billing cycle for each plan
      const initialSelectedCycles: { [key: string]: string } = {};
      fetchedPlans.forEach((plan: Plan) => {
        if (plan.billingCycles?.length > 0) {
          initialSelectedCycles[plan.name] = plan.billingCycles[0].razorpayPlanId;
        }
      });
      setSelectedCycle(initialSelectedCycles);

    } catch (err: any) {
      console.error("Plans Fetch Error:", err);
      // We don't mark the whole link as invalid here, just explain plans failed to load
      toast.error(err.response?.data?.message || 'Failed to fetch available plans.');
    } finally {
      setLoading(false);
    }
  };

  // ── Free trial handler (no card, pure DB) ────────────────────────────────
  const handleStartTrial = async (plan: Plan) => {
    if (!token) return;
    const rzpPlanId = selectedCycle[plan.name];
    if (!rzpPlanId) { toast.error('Please select a billing cycle'); return; }
    const cycle = plan.billingCycles.find(c => c.razorpayPlanId === rzpPlanId);
    if (!cycle) { toast.error('Invalid cycle selected'); return; }
    try {
      setProcessingPlanId(plan._id);
      await apiClient.post('/onboarding/start-trial', { token, planId: plan._id, tenure: cycle.tenure });
      setSuccess(true);
      toast.success('Free trial started successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to start trial.');
      setProcessingPlanId(null);
    }
  };

  // ── Razorpay checkout handler (no-trial / paid plans) ────────────────────
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const verifyMandate = async (paymentId: string, subscriptionId: string, signature: string) => {
    try {
      await apiClient.post('/onboarding/verify', {
        token,
        razorpayPaymentId: paymentId,
        razorpaySubscriptionId: subscriptionId,
        razorpaySignature: signature,
      });
      setSuccess(true);
      toast.success('Account activated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Verification failed.');
      setProcessingPlanId(null);
    }
  };

  const handleInitiateCheckout = async (plan: Plan) => {
    if (!token) return;
    const rzpPlanId = selectedCycle[plan.name];
    if (!rzpPlanId) { toast.error('Please select a billing cycle'); return; }
    try {
      setProcessingPlanId(plan._id);
      const res = await apiClient.post('/onboarding/initiate', { token, razorpayPlanId: rzpPlanId });
      const orderData = res.data?.data || res.data;
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Razorpay SDK failed to load.'); setProcessingPlanId(null); return; }
      const rzp = new (window as any).Razorpay({
        key: orderData.razorpayKeyId,
        subscription_id: orderData.razorpaySubscriptionId,
        name: 'Vyaparsetu',
        description: `${plan.name} (${orderData.billingCycle})`,
        handler: async (response: any) => {
          try {
            await verifyMandate(
              response.razorpay_payment_id,
              response.razorpay_subscription_id,
              response.razorpay_signature,
            );
          } catch { setProcessingPlanId(null); }
        },
        modal: { ondismiss: () => { toast.info('Checkout cancelled'); setProcessingPlanId(null); } },
        theme: { color: '#3B82F6' },
      });
      rzp.on('payment.failed', (r: any) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setProcessingPlanId(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initiate checkout.');
      setProcessingPlanId(null);
    }
  };

  /** Single dispatcher — routes to correct handler based on plan type */
  const handleSelectPlan = (plan: Plan) =>
    hasTrial(plan) ? handleStartTrial(plan) : handleInitiateCheckout(plan);

  // --- 1) Loading UI ---
  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030712] overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mb-8" />
          <p className="text-sm text-neutral-400 font-bold tracking-[0.4em] uppercase">Initializing Secure Link</p>
        </div>
      </div>
    );
  }

  // --- 2) Success UI ---
  if (success) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030712] p-4 font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-[20%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-[20%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="relative z-10 bg-white/[0.02] backdrop-blur-3xl p-12 rounded-[2rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] max-w-lg w-full flex flex-col items-center animate-in slide-in-from-bottom-12 fade-in duration-1000">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 shadow-inner border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight text-center">
            Workspace Deployed
          </h1>
          <p className="text-lg text-neutral-400 mb-8 text-center leading-relaxed font-light">
            Welcome to the elite tier. Your infrastructure has been successfully provisioned.
          </p>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-10 text-neutral-400 text-sm w-full text-center">
            Credentials sent to:<br />
            <span className="font-medium text-white text-base mt-2 inline-block">{adminEmail || 'your email'}</span>
          </div>
          <button
            onClick={() => {
              window.location.href = import.meta.env.VITE_ADMIN_FRONTEND_URL
                ? `${import.meta.env.VITE_ADMIN_FRONTEND_URL}/login`
                : '/login';
            }}
            className="w-full py-5 bg-white text-black rounded-2xl hover:bg-neutral-200 transition-all font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 flex items-center justify-center gap-3 tracking-wide"
          >
            Access Dashboard
            <span className="text-xl">&rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  // --- 3) Error UI ---
  if (errorMsg) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030712] px-4 text-center font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 bg-white/[0.02] backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-2xl max-w-md w-full flex flex-col items-center animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
            <AlertCircle className="w-10 h-10 text-rose-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">Access Denied</h1>
          <p className="text-neutral-400 mb-10 leading-relaxed font-light">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // --- 4) Main Pricing UI ---
  return (
    <div className="relative min-h-screen bg-[#030712] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-32 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .grid-bg {
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          background-position: -19px -19px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
        .premium-card {
          background: rgba(20,20,20,0.5);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5);
        }
        .premium-card:hover {
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.05);
        }
        .text-gradient {
          background: linear-gradient(to right, #ffffff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-gradient-primary {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Cinematic Dark Backgrounds */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="text-center mb-28 animate-in slide-in-from-top-8 fade-in duration-1000 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">Enterprise Onboarding</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Welcome{adminName ? `, ${adminName.split(' ')[0]}` : ''}.<br />
            <span className="text-gradient">Choose Your Scale.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            Next-generation infrastructure tailored for peak performance. <br className="hidden md:block" />
            Select a tier and initialize your workspace instantly.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] text-neutral-500 shadow-2xl text-center backdrop-blur-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-neutral-400" />
              <p className="text-sm font-medium uppercase tracking-widest">Fetching configurations...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto animate-in slide-in-from-bottom-12 fade-in delay-300 duration-1000 fill-mode-both">
            {plans.map((plan) => {
              const isFeatured = plan.name.toLowerCase().includes('pro');

              return (
                <div
                  key={plan.name}
                  className={`group flex flex-col relative rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 ${isFeatured
                    ? 'premium-card border-indigo-500/30 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.2)]'
                    : 'premium-card'
                    }`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  )}

                  {isFeatured && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        Recommended
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="px-8 py-10 pb-8 relative z-10">
                    <h3 className={`text-3xl font-bold text-white mb-4 tracking-tight ${isFeatured ? 'pr-24' : ''}`}>
                      {plan.name}
                    </h3>

                    {hasTrial(plan) ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        {plan.trial.durationDays} Days Free Trial
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        <CreditCard className="w-3 h-3" />
                        Pay &amp; Activate
                      </div>
                    )}

                    {/* Minimalist Dark Cycle Selector */}
                    <div className="mt-8 bg-black/40 p-1.5 rounded-xl flex border border-white/5 relative shadow-inner">
                      {plan.billingCycles?.map((cycle) => {
                        const isSelected = selectedCycle[plan.name] === cycle.razorpayPlanId;
                        return (
                          <button
                            key={cycle.razorpayPlanId}
                            onClick={() => setSelectedCycle(prev => ({ ...prev, [plan.name]: cycle.razorpayPlanId }))}
                            className={`flex-1 relative py-3 px-1 rounded-lg text-xs font-bold uppercase transition-all duration-300 z-10 flex flex-col items-center justify-center gap-1 ${isSelected
                              ? 'text-white'
                              : 'text-neutral-500 hover:text-neutral-300'
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-white/10 rounded-lg shadow-md border border-white/10 -z-10 animate-in fade-in zoom-in-95 duration-200" />
                            )}
                            <span className="tracking-widest">{cycle.label}</span>
                            {cycle.discountPercent > 0 && (
                              <span className="text-[10px] leading-none text-emerald-400 mt-1 font-medium">
                                Save {cycle.discountPercent}%
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Section */}
                    <div className="mt-10 flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-white tracking-tighter transition-all duration-500">
                        <span className="text-3xl text-neutral-500 font-medium mr-1 tracking-normal">₹</span>
                        {(() => {
                          const cycle = plan.billingCycles?.find(c => c.razorpayPlanId === selectedCycle[plan.name]);
                          if (!cycle || !plan.basePrice) return '0';
                          const discountedPrice = plan.basePrice * (1 - ((cycle.discountPercent || 0) / 100));
                          return (discountedPrice / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                        })()}
                      </span>
                      <span className="text-neutral-500 text-lg font-medium">/mo</span>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="px-8 pb-10 flex flex-col flex-1 relative z-10">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.limits && Object.entries(plan.limits).map(([key, value]) => (
                        <li key={key} className="flex items-start text-sm group/item">
                          <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-400 mr-3 opacity-80" />
                          <span className="text-neutral-400">
                            <strong className="text-neutral-200 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
                            {value === null || value === -1 ? 'Unlimited' : String(value)}
                          </span>
                        </li>
                      ))}
                      {plan.features && Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-center text-sm group/item">
                          <CheckCircle2
                            className={`flex-shrink-0 w-5 h-5 mr-3 ${value ? "text-indigo-400 opacity-80" : "text-neutral-800"}`}
                          />
                          <span className={value ? "text-neutral-400" : "text-neutral-600 line-through"}>
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={processingPlanId !== null}
                      className={`w-full py-4 px-8 rounded-xl font-bold uppercase tracking-widest text-[12px] transition-all duration-300 flex items-center justify-center relative overflow-hidden ${processingPlanId !== null
                        ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                        : isFeatured
                          ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95'
                          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-95 hover:border-white/20'
                        }`}
                    >
                      {processingPlanId === plan._id ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing</span>
                        </div>
                      ) : hasTrial(plan) ? (
                        'Initialize Trial'
                      ) : (
                        'Deploy Workspace'
                      )}
                    </button>
                    <p className="text-[10px] text-center text-neutral-500 mt-4 font-medium uppercase tracking-widest">
                      {hasTrial(plan) ? 'No Credit Card Required' : 'Secured by Razorpay'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
