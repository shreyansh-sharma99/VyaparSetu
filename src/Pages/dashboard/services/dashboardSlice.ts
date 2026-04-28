import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardData } from './dashboardServices';

export interface DashboardData {
    generatedAt: string;
    revenue: {
        mrr: { paise: number; inr: string };
        arr: { paise: number; inr: string };
        totalCollected: { paise: number; inr: string; invoiceCount: number };
        totalPending: { paise: number; inr: string; invoiceCount: number };
        totalFailed: { paise: number; inr: string; invoiceCount: number };
        thisMonthRevenue: { paise: number; inr: string };
        lastMonthRevenue: { paise: number; inr: string };
        mrrGrowthPercent: number | null;
        monthlyTrend: Array<{
            invoiceCount: number;
            year: number;
            month: number;
            totalPaise: number;
            totalINR: number;
        }>;
        byPlan: Array<{
            _id: string;
            planName: string;
            totalPaise: number;
            totalINR: number;
            invoiceCount: number;
        }>;
        byTenure: Array<{
            tenure: string;
            totalPaise: number;
            totalINR: string;
            count: number;
        }>;
    };
    admins: {
        totals: {
            total: number;
            active: number;
            trialing: number;
            pastDue: number;
            cancelled: number;
            expired: number;
            pendingPayment: number;
            pendingOnboarding: number;
        };
        growth: {
            newToday: number;
            newThisMonth: number;
        };
        churnRatePercent: string;
        atRiskCount: number;
        atRiskAdmins: any[];
        byPlan: Array<{
            _id: string | null;
            count: number;
            planName: string;
        }>;
            recentSignups: Array<{
                _id: string;
                name: string;
                email: string;
                businessName: string;
                subscription: { status: string };
                subscriptionStatus: string;
                trialExtensionsCount: number;
                onboardingStatus: string;
                isActive: boolean;
                createdAt: string;
                canExtend: boolean;
                plan?: {
                    _id: string;
                    name: string;
                    basePrice: number;
                };
                planTenure?: string;
            }>;
        };
    subscriptions: {
        totals: {
            total: number;
            active: number;
            trialing: number;
            cancelled: number;
        };
        thisMonth: {
            newSubscriptions: number;
            cancellations: number;
            upgrades: number;
            netNew: number;
        };
        byTenure: Array<{ tenure: string; count: number }>;
        byPlan: Array<{ _id: string; count: number; planName: string }>;
        recentActivity: Array<{
            _id: string;
            adminId: { _id: string; name: string; email: string };
            planId: { _id: string; name: string; basePrice: number };
            tenure: string;
            status: string;
            startDate: string;
            endDate: string;
            history: Array<{
                action: string;
                toPlanId?: string;
                note: string;
                performedBy: string;
                date: string;
            }>;
            updatedAt: string;
        }>;
    };
    invoices: {
        byStatus: {
            paid: { count: number; totalPaise: number; totalINR: string };
            pending: { count: number; totalPaise: number; totalINR: string };
            free: { count: number; totalPaise: number; totalINR: string };
        };
        overdue: { count: number; totalPaise: number; totalINR: string };
        agingBuckets: {
            [key: string]: { paise: number; inr: string };
        };
        recentInvoices: Array<{
            _id: string;
            invoiceNumber: string;
            adminId: { _id: string; name: string; email: string };
            planId: { _id: string; name: string };
            tenure: string;
            totalAmount: number;
            currency: string;
            status: string;
            dueDate: string;
            paidAt?: string;
            razorpayPaymentId?: string;
            dunningCount: number;
            createdAt: string;
        }>;
    };
    plans: {
        totalPlans: number;
        activePlans: number;
        plans: Array<{
            _id: string;
            name: string;
            basePricePaise: number;
            basePriceINR: string;
            isActive: boolean;
            isFeatured: boolean;
            trialDays: number;
        }>;
        adoption: Array<{
            _id: string;
            total: number;
            active: number;
            trialing: number;
            planName: string;
            basePricePaise: number;
        }>;
        mostPopularPlan: { name: string; totalAdmins: number };
    };
    reconciliation: {
        totalDiscrepanciesLast7Days: number;
        actionBreakdown: any;
        recentRuns: any[];
    };
    activity: {
        recentAuditLogs: Array<{
            _id: string;
            adminId: { _id: string; name: string; email: string };
            action: string;
            note: string;
            performedBy: string;
            createdAt: string;
            metadata?: any;
        }>;
        paymentEventStats: { failed: number; ignored: number; success: number };
        recentPaymentEvents: Array<{
            _id: string;
            event: string;
            razorpayEventId: string | null;
            status: string;
            createdAt: string;
            adminId?: { _id: string; name: string; email: string };
        }>;
    };
}

interface DashboardState {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    loading: false,
    error: null,
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getDashboardData();
            if (response.success) {
                return response.data;
            } else {
                return rejectWithValue(response.message || 'Failed to fetch dashboard data');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
