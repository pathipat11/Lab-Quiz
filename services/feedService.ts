import AsyncStorage from "@react-native-async-storage/async-storage";

export type Comment = { id: string; user: string; text: string; createdAt: string };
export type Post = { id: string; user: string; content: string; createdAt: string; likes: string[]; comments: Comment[] };
const KEY = "feed.posts.v1";

async function load(): Promise<Post[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
}
async function save(posts: Post[]) { await AsyncStorage.setItem(KEY, JSON.stringify(posts)); }

export async function listPosts() { return load(); }
export async function createPost(user: string, content: string) {
    const posts = await load();
    const post: Post = { id: crypto.randomUUID(), user, content, createdAt: new Date().toISOString(), likes: [], comments: [] };
    posts.unshift(post); await save(posts); return post;
}
export async function toggleLike(postId: string, user: string) {
    const posts = await load(); const p = posts.find(x => x.id === postId); if (!p) return;
    const i = p.likes.indexOf(user); i >= 0 ? p.likes.splice(i, 1) : p.likes.push(user);
    await save(posts); return p;
}
export async function addComment(postId: string, user: string, text: string) {
    const posts = await load(); const p = posts.find(x => x.id === postId); if (!p) return;
    p.comments.push({ id: crypto.randomUUID(), user, text, createdAt: new Date().toISOString() });
    await save(posts); return p;
}
export async function getPost(postId: string) { const posts = await load(); return posts.find(x => x.id === postId); }
