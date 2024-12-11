import { validAccessCodes } from '../config/accessCodes';

export const validateAccessCode = (code: string): boolean => {
  const normalizedCode = code.toUpperCase();
  return normalizedCode in validAccessCodes;
};

export const getWeddingInfo = (code: string) => {
  const normalizedCode = code.toUpperCase();
  return validAccessCodes[normalizedCode];
};