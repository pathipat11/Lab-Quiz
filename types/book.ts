export interface User {
  _id: string;
  username: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  year: number;
  price: number;
  available: boolean;
  addedBy?: User;
}
