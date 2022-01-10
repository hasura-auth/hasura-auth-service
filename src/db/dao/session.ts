import ServiceError from '../../model/Error';
import RsaKey from '../models/RsaKey';
import ErrorSeverity from '../../model/ErrorSeverity';
import ErrorSource from '../../model/ErrorType';
import { Builder } from 'builder-pattern';
import Session from '../models/session';
import Account from '../models/Account';

const createSession = async (accountId: number, validUntil: number): Promise<Session> => {
  return Session.create({ accountId, validUntil });
};

const findOneByUuid = async (sessionId: string) => {
  return Session.findOne({
    where: { sessionId },
    include: { model: Account }
  });
};

export { createSession, findOneByUuid };
