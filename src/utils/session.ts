import { UserSession } from '../types/user';

const SESSION_KEY = 'ai_judge_session';

export function getSession(): UserSession | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as UserSession;
  } catch {
    return null;
  }
}

export function createSession(): UserSession {
  const session: UserSession = {
    userId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getUserId(): string {
  let session = getSession();
  if (!session) {
    // Auto-create a session if one doesn't exist
    session = createSession();
  }
  return session.userId;
}
