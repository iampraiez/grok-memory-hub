import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


export const setupInterceptors = (getToken: () => Promise<string | null>) => {
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};


export const conversationApi = {
  list: () => api.get('/chat/conversations'),
  get: (id: string, params?: { cursor?: string; limit?: number }) => api.get(`/chat/conversations/${id}`, { params }),
  update: (id: string, data: { title: string }) => api.patch(`/chat/conversations/${id}`, data),
  delete: (id: string) => api.delete(`/chat/conversations/${id}`),
  deleteMessage: (conversationId: string, messageId: string) => api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`),
};


export const memoryApi = {
  create: (content: string, tags?: string[]) => api.post('/memories', { content, tags }),
  search: (query: string) => api.get('/memories/search', { params: { q: query } }),
  delete: (id: string) => api.delete(`/memories/${id}`),
};


export const preferencesApi = {
  get: () => api.get('/preferences'),
  update: (data: any) => api.put('/preferences', data),
};
 

export async function streamChat(
  messages: Array<{ role: string; content: string; id?: string }>,
  conversationId: string | undefined,
  signal: AbortSignal | undefined,
  attachments: any[] | undefined,
  token: string | undefined,
  onChunk: (data: { content?: string; title?: string; conversationId?: string; done?: boolean; error?: string }) => void,
  deepThinking?: boolean,
  webSearch?: boolean
): Promise<void> {
  const url = `${api.defaults.baseURL}/chat`;
  
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ messages, conversationId, attachments, messageId: messages[messages.length - 1]?.id, deepThinking, webSearch }),
    signal, 
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; 
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onChunk({ done: true });
            return;
          }
          try {
            const parsed = JSON.parse(data);
            onChunk(parsed); 
          } catch (e) {
            
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export default api;
