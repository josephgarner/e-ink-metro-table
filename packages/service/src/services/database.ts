import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { DepartureRecord, RouteRecord } from '../types';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS departures (
          id SERIAL PRIMARY KEY,
          stop_id INTEGER NOT NULL,
          route_id INTEGER NOT NULL,
          direction_id INTEGER NOT NULL,
          scheduled_departure_utc TIMESTAMP NOT NULL,
          estimated_departure_utc TIMESTAMP,
          platform_number VARCHAR(10),
          departure_sequence INTEGER NOT NULL,
          fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_departures_stop_id ON departures(stop_id)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_departures_fetched_at ON departures(fetched_at)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS routes (
          id SERIAL PRIMARY KEY,
          route_id INTEGER NOT NULL,
          route_name VARCHAR(255) NOT NULL,
          route_number VARCHAR(50) NOT NULL,
          route_type INTEGER NOT NULL,
          service_status_description TEXT,
          service_status_timestamp TIMESTAMP,
          fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_routes_route_id ON routes(route_id)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_routes_fetched_at ON routes(fetched_at)
      `);

      console.log('Database tables initialized successfully');
    } finally {
      client.release();
    }
  }

  async saveDepartures(departures: DepartureRecord[]): Promise<void> {
    if (departures.length === 0) {
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const departure of departures) {
        await client.query(
          `INSERT INTO departures (
            stop_id,
            route_id,
            direction_id,
            scheduled_departure_utc,
            estimated_departure_utc,
            platform_number,
            departure_sequence,
            fetched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            departure.stop_id,
            departure.route_id,
            departure.direction_id,
            departure.scheduled_departure_utc,
            departure.estimated_departure_utc,
            departure.platform_number,
            departure.departure_sequence,
            departure.fetched_at,
          ]
        );
      }

      await client.query('COMMIT');
      console.log(`Saved ${departures.length} departure records to database`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async saveRoute(route: RouteRecord): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO routes (
          route_id,
          route_name,
          route_number,
          route_type,
          service_status_description,
          service_status_timestamp,
          fetched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          route.route_id,
          route.route_name,
          route.route_number,
          route.route_type,
          route.service_status_description,
          route.service_status_timestamp,
          route.fetched_at,
        ]
      );

      console.log(`Saved route ${route.route_name} (${route.route_id}) to database`);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
