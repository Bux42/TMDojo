/* eslint-disable max-len */
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services';
import { UserRo } from '../../users/dto/user.ro';

const MESSAGE_PREFIX = '[Nest] - ';

@Injectable()
export class MyLogger extends ConsoleLogger {
    private requestId?: string;
    private user?: UserRo;

    setRequestId(requestId: string | undefined): void {
        this.requestId = requestId;
    }

    setUser(user: UserRo | undefined): void {
        this.user = user;
    }

    protected formatMessage(
        logLevel: LogLevel,
        message: unknown,
        pidMessage: string,
        formattedLogLevel: string,
        contextMessage: string,
        timestampDiff: string,
    ): string {
        const output = this.stringifyMessage(message, logLevel);
        const prefixColored = this.colorize(MESSAGE_PREFIX, logLevel);
        const formattedLogLevelColored = this.colorize(formattedLogLevel, logLevel);
        const requestId = this.getRequestIdString();
        const userString = this.getUserString();
        return `${prefixColored}${this.getTimestamp()} - ${requestId} ${userString} ${formattedLogLevelColored} ${contextMessage}${output}${timestampDiff}\n`;
    }

    private getRequestIdString(): string {
        return this.requestId
            ? `[${this.requestId}]`
            : '';
    }
    private getUserString(): string {
        return this.user
            ? `[${this.user.webId} - ${this.user.playerName}]`
            : '';
    }
}
