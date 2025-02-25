export interface LoginResponse {
  user: {
    user_id: number;
    username: string;
    password_hash: string;
    email: string;
    is_verified: boolean;
    verification_token?: string;
    token_expires?: string;
  };
  token: string;
}
