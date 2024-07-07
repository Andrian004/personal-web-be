export interface AuthResponse<TBody = Record<string, unknown>> {
  message: string;
  token?: string;
  refreshToken?: string;
  body?: TBody;
}
