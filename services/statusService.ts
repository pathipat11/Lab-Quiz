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

// --- helpers ---
export const displayName = (cb: CreatedBy | undefined) => {
    if (!cb) return "Unknown";
    if (typeof cb === "string") return cb;
    return cb.name || cb.email || cb._id || "Unknown";
};

export const createdByEmail = (cb: CreatedBy | undefined) => {
    if (!cb) return undefined;
    return typeof cb === "string" ? cb : cb.email;
};

export const isMine = (cb: CreatedBy | undefined, myEmail?: string | null) => {
    const e1 = (createdByEmail(cb) || "").toLowerCase();
    const e2 = (myEmail || "").toLowerCase();
    return !!e1 && !!e2 && e1 === e2;
};

// --- API calls ---
export async function listStatuses(): Promise<StatusItem[]> {
    const res = await apiGet("/status");
    return res?.data ?? [];
}

export async function createStatus(content: string) {
    await apiPost("/status", { content });
}

export async function getStatusById(id: string): Promise<StatusItem> {
    const res = await apiGet(`/status/${id}`);
    return res?.data;
}

export async function likeStatus(statusId: string) {
    // Like (สเปค: POST /like)
    await apiPost("/like", { statusId });
}

export async function unlikeStatus(statusId: string) {
    // Unlike (สเปค: DELETE /like หรือ DELETE /unlike) — ลองตามลำดับ
    try {
        await apiDelete("/like", { statusId });
        return;
    } catch (e) {
        // fallback: DELETE /unlike
    }
    await apiDelete("/unlike", { statusId });
}

export const didILike = (
    p: { like?: Array<string | { _id?: string; email?: string }>; hasLiked?: boolean },
    myEmail?: string | null
) => {
    if (p.hasLiked === true) return true;
    if (!myEmail) return false;
    const me = myEmail.toLowerCase();
    const arr = p.like ?? [];
    return arr.some((v) => {
        if (!v) return false;
        if (typeof v === "string") {
            // บางระบบเก็บเป็น email เป็น string (ถ้าเป็น userId ก็เทียบไม่ได้ แต่ดีกว่าไม่เช็คเลย)
            return v.toLowerCase() === me;
        }
        return (v.email || "").toLowerCase() === me;
    });
};

export async function deleteStatus(id: string) {
    await apiDelete(`/status/${id}`);
}

export async function deleteComment(commentId: string, statusId: string) {
    return apiDelete(`/comment/${commentId}`, { statusId });
}


export async function addComment(statusId: string, content: string) {
    await apiPost("/comment", { statusId, content });
}