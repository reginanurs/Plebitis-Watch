/**
 * Minimal prototype session record — a client-side simulation only.
 * This is NOT a real authentication token and carries no security
 * guarantees; it merely gates which routes are shown in the UI.
 */
export interface AuthSession {
  isAuthenticated: true
  userId: string
  loginAt: string
}
