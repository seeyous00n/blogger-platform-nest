export type PayloadType = {
  deviceId: string;
  userId: string;
};

export type IatAndExpRefreshTokenType = {
  iat: number;
  exp: number;
};

export enum tokensName {
  refreshToken = 'refreshToken',
  accessToken = 'accessToken',
}
