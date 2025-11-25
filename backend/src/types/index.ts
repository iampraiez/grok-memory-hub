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

export interface AImessage {
  content: string;
  reasoning?: { enabled: boolean };
}


export interface AIresponse {
  logprobs?: null;
  finish_reason: string;
  native_finish_reason?: string;
  index: number;
  message: {
    role: string;
    content: string;
  };
  refusal?: null;
  reasoning?: null;
  reasoning_details: {
    id: string;
    format: string;
    index: number;
    type: string;
    data: string;
  }[];
}