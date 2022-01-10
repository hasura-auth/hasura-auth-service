import bcrypt, { genSaltSync } from 'bcrypt';
import { Builder } from 'builder-pattern';
import ServiceError from '../model/Error';

const salt = genSaltSync(10);

const generateHash = async (password: string): Promise<string> => {
  return bcrypt.hash(password, salt).catch((e: Error) => {
    throw Builder(ServiceError).message(e.message).build();
  });
};

const verify = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash).catch((e: Error) => {
    throw Builder(ServiceError).message(e.message).build();
  });
};

export { generateHash, verify };
