import Http from "@/utility/Http";

export const getRolesService = async (page: number = 1, limit: number = 10, search: string = "") => {
    let url = `/owner/roles?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return await Http.get(url);
};

export const createRoleService = async (roleData: any) => {
    return await Http.post(`/owner/roles`, roleData);
};

export const getRoleByIdService = async (id: string) => {
    return await Http.get(`/owner/roles/${id}`);
};

export const updateRoleService = async (id: string, roleData: any) => {
    return await Http.put(`/owner/roles/${id}`, roleData);
};

export const deleteRoleService = async (id: string) => {
    return await Http.delete(`/owner/roles/${id}`);
};
