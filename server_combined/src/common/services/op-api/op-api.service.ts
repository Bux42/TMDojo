import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ValidatePluginTokenRo } from './ro/validate-plugin-token.ro';

const OP_PLUGIN_VALIDATE_URL = 'https://openplanet.dev/api/auth/validate';

@Injectable()
export class OpApiService {
    logger: Logger;

    constructor() {
        this.logger = new Logger(OpApiService.name);
    }

    // TODO: check if this works
    async validatePluginToken(token: string): Promise<ValidatePluginTokenRo> {
        // Prepare data to send to the Openplanet backend
        const params = new URLSearchParams();
        params.set('token', token);
        params.set('secret', process.env.OP_AUTH_SECRET); // TODO: use env using provider

        // Send data to Openplanet backend for token validation
        let res;
        try {
            res = await axios.post(OP_PLUGIN_VALIDATE_URL, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        } catch (error) {
            this.logger.error(error);
            return null;
        }

        // Handle response
        if (!res.data) {
            this.logger.error('No data in response from Openplanet backend.');
            return null;
        }

        const { data } = res;

        return {
            Error: data.Error,
            AccountID: data.Message,
            DisplayName: data.DisplayName,
            TokenTime: data.TokenTime,
        };
    }
}
