import Http from "@/utility/Http";

export const getSubscriptionsService = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status?: string,
  tenure?: string
) => {
  let url = `/owner/subscriptions?page=${page}&limit=${limit}`;
  if (search) url += `&search=${search}`;
  if (status && status !== "all") url += `&status=${status}`;
  if (tenure && tenure !== "all") url += `&tenure=${tenure}`;
  return await Http.get(url);
};

export const getSubscriptionByIdService = async (id: string) => {
  return await Http.get(`/owner/subscriptions/${id}`);
};

// Placeholder for future edit service if needed
export const updateSubscriptionService = async (id: string, data: any) => {
  return await Http.patch(`/owner/subscriptions/${id}`, data);
};

export const upgradeSubscriptionService = async (id: string, data: { planId: string; tenure: string }) => {
  return await Http.post(`/owner/subscriptions/${id}/upgrade`, data);
};

export const cancelSubscriptionService = async (id: string) => {
  return await Http.post(`/owner/subscriptions/${id}/cancel`, {});
};

export const extendSubscriptionService = async (id: string, data: { days: number }) => {
  return await Http.post(`/owner/subscriptions/${id}/extend`, data);
};
