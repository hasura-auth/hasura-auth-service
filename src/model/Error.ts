import ErrorSeverity from './ErrorSeverity';
import ErrorSource from './ErrorType';

export default class ServiceError extends Error {
  message!: string;
  source?: ErrorSource;
  severity?: ErrorSeverity;
  code?: string;
  stack?: string;
}
