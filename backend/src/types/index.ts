export interface User {
  clerkId: string;
  username: string;
  imageUrl?: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClerkUser {
  id: string;
  username?: string | null;
  emailAddresses: {
    emailAddress: string;
    id: string;
    verification: {
      status: "verified" | "unverified";
    };
  }[];
  imageUrl?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  isPinned: boolean;
  updatedAt: Date | String;
  lastMessage: any;
  lastMessageRole: string;
  messageCount: number;
  lastMessageAt: String | Date;
}