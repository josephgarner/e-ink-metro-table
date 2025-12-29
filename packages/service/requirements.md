# Overview

This is an API/Service responsible for collecting test data from the PTV API as well as triggering the image geneator to generate an image. This API will live in a docker continer and requires credentials for the PTV API as well as our Postgres Database.

# Tech

- Node 22
- Typescript

# Scope

1. Via a cron job this service will need to call call out to multiple PTV API endpoints and save select data from the responses to a postgres database.

   - endpoint 1 `/v3/departures/route_type/0/stop/1097?direction_id=1&max_results=3&include_cancelled=true`
   - endpoint 2 `/v3/departures/route_type/0/stop/1097?direction_id=16&max_results=3&include_cancelled=true`
   - endpoint 3 `/routes/16`

2. Via a cron job or API call this service will trigger the image generator to generate an image and save it to a folder in our local file storage.
