/* eslint-disable max-len */
import {
    ConsoleLogger, Inject, Injectable, Optional,
} from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class MyLogger extends ConsoleLogger {
    @Optional() @Inject(REQUEST) private request?: Request;

    protected formatMessage(
        logLevel: LogLevel,
        message: unknown,
        pidMessage: string,
        formattedLogLevel: string,
        contextMessage: string,
        timestampDiff: string,
    ): string {
        const output = this.stringifyMessage(message, logLevel);
        const pidMessageColored = this.colorize(pidMessage, logLevel);
        const formattedLogLevelColored = this.colorize(formattedLogLevel, logLevel);
        const requestId = this.colorize(this.getRequestIdString(), logLevel);
        return `${pidMessageColored}${this.getTimestamp()} - ${requestId} ${formattedLogLevelColored} ${contextMessage}${output}${timestampDiff}\n`;
    }

    private getRequestIdString(): string {
        const requestId = this.getRequestId();
        return requestId
            ? `[${requestId}]`
            : '';
    }

    private getRequestId(): string | undefined {
        return this.request
            ? this.request.requestId
            : undefined;
    }
}
