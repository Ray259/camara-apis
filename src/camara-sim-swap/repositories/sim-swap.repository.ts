import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import * as querystring from 'querystring';
import { SimSwapInfo } from '../types/sim-swap.types';
import { ApiException } from '@/shared/exceptions/api-exception';
import { ErrorCode } from '@/shared/exceptions/error-code.enum';

export interface ISimSwapRepository {
  getLatestSimSwap(phoneNumber: string): Promise<SimSwapInfo>;
}

export const SIM_SWAP_REPOSITORY = 'SIM_SWAP_REPOSITORY';

@Injectable()
export class VodafoneSimSwapRepository implements ISimSwapRepository {
  private readonly logger = new Logger(VodafoneSimSwapRepository.name);

  private readonly hostname =
    process.env.VF_SANDBOX_URL ?? 'api-sandbox.vf-dmp.engineering.vodafone.com';
  private readonly clientKey = process.env.SANDBOX_CLIENT_KEY;
  private readonly clientSecret = process.env.SANDBOX_CLIENT_SECRET;

  constructor() {
    if (!this.clientKey || !this.clientSecret) {
      this.logger.error(
        'Missing SANDBOX_CLIENT_KEY or SANDBOX_CLIENT_SECRET in env',
      );
    }
  }

  async getLatestSimSwap(phoneNumber: string): Promise<SimSwapInfo> {
    try {
      const authReqId = await this.bcAuthorize(phoneNumber);
      const accessToken = await this.exchangeToken(authReqId);
      return await this.retrieveDate(accessToken);
    } catch (error) {
      this.logger.error(`SimSwap flow failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private get basicAuth(): string {
    return (
      'Basic ' +
      Buffer.from(`${this.clientKey}:${this.clientSecret}`).toString('base64')
    );
  }

  private post(
    path: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: this.hostname,
          port: 443,
          path,
          method: 'POST',
          headers: { ...headers, Host: this.hostname },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () =>
            resolve({
              status: res.statusCode!,
              body: Buffer.concat(chunks).toString(),
            }),
          );
        },
      );
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private async bcAuthorize(phoneNumber: string): Promise<string> {
    const res = await this.post(
      '/openIDConnectCIBA/v1/bc-authorize',
      {
        Authorization: this.basicAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      querystring.stringify({
        login_hint: `tel:${phoneNumber}`,
        scope: 'openid retrieve-sim-swap-date',
      }),
    );

    if (res.status !== 200) {
      this.handleAuthError(res.status, res.body);
    }

    return JSON.parse(res.body).auth_req_id;
  }

  private async exchangeToken(authReqId: string): Promise<string> {
    const res = await this.post(
      '/openIDConnectCIBA/v1/token',
      {
        Authorization: this.basicAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      querystring.stringify({
        auth_req_id: authReqId,
        grant_type: 'urn:openid:params:grant-type:ciba',
      }),
    );

    if (res.status !== 200) {
      this.handleAuthError(res.status, res.body);
    }

    return JSON.parse(res.body).access_token;
  }

  private async retrieveDate(accessToken: string): Promise<SimSwapInfo> {
    const res = await this.post(
      '/sim-swap/v1/retrieve-date',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        vf_ext_bp_id: 'Acme_Co', // Required by Vodafone sandbox
      },
      JSON.stringify({}),
    );

    if (res.status !== 200) {
      throw new ApiException(
        res.status,
        ErrorCode.SERVICE_NOT_APPLICABLE, // Default fallback
        `Vodafone API error: ${res.body}`,
      );
    }

    const data = JSON.parse(res.body);
    return {
      latestSimChange: data.latestSimChange ?? null,
      ...(data.monitoredPeriod !== undefined && {
        monitoredPeriod: data.monitoredPeriod,
      }),
    };
  }

  private handleAuthError(status: number, body: string): never {
    let error;
    try {
      error = JSON.parse(body);
    } catch {
      error = { error: body };
    }

    if (status === 401) {
      throw new ApiException(
        401,
        ErrorCode.UNAUTHENTICATED,
        error.error_description || 'Authentication failed',
      );
    }

    if (status === 400) {
      throw new ApiException(
        400,
        ErrorCode.INVALID_ARGUMENT,
        error.error_description || 'Invalid request',
      );
    }

    throw new ApiException(
      status,
      ErrorCode.SERVICE_NOT_APPLICABLE,
      `Upstream error: ${JSON.stringify(error)}`,
    );
  }
}
