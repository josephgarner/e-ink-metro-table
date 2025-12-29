import crypto from 'crypto';
import { config } from '../config';
import { PtvDepartureResponse, PtvRouteResponse } from '../types';

export class PtvApiService {
  private baseUrl: string;
  private devId: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.ptv.baseUrl;
    this.devId = config.ptv.devId;
    this.apiKey = config.ptv.apiKey;
  }

  private generateSignature(request: string): string {
    const signature = crypto
      .createHmac('sha1', this.apiKey)
      .update(request)
      .digest('hex')
      .toUpperCase();
    return signature;
  }

  private buildUrl(endpoint: string): string {
    const request = `${endpoint}${endpoint.includes('?') ? '&' : '?'}devid=${this.devId}`;
    const signature = this.generateSignature(request);
    return `${this.baseUrl}${request}&signature=${signature}`;
  }

  async getDepartures(
    routeType: number,
    stopId: number,
    directionId: number,
    maxResults: number = 3
  ): Promise<PtvDepartureResponse> {
    const endpoint = `/v3/departures/route_type/${routeType}/stop/${stopId}?direction_id=${directionId}&max_results=${maxResults}&include_cancelled=true`;
    const url = this.buildUrl(endpoint);

    console.log(`Fetching departures from PTV API: ${endpoint}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PTV API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRoute(routeId: number): Promise<PtvRouteResponse> {
    const endpoint = `/v3/routes/${routeId}`;
    const url = this.buildUrl(endpoint);

    console.log(`Fetching route from PTV API: ${endpoint}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PTV API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
