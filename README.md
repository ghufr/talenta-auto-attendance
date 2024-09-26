## Talenta Auto Attendance

### Summary

A cloudflare worker script to call talenta api and simulate the check in and check out processes. Running automatically using cron job.

### Requirements

- Cloudflare account & project

### Setup

- Edit `wrangler.toml` file as you need:

  ```toml
  # All the cron is in UTC
  [triggers]
  crons = [
  	"57 0 * * mon,tue,wed", # clock in time (monday - wednesday)
  	"7 10 * * mon,tue,wed", # clock out  time (monday - wednesday)
  	"55 0 * * thu,fri", # clock in time (thursday, friday)
  	"5 10 * * thu,fri" # clock out time (thursday, friday)
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
  		["57 0 * * mon,tue,wed", "clock_in", 1.18, 104.09],
  		["7 10 * * mon,tue,wed", "clock_out", 1.14,104.11],
  		["55 0 * * thu,fri", "clock_in", 1.14,104.11],
  		["5 10 * * thu,fri", "clock_out", 1.14,104.11]
  ]

  ```

  Check your cron here, remember the cron time is in UTC: https://crontab.guru/

- Login to your cloudflare account

  ```bash
  npx wrangler login
  ```

- Deploy the worker

  ```bash
  npx wrangler deploy
  ```

- Create a KV namespace

  ```bash
  npx wrangler kv namespace create TALENTA
  ```

  copy the id to `wrangler.toml` -> `<KV_ID>`

- Create KV key pair

  ```bash
  npx wrangler kv key put ACCESS_TOKEN <TALENTA_ACCESS_TOKEN> --namespace-id <KV_ID>
  ```

  ```bash
  npx wrangler kv key put REFRESH_TOKEN <TALENTA_REFRESH_TOKEN> --namespace-id <KV_ID>
  ```

- Deploy your app to Cloudflare
  ```bash
  npx wrangler publish
  ```

### How to get Authentication Token

- Login to Talenta web in desktop
- Right click -> Inspect element -> Console
- Paste and run this script

```js
const accessToken = await cookieStore.get('_session_token').then(({ value }) => decodeURIComponent(value).split('"').at(-2));

const attendances = await fetch(
	`https://api.mekari.com/internal/talenta-attendance-web/v2/organisations/${companyId}/summary_attendance_clocks?start_date=${
		new Date().toISOString().split('T')[0]
	}&source=web&sort=schedule_date&order=asc&organisation_user_id=${userId}&page=1&limit=200`,
	{
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	}
)
	.then((res) => res.json())
	.catch(() => {});

console.log('ACCESS_TOKEN: ' + accessToken);
console.log('REFRESH_TOKEN: ' + 'NOT YET SUPPORTED');
console.log('COMPANY_ID: ' + companyId);
console.log('HOUR_ID: ' + attendances.data[0].attributes.attendance_office_hour_id);
console.log('USER_ID: ' + userId);
```
