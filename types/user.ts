export interface User {
    _id: string;
    username: string;
    email: string;
    // เพิ่มฟิลด์อื่น ๆ ถ้ามี เช่น role, createdAt, updatedAt
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}
