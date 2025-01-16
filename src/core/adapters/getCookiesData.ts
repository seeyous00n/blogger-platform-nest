export const getCookiesData = (
  maxAge: number = 1000 * 60 * 60 * 24,
  httpOnly: boolean = true,
  secure: boolean = true,
) => {
  return {
    httpOnly,
    secure,
    maxAge,
  };
};
