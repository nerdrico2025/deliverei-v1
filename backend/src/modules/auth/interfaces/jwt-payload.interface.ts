export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  empresaId?: string;
}
