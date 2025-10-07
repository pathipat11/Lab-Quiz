import { apiGet } from "./api";

export type ClassMember = {
    _id: string;
    firstname: string;
    lastname: string;
    email?: string;
    education?: { studentId?: string };
};

export const getMembersByYear = async (year: number | string) => {
    const res: any = await apiGet(`/class/${year}`);
    // บางระบบหุ้มด้วย data
    return (res?.data ?? res) as ClassMember[];
};
