import cron from 'node-cron';
import { PtvApiService } from './services/ptv-api';
import { DatabaseService } from './services/database';
import { ImageGeneratorService } from './services/image-generator';
import { DepartureRecord, RouteRecord } from './types';
import { config } from './config';

export class Scheduler {
  private ptvApi: PtvApiService;
  private database: DatabaseService;
  private imageGenerator: ImageGeneratorService;

  constructor(
    ptvApi: PtvApiService,
    database: DatabaseService,
    imageGenerator: ImageGeneratorService
  ) {
    this.ptvApi = ptvApi;
    this.database = database;
    this.imageGenerator = imageGenerator;
  }

  async collectPtvData(): Promise<void> {
    console.log('Starting PTV data collection...');

    try {
      const fetchedAt = new Date();
      const allDepartures: DepartureRecord[] = [];

      const endpoints = [
        { stopId: 1097, directionId: 1, maxResults: 3 },
        { stopId: 1097, directionId: 16, maxResults: 3 },
      ];

      for (const endpoint of endpoints) {
        const response = await this.ptvApi.getDepartures(
          0,
          endpoint.stopId,
          endpoint.directionId,
          endpoint.maxResults
        );

        const departures: DepartureRecord[] = response.departures.map((dep) => ({
          stop_id: dep.stop_id,
          route_id: dep.route_id,
          direction_id: dep.direction_id,
          scheduled_departure_utc: dep.scheduled_departure_utc,
          estimated_departure_utc: dep.estimated_departure_utc,
          platform_number: dep.platform_number,
          departure_sequence: dep.departure_sequence,
          fetched_at: fetchedAt,
        }));

        allDepartures.push(...departures);
      }

      const routeResponse = await this.ptvApi.getRoute(16);
      console.log(`Fetched route info: ${routeResponse.route?.route_name}`);

      if (routeResponse.route) {
        const routeRecord: RouteRecord = {
          route_id: routeResponse.route.route_id,
          route_name: routeResponse.route.route_name,
          route_number: routeResponse.route.route_number,
          route_type: routeResponse.route.route_type,
          service_status_description: routeResponse.route.route_service_status?.description,
          service_status_timestamp: routeResponse.route.route_service_status?.timestamp,
          fetched_at: fetchedAt,
        };

        await this.database.saveRoute(routeRecord);
      }

      await this.database.saveDepartures(allDepartures);
      console.log('PTV data collection completed successfully');
    } catch (error) {
      console.error('Error collecting PTV data:', error);
      throw error;
    }
  }

  async generateImage(): Promise<void> {
    console.log('Starting image generation...');

    try {
      await this.imageGenerator.triggerImageGeneration();
      console.log('Image generation completed successfully');
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }

  startDataCollectionCron(): void {
    const schedule = config.service.dataCollectionCron;
    console.log(`Starting PTV data collection cron with schedule: ${schedule}`);

    cron.schedule(schedule, async () => {
      await this.collectPtvData();
    });
  }

  startImageGenerationCron(): void {
    const schedule = config.service.imageGenerationCron;
    console.log(`Starting image generation cron with schedule: ${schedule}`);

    cron.schedule(schedule, async () => {
      await this.generateImage();
    });
  }
}
