## Talenta Auto Attendance

### Summary

A cloudflare worker script to call talenta api and simulate the check in and check out processes. Running automatically using cron job.

### Requirements

- Cloudflare account & project

### Setup

- Edit `wrangler.toml` file as you need:

  ```toml

  # All the cron is in UTC time
  [triggers]
  crons = [
  	"5 9 * * mon,tue,wed", # clock in time (monday - wednesday)
  	"57 0 * * mon,tue,wed", # clock out time (monday - wednesday)
  	"5 9 * * thu,fri", # clock in time (thursday, friday)
  	"55 0 * * thu,fri" # clock out time (thursday, friday)
  ]

  [vars]
  # get HOUR_ID, ORGANIZATION_ID, USER_ID from talenta web api
  HOUR_ID = ""
  ORGANIZATION_ID = ""
  USER_ID = ""
  CRONS = [
  	# Item 1: Should match the trigger crons
  	# Item 2: event type (clock_in / clock_out)
  	# Item 3: latitude
  	# Item 4: longitude
  	["5 9 * * mon,tue,wed", "clock_in", 1.14,104.11],
  	["57 0 * * mon,tue,wed", "clock_out", 1.14,104.11],
  	["5 9 * * thu,fri", "clock_in", 1.14,104.11],
  	["55 0 * * thu,fri", "clock_out", 1.14,104.11]
  ]

  ```

- Login to your cloudflare account

  `npx wrangler login`

- Deploy the worker

  `npx wrangler deploy`

- Update access token (get from talenta mobile api)

  `npx wrangler secret put ACCESS_TOKEN`
