import ServiceError from '../../model/Error';
import RsaKey from '../models/RsaKey';
import ErrorSeverity from '../../model/ErrorSeverity';
import ErrorSource from '../../model/ErrorType';
import { Builder } from 'builder-pattern';

const findOneByPurpose = async (
  purpose: string,
  attributes: string[]
): Promise<RsaKey> => {
  return RsaKey.findOne({
    attributes,
    where: { purpose }
  })
    .then((result) => {
      if (!result)
        throw Builder(ServiceError)
          .message('rsa key not found')
          .severity(ErrorSeverity.FATAL)
          .source(ErrorSource.DB)
          .build();

      return result;
    })
    .catch((e: Error) => {
      throw Builder(ServiceError)
        .message(e.message)
        .severity(ErrorSeverity.FATAL)
        .source(ErrorSource.DB)
        .build();
    });
};

const findAll = async (attributes: string[]): Promise<RsaKey[]> => {
  return RsaKey.findAll({
    attributes
  }).catch((e: Error) => {
    throw Builder(ServiceError)
      .message(e.message)
      .severity(ErrorSeverity.FATAL)
      .source(ErrorSource.DB)
      .build();
  });
};

const findOneByKeyId = async (keyId: string, attributes: string[]): Promise<RsaKey> => {
  return RsaKey.findOne({
    attributes,
    where: { keyId }
  }).catch((e: Error) => {
    throw Builder(ServiceError)
      .message(e.message)
      .severity(ErrorSeverity.FATAL)
      .source(ErrorSource.DB)
      .build();
  });
};

export { findOneByPurpose, findOneByKeyId, findAll };
