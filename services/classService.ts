import { apiGet } from "./api";

export type ClassMember = {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    image?: string;
    role: string;
    type: string;
    confirmed: boolean;
    education?: {
        major?: string;
        enrollmentYear?: string;
        studentId?: string;
        schoolId?: string;
        school?: {
            _id: string;
            name: string;
            province?: string;
            logo?: string;
        };
        advisorId?: string;
        advisor?: {
            _id: string;
            name: string;
            email: string;
            image?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
};

export async function getMembersByYear(year: string): Promise<ClassMember[]> {
    const res = await apiGet(`/class/${year}`);
    return res?.data ?? []; // API คืน {data:[...]}
}