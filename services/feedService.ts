import { apiGet, apiPost, apiDelete } from "./api";

export type Post = {
    _id: string;
    content: string;
    createdBy: string; // email หรือ id แล้วแต่หลังบ้าน
    likeCount: number;
    hasLiked: boolean;
    comment: {
        _id: string;
        content: string;
        createdBy: string;
        createdAt: string;
    }[];
    createdAt: string;
};

export async function listPosts(): Promise<Post[]> {
    const res = await apiGet("/status");        // -> { data: Post[] }
    return res?.data ?? [];
}

export async function createPost(content: string) {
    await apiPost("/status", { content });
}

export async function getPost(id: string): Promise<Post> {
    const res = await apiGet(`/status/${id}`);  // -> { data: Post }
    return res.data;
}

export async function like(statusId: string) {
    await apiPost("/like", { statusId });
}

export async function unlike(statusId: string) {
    // บางหลังบ้านใช้ DELETE /unlike (body: {statusId})
    await apiDelete("/unlike", { statusId });
}

export async function addComment(statusId: string, content: string) {
    await apiPost("/comment", { statusId, content });
}
