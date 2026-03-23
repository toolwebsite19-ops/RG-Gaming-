export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  featuredImage: string;
  downloadLink: string;
  version: string;
  size: string;
  category: string;
  views: number;
  createdAt: any; // Firestore Timestamp
}

export interface Comment {
  id: string;
  postId: string;
  name: string;
  message: string;
  createdAt: any; // Firestore Timestamp
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
