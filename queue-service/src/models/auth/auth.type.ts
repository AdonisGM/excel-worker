type BodyJWTRefresh = {
  jti: string;
  username: string;
  name: string;
  zoneInfo?: string;
  ipAddress?: string;
  ipAddressV6: string | undefined;
  device: string | undefined;
};

type BcryptPassword = {
  password: string;
  salt: string;
};

type BodyJWT = BodyJWTRefresh & {
  rfi: string;
};

export { BodyJWT, BodyJWTRefresh, BcryptPassword };
