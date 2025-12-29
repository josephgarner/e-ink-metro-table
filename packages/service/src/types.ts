export interface PtvDeparture {
  stop_id: number;
  route_id: number;
  direction_id: number;
  scheduled_departure_utc: string;
  estimated_departure_utc?: string;
  at_platform: boolean;
  platform_number?: string;
  flags?: string;
  departure_sequence: number;
}

export interface PtvDepartureResponse {
  departures: PtvDeparture[];
  stops?: Record<string, any>;
  routes?: Record<string, any>;
  runs?: Record<string, any>;
  directions?: Record<string, any>;
  disruptions?: Record<string, any>;
  status?: {
    version: string;
    health: number;
  };
}

export interface PtvRoute {
  route_type: number;
  route_id: number;
  route_name: string;
  route_number: string;
  route_gtfs_id: string;
  geopath?: any[];
  route_service_status?: {
    description: string;
    timestamp: string;
  };
}

export interface PtvRouteResponse {
  route: PtvRoute;
  status?: {
    version: string;
    health: number;
  };
}

export interface DepartureRecord {
  stop_id: number;
  route_id: number;
  direction_id: number;
  scheduled_departure_utc: string;
  estimated_departure_utc?: string;
  platform_number?: string;
  departure_sequence: number;
  fetched_at: Date;
}

export interface RouteRecord {
  route_id: number;
  route_name: string;
  route_number: string;
  route_type: number;
  service_status_description?: string;
  service_status_timestamp?: string;
  fetched_at: Date;
}
