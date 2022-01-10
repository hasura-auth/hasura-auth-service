import { Builder } from 'builder-pattern';
import { assert } from 'chai';
import { response, Response } from 'express';
import sinon, { SinonStub, SinonSpy, SinonMock, SinonSpiedInstance } from 'sinon';
import logger from '../../../../src/config/logger';
import { customExceptionHandler } from '../../../../src/middleware/error-handler';
import ServiceError from '../../../../src/model/Error';
import ErrorSeverity from '../../../../src/model/ErrorSeverity';
import ErrorSource from '../../../../src/model/ErrorType';
import { mockRequest, mockResponse } from 'mock-req-res';

describe('error handler tests', () => {
  var respMock: any;
  var sendStatusSpy: SinonStub;
  var loggerSpy: SinonMock;

  beforeEach(() => {
    loggerSpy = sinon.mock(logger);
    sendStatusSpy = sinon.stub();

    respMock = {
      send: sendStatusSpy.returnsThis(),
      status: sendStatusSpy.returnsThis(),
      sendStatus: sendStatusSpy.returnsThis()
    };
  });

  afterEach(() => sinon.restore());

  it('on client error then send status 400 and log a warning', async () => {
    const error = Builder<ServiceError>()
      .message('message')
      .source(ErrorSource.CLIENT)
      .build();

    loggerSpy.expects('warn').once();
    loggerSpy.expects('error').never();

    customExceptionHandler(error, mockRequest(), respMock as Response, () => {});

    loggerSpy.verify();

    assert.equal(sendStatusSpy.callCount, 2);
    assert.equal(sendStatusSpy.getCall(0).firstArg, 400);
    assert.equal(sendStatusSpy.getCall(1).firstArg, 'message');
  });

  it('on fatal error then send status 503 and log an error', async () => {
    const error = Builder<ServiceError>()
      .message('message')
      // .source(ErrorSource.CLIENT)
      .severity(ErrorSeverity.FATAL)
      .build();

    loggerSpy.expects('warn').never();
    loggerSpy.expects('error').once();

    customExceptionHandler(error, mockRequest(), respMock as Response, () => {});

    loggerSpy.verify();

    assert.equal(sendStatusSpy.callCount, 1);
    assert.equal(sendStatusSpy.getCall(0).firstArg, 503);
  });

  it('on fatal error then send status 500 and log an error', async () => {
    const error = Builder<ServiceError>()
      .message('message')
      // .source(ErrorSource.CLIENT)
      .severity(ErrorSeverity.ERROR)
      .build();

    loggerSpy.expects('warn').never();
    loggerSpy.expects('error').once();

    customExceptionHandler(error, mockRequest(), respMock as Response, () => {});

    loggerSpy.verify();

    assert.equal(sendStatusSpy.callCount, 2);
    assert.equal(sendStatusSpy.getCall(0).firstArg, 500);
    assert.equal(sendStatusSpy.getCall(1).firstArg, 'message');
  });
});
