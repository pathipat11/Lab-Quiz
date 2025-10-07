import { apiGet, apiPost, apiDelete } from "./api";

export type CreatedBy =
    | string
    | { _id?: string; name?: string; email?: string; image?: string };

export type CommentItem = {
    _id: string;
    content: string;
    createdBy: CreatedBy;
    createdAt: string;
};

export type StatusItem = {
    _id: string;
    content: string;
    createdBy: CreatedBy;
    like?: Array<string | { _id?: string; name?: string; email?: string; image?: string }>;
    likeCount?: number;
    hasLiked: boolean;
    comment: CommentItem[];
    createdAt: string;
    updatedAt?: string;
};

// helper: แปลง createdBy ให้เป็นข้อความ
export const displayName = (cb: CreatedBy | undefined) => {
    if (!cb) return "Unknown";
    if (typeof cb === "string") return cb;
    return cb.name || cb.email || cb._id || "Unknown";
};

export async function listStatuses(): Promise<StatusItem[]> {
    const res = await apiGet("/status"); // -> { data: [...] }
    return res?.data ?? [];
}

export async function createStatus(content: string) {
    await apiPost("/status", { content });
}

export async function getStatusById(id: string): Promise<StatusItem> {
    const res = await apiGet(`/status/${id}`); // -> { data: {...} }
    return res?.data;
}

export async function likeStatus(statusId: string) {
    await apiPost("/like", { statusId });
}

export async function unlikeStatus(statusId: string) {
    try {
        // หลายระบบใช้ DELETE /like (body: {statusId})
        await apiDelete("/like", { statusId });
    } catch (e) {
        // เผื่อกรณีใช้ DELETE /unlike
        await apiDelete("/unlike", { statusId });
    }
}

export async function addComment(statusId: string, content: string) {
    await apiPost("/comment", { statusId, content });
}