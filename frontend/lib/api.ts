const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

/**
 * API client for communicating with the Velora backend.
 * Automatically handles JSON serialization and auth headers.
 */
async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error || `API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// ─── User API ───────────────────────────────────────────

export async function syncUser(
  token: string,
  data: { email: string; name: string; avatarUrl?: string }
) {
  return apiClient('/users/sync', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function getMe(token: string) {
  return apiClient('/users/me', { token });
}

// ─── Meeting API ────────────────────────────────────────

export interface CreateMeetingPayload {
  title: string;
  type: 'INSTANT' | 'SCHEDULED' | 'PERSONAL';
  scheduledAt?: string;
}

export interface MeetingResponse {
  id: string;
  meetingCode: string;
  title: string;
  hostId: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  type: 'INSTANT' | 'SCHEDULED' | 'PERSONAL';
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  host?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count?: {
    participants: number;
  };
}

export async function createMeeting(token: string, data: CreateMeetingPayload): Promise<MeetingResponse> {
  return apiClient<MeetingResponse>('/meetings', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function getMeetingByCode(token: string, code: string): Promise<MeetingResponse> {
  return apiClient<MeetingResponse>(`/meetings/${code}`, { token });
}

export async function getUserMeetings(
  token: string,
  filter: 'upcoming' | 'previous' | 'all' = 'all'
): Promise<MeetingResponse[]> {
  return apiClient<MeetingResponse[]>(`/meetings?filter=${filter}`, { token });
}

export async function updateMeetingStatus(
  token: string,
  meetingId: string,
  status: 'PENDING' | 'ACTIVE' | 'ENDED'
): Promise<MeetingResponse> {
  return apiClient<MeetingResponse>(`/meetings/${meetingId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

/**
 * DELETE /api/meetings/:id
 * Permanently removes a meeting (host only).
 * Returns void — the backend sends 204 No Content.
 */
export async function deleteMeeting(token: string, meetingId: string): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const response = await fetch(`${API_URL}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error || `API error: ${response.status} ${response.statusText}`
    );
  }
  // 204 No Content — nothing to return
}
