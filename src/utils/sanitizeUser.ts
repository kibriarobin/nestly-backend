export const sanitizeUser = <T extends Record<string, any>>(user: T) => {
  const { password, ...rest } = user;
  return rest;
};