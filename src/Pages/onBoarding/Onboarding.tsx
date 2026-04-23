import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../utility/Http';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiateCheckout = async (plan: Plan) => {
    if (!token) return;
    const rzpPlanId = selectedCycle[plan.name];
    if (!rzpPlanId) {
      toast.error('Please select a billing cycle');
      return;
    }

    try {
      setProcessingPlanId(plan._id);
      const res = await apiClient.post(`/onboarding/initiate`, {
        token,
        razorpayPlanId: rzpPlanId
      });

      const orderData = res.data?.data || res.data;

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: orderData.razorpayKeyId,
        subscription_id: orderData.razorpaySubscriptionId,
        name: 'Vyaparsetu',
        description: `Subscription for ${plan.name} (${orderData.billingCycle})`,
        handler: async function (response: any) {
          try {
            await verifyMandate(response.razorpay_payment_id, response.razorpay_subscription_id, response.razorpay_signature);
          } catch (verificationErr) {
            console.error(verificationErr);
            toast.error('Payment verification failed.');
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Checkout cancelled');
            setProcessingPlanId(null);
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setProcessingPlanId(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initiate checkout.');
      setProcessingPlanId(null);
    }
  };

  const verifyMandate = async (paymentId: string, subscriptionId: string, signature: string) => {
    try {
      await apiClient.post(`/onboarding/verify`, {
        token,
        razorpayPaymentId: paymentId,
        razorpaySubscriptionId: subscriptionId,
        razorpaySignature: signature
      });

      setSuccess(true);
      toast.success('Account activated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Verification failed.');
      setProcessingPlanId(null);
    }
  };

  // --- 1) Loading UI ---
  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-8" />
          <p className="text-sm text-slate-500 font-bold tracking-[0.4em] uppercase">Securing Connection</p>
        </div>
      </div>
    );
  }

  // --- 2) Success UI ---
  if (success) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-white p-4 font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="relative z-10 bg-white/80 backdrop-blur-3xl p-12 rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-lg w-full flex flex-col items-center animate-in slide-in-from-bottom-12 fade-in duration-1000">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-emerald-100/50">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter text-center uppercase">
            Account Active
          </h1>
          <p className="text-lg text-slate-600 mb-8 text-center leading-relaxed font-light">
            Welcome to the elite tier. Your workspace has been synchronized and is ready for deployment.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-10 text-slate-600 text-sm w-full text-center">
            Credentials sent to:<br />
            <span className="font-bold text-slate-900 text-base mt-2 inline-block">{adminEmail || 'your email'}</span>
          </div>
          <button
            onClick={() => {
              window.location.href = import.meta.env.VITE_ADMIN_FRONTEND_URL
                ? `${import.meta.env.VITE_ADMIN_FRONTEND_URL}/login`
                : '/login';
            }}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-lg shadow-xl active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
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
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-100 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 bg-white/90 backdrop-blur-2xl p-10 rounded-3xl border border-white shadow-xl max-w-md w-full flex flex-col items-center animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter uppercase">Link Error</h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-light">{errorMsg}</p>
          <a href="/" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all font-bold active:scale-95 uppercase tracking-widest text-xs">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // --- 4) Main Pricing UI ---
  return (
    <div className="relative min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-32 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .grid-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .premium-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 
            0 20px 40px -15px rgba(0,0,0,0.05),
            inset 0 0 0 1px rgba(255,255,255,0.5);
        }
        .text-gradient {
          background: linear-gradient(to right, #2563eb, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Futuristic White Theme Background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-100/50 blur-[120px] pointer-events-none animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-24 animate-in slide-in-from-top-8 fade-in duration-1000 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Premium Onboarding</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1]">
            Welcome{adminName ? `, ${adminName.split(' ')[0]}` : ''}.<br />
            <span className="text-gradient">Choose Your Growth Path.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
            Scalable, hyper-optimized infrastructure for high-performance teams. <br className="hidden md:block" />
            Join our elite network of growing businesses today.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="bg-white border border-slate-200 p-12 rounded-[2rem] text-slate-400 shadow-sm text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-bold uppercase tracking-widest">Scanning protocols...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto animate-in slide-in-from-bottom-12 fade-in delay-300 duration-1000 fill-mode-both">
            {plans.map((plan) => {
              const isFeatured = plan.name.toLowerCase().includes('pro');

              return (
                <div
                  key={plan.name}
                  className={`group flex flex-col relative rounded-[3rem] overflow-hidden transition-all duration-500 hover:-translate-y-4 ${isFeatured
                    ? 'premium-card border-indigo-200 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] ring-1 ring-indigo-100'
                    : 'premium-card hover:border-slate-300 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]'
                    }`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  )}
                  
                  {isFeatured && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 px-4 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="px-8 py-12 pb-10 relative z-10">
                    <h3 className={`text-4xl font-black text-slate-900 mb-4 tracking-tighter ${isFeatured ? 'pr-24' : ''}`}>
                      {plan.name}
                    </h3>

                    {plan.trial?.enabled ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6">
                        {plan.trial.durationDays} Days Free Trial
                      </div>
                    ) : (
                      <div className="h-4 mb-6" />
                    )}

                    {/* Optimized Cycle Selector (Big & Prominent) */}
                    <div className="mt-10 bg-slate-100/50 p-1.5 rounded-2xl flex border border-slate-200/60 relative shadow-inner">
                      {plan.billingCycles?.map((cycle) => {
                        const isSelected = selectedCycle[plan.name] === cycle.razorpayPlanId;
                        return (
                          <button
                            key={cycle.razorpayPlanId}
                            onClick={() => setSelectedCycle(prev => ({ ...prev, [plan.name]: cycle.razorpayPlanId }))}
                            className={`flex-1 relative py-3.5 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all duration-500 z-10 flex flex-col items-center justify-center gap-1.5 ${isSelected
                              ? 'text-slate-900'
                              : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200 -z-10 animate-in fade-in zoom-in-95 duration-300" />
                            )}
                            <span className="whitespace-nowrap tracking-tight">{cycle.label}</span>
                            {cycle.discountPercent > 0 && (
                              <span className="text-[9px] leading-none text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 font-bold">
                                -{cycle.discountPercent}%
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Section */}
                    <div className="mt-12 flex items-baseline gap-3">
                      <span className="text-7xl font-black text-slate-900 tracking-tighter group-hover:text-gradient transition-all duration-700">
                        <span className="text-3xl text-slate-400 font-bold mr-1">₹</span>
                        {(() => {
                          const cycle = plan.billingCycles?.find(c => c.razorpayPlanId === selectedCycle[plan.name]);
                          if (!cycle || !plan.basePrice) return '0';
                          const discountedPrice = plan.basePrice * (1 - ((cycle.discountPercent || 0) / 100));
                          return (discountedPrice / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                        })()}
                      </span>
                      <span className="text-slate-400 text-xl font-medium tracking-tight">/mo</span>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="px-8 pb-12 flex flex-col flex-1 relative z-10">
                    <div className="h-[1px] w-full bg-slate-100 mb-8" />
                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.limits && Object.entries(plan.limits).map(([key, value]) => (
                        <li key={key} className="flex items-start text-sm group/item">
                          <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-indigo-500 mr-3 transition-transform group-hover/item:scale-110" />
                          <span className="text-slate-600 leading-tight">
                            <strong className="text-slate-900 capitalize font-bold tracking-tight">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
                            {value === null || value === -1 ? 'Unlimited' : String(value)}
                          </span>
                        </li>
                      ))}
                      {plan.features && Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-center text-sm group/item">
                          <CheckCircle2
                            className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${value ? "text-indigo-500" : "text-slate-200"
                              }`}
                          />
                          <span className={value ? "text-slate-600" : "text-slate-300 line-through font-light"}>
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleInitiateCheckout(plan)}
                      disabled={processingPlanId !== null}
                      className={`w-full py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 flex items-center justify-center shadow-lg relative overflow-hidden ${processingPlanId !== null
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isFeatured
                          ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-2xl active:scale-95'
                          : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-md hover:shadow-xl'
                        }`}
                    >
                      {processingPlanId === plan._id ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        'Get Started'
                      )}
                    </button>
                    <p className="text-[9px] text-center text-slate-400 mt-5 font-bold uppercase tracking-widest opacity-60">
                      Protected by Razorpay Security
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
