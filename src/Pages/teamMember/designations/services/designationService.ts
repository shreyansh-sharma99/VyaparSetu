import Http from "../../../../utility/Http";

export const getDesignationsService = async (page: number = 1, limit: number = 10, search: string = "") => {
    let url = `/owner/designations?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return await Http.get(url);
};

export const createDesignationService = async (data: any) => {
    return await Http.post(`/owner/designations`, data);
};

export const getDesignationByIdService = async (id: string) => {
    return await Http.get(`/owner/designations/${id}`);
};

export const updateDesignationService = async (id: string, data: any) => {
    return await Http.put(`/owner/designations/${id}`, data);
};

export const deleteDesignationService = async (id: string) => {
    return await Http.delete(`/owner/designations/${id}`);
};
