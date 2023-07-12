import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MyLogger } from '../../logger/my-logger.service';
import { ValidatePluginTokenRo } from './ro/validate-plugin-token.ro';

const OP_PLUGIN_VALIDATE_URL = 'https://openplanet.dev/api/auth/validate';

@Injectable()
export class OpApiService {
    constructor(
        private readonly logger: MyLogger,
    ) {
        this.logger.setContext(OpApiService.name);
    }

    // TODO: check if this works
    async validatePluginToken(token: string): Promise<ValidatePluginTokenRo | { error: any }> {
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
            return { error };
        }

        // Handle response
        if (!res.data) {
            return { error: 'No data in response from Openplanet backend.' };
        }

        const { data } = res;

        if (data.error) {
            return { error: data.error };
        }

        return {
            accountID: data.account_id,
            displayName: data.display_name,
            tokenTime: data.token_time,
        };
    }
}
