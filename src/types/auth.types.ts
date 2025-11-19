/**
 * Authentication types for Supabase integration.
 * Used for managing user state and credentials.
 */

/**
 * Represents a Supabase user.
 */
export interface User {
  /** Unique user ID */
  id: string;
  /** User email address */
  email: string;
  /** Account creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Authentication state for the app.
 */
export interface AuthState {
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Is the user authenticated? */
  isAuthenticated: boolean;
  /** Is authentication loading? */
  isLoading: boolean;
}

/**
 * Credentials for login.
 */
export interface LoginCredentials {
  /** User email */
  email: string;
  /** User password */
  password: string;
}

/**
 * Credentials for signup.
 */
export interface SignupCredentials {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Error structure for authentication.
 */
export interface AuthError {
  /** Error message */
  message: string;
  /** Field related to error (optional) */
  field?: string;
}
