export interface User {
  id: string;
  email: string;
  password_hash: string;
  phone: string | null;
  is_active: boolean;
  is_2fa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  device_info?: string;
  ip_address?: string;
  created_at: Date;
}

export interface OTP {
  id: string;
  user_id: string;
  code_hash: string;
  purpose: 'login_2fa' | 'enable_2fa' | 'forgot_password';
  expires_at: Date;
  used: boolean;
  attempts: number;
  created_at: Date;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  metadata?: Record<string, any>;
  created_at: Date;
}
