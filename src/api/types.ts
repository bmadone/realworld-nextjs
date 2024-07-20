interface Author {
  username: string;
  bio: string | null;
  image: string;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Author;
}

export interface User {
  email: string;
  username: string;
  bio: string | null;
  image: string;
  token: string;
}
