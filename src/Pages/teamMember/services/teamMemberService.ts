import Http from "@/utility/Http";

export const getTeamMembersService = async (page: number = 1, limit: number = 10, search: string = "") => {
    let url = `/owner/team?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return await Http.get(url);
};

export const createTeamMemberService = async (teamMemberData: any) => {
    return await Http.post(`/owner/team`, teamMemberData);
};

export const getTeamMemberByIdService = async (id: string) => {
    return await Http.get(`/owner/team/${id}`);
};

export const updateTeamMemberService = async (id: string, teamMemberData: any) => {
    return await Http.patch(`/owner/team/${id}`, teamMemberData);
};

export const deleteTeamMemberService = async (id: string) => {
    return await Http.delete(`/owner/team/${id}`);
};
