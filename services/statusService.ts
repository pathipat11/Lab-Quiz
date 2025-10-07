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
    await apiPost("/like", { statusId });
}

export async function unlikeStatus(statusId: string) {
    // พยายามทีละรูปแบบเพื่อครอบคลุม backend ที่ต่างกัน
    const tries = [
        () => apiDelete("/like", { statusId }), // DELETE + body
        () => apiDelete(`/like?statusId=${encodeURIComponent(statusId)}`), // DELETE + query
        () => apiDelete("/unlike", { statusId }),
        () => apiDelete(`/unlike?statusId=${encodeURIComponent(statusId)}`),
        () => apiPost("/unlike", { statusId }), // บางที่ใช้ POST /unlike
    ];
    let lastErr: any;
    for (const t of tries) {
        try { await t(); return; } catch (e) { lastErr = e; }
    }
    throw lastErr;
}

export async function deleteStatus(id: string) {
    const tries = [
        () => apiDelete(`/status/${id}`),                          // DELETE /status/{id}
        () => apiDelete(`/status?id=${encodeURIComponent(id)}`),   // DELETE /status?id=...
        () => apiPost("/status/delete", { id }),                   // POST /status/delete
        () => apiDelete("/status", { id }),                        // DELETE /status (body)
    ];
    let lastErr: any;
    for (const t of tries) {
        try { await t(); return; } catch (e) { lastErr = e; }
    }
    throw lastErr;
}

export async function deleteComment(id: string) {
    await apiDelete(`/comment/${id}`);
}

export async function addComment(statusId: string, content: string) {
    await apiPost("/comment", { statusId, content });
}