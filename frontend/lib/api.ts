import { createClient } from "@/lib/supabase/client";

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  return apiUrl;
}

async function getAccessToken() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const { data } = await supabase.auth.refreshSession();
  return data.session?.access_token ?? null;
}

async function fetchWithToken(
  path: string,
  init: RequestInit,
  token: string | null,
) {
  const headers = new Headers(init.headers ?? {});

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers,
  });
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const initialToken = await getAccessToken();
  const response = await fetchWithToken(path, init, initialToken);

  if (response.status !== 401) {
    return response;
  }

  const supabase = createClient();
  const { data } = await supabase.auth.refreshSession();
  const refreshedToken = data.session?.access_token ?? null;

  if (!refreshedToken) {
    return response;
  }

  return fetchWithToken(path, init, refreshedToken);
}

async function parseError(response: Response, fallbackMessage: string) {
  try {
    const errorData = await response.json();
    return errorData.detail ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export type CreateTrackerPayload = {
  url: string;
  selector: string;
};

export type UpdateTrackerPayload = {
  url?: string;
  selector?: string;
  is_active?: boolean;
};

export type Tracker = {
  id: string;
  url: string;
  selector: string;
  last_content: string | null;
  last_checked_at: string | null;
  last_changed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type ChangeLog = {
  id: string;
  tracker_id: string;
  old_content: string | null;
  new_content: string | null;
  changed_at: string | null;
};

export type TrackerCheckResult = {
  status: string;
  message: string;
  tracker?: Tracker;
  old_content?: string;
  new_content?: string;
  email_sent?: boolean;
  email_error?: string | null;
};

export async function createTracker(payload: CreateTrackerPayload) {
  const response = await apiFetch("/trackers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create tracker"));
  }

  return response.json();
}

export async function getTrackers(): Promise<Tracker[]> {
  const response = await apiFetch("/trackers", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch trackers"));
  }

  return response.json();
}

export async function getTrackerById(
  trackerId: string,
  init: RequestInit = {}
): Promise<Tracker> {
  const response = await apiFetch(`/trackers/${trackerId}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch tracker"));
  }

  return response.json();
}

export async function getTrackerChangeLogs(
  trackerId: string,
  init: RequestInit = {}
): Promise<ChangeLog[]> {
  const response = await apiFetch(`/trackers/${trackerId}/change-logs`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to fetch tracker change logs")
    );
  }

  return response.json();
}

export async function updateTracker(
  trackerId: string,
  payload: UpdateTrackerPayload
): Promise<Tracker> {
  const response = await apiFetch(`/trackers/${trackerId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to update tracker"));
  }

  return response.json();
}

export async function deleteTracker(trackerId: string) {
  const response = await apiFetch(`/trackers/${trackerId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to delete tracker"));
  }

  return response.json() as Promise<{ deleted: boolean; tracker_id: string }>;
}

export async function runTrackerCheck(
  trackerId: string
): Promise<TrackerCheckResult> {
  const response = await apiFetch(`/trackers/${trackerId}/check`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to run tracker check"));
  }

  return response.json();
}

export async function testTracker(payload: { url: string; selector: string }) {
  const response = await apiFetch("/trackers/test", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to test tracker"));
  }

  return response.json() as Promise<{ preview: string }>;
}
