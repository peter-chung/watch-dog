const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export type CreateTrackerPayload = {
  url: string;
  selector: string;
  email: string;
};

export type Tracker = {
  id: string;
  url: string;
  selector: string;
  email: string;
  last_content: string | null;
  last_checked_at: string | null;
  last_changed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export async function createTracker(payload: CreateTrackerPayload) {
  const response = await fetch(`${API_URL}/trackers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to create tracker";

    try {
      const errorData = await response.json();
      message = errorData.detail ?? message;
    } catch {
      // keep default message
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getTrackers(): Promise<Tracker[]> {
  const response = await fetch(`${API_URL}/trackers`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trackers");
  }

  return response.json();
}

export async function testTracker(payload: { url: string; selector: string }) {
  const response = await fetch(`${API_URL}/trackers/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to test tracker";

    try {
      const errorData = await response.json();
      message = errorData.detail ?? message;
    } catch {
      //
    }

    throw new Error(message);
  }

  return response.json() as Promise<{ preview: string }>;
}
