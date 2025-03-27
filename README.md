# Talenta Auto Attendance

Automate your Talenta attendance with this Cloudflare Worker script that simulates check-in and check-out processes using scheduled cron jobs.

## Prerequisites

- A Cloudflare account
- Node.js and npm installed
- Basic understanding of cron schedules

## Installation

1. Clone this repository
2. Install dependencies:
   ```shell
   npm install
   ```

## Configuration Steps

### 1. Configure Cron Schedule

Edit `wrangler.toml` to set your check-in/check-out schedule. Times are in UTC.

```toml
[triggers]
crons = [
    "57 0 * * mon,tue,wed",  # 07:57 AM (UTC+7) Mon-Wed Check-in
    "7 10 * * mon,tue,wed",  # 05:07 PM (UTC+7) Mon-Wed Check-out
    "55 0 * * thu,fri",      # 07:55 AM (UTC+7) Thu-Fri Check-in
    "5 10 * * thu,fri"       # 05:05 PM (UTC+7) Thu-Fri Check-out
]
```

> 💡 Verify your cron schedule at [crontab.guru](https://crontab.guru/)

### 2. Set Required Variables

In `wrangler.toml`, configure your Talenta details:

```toml
[vars]
HOUR_ID = ""           # From Talenta API
ORGANIZATION_ID = ""   # Your company ID
USER_ID = ""          # Your user ID

# Configure check-in/out locations
CRONS = [
    # Format: [cron_schedule, event_type, latitude, longitude]
    ["57 0 * * mon,tue,wed", "clock_in", 1.18, 104.09],
    ["7 10 * * mon,tue,wed", "clock_out", 1.14, 104.11],
    ["55 0 * * thu,fri", "clock_in", 1.14, 104.11],
    ["5 10 * * thu,fri", "clock_out", 1.14, 104.11]
]
```

### 3. Deploy to Cloudflare

```shell
# Login to Cloudflare
npx wrangler login

# Deploy the worker
npx wrangler deploy
```

### 4. Set Up KV Storage

```shell
# Create KV namespace
npx wrangler kv namespace create TALENTA

# Add tokens to KV storage
npx wrangler kv key put ACCESS_TOKEN <TALENTA_ACCESS_TOKEN> --namespace-id <KV_ID>
npx wrangler kv key put REFRESH_TOKEN <TALENTA_REFRESH_TOKEN> --namespace-id <KV_ID>
```

> ⚠️ Replace `<KV_ID>` with the ID provided after creating the namespace

### 5. Publish Your App

```shell
npx wrangler publish
```

## Getting Your Talenta Tokens

1. Open Talenta in your desktop browser
2. Right-click → Inspect Element → Console
3. Paste and run this script:

```javascript
// Get access token and attendance details
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

// Display required information
console.log('ACCESS_TOKEN: ' + accessToken);
console.log('REFRESH_TOKEN: ' + 'NOT YET SUPPORTED');
console.log('COMPANY_ID: ' + companyId);
console.log('HOUR_ID: ' + attendances.data[0].attributes.attendance_office_hour_id);
console.log('USER_ID: ' + userId);
```

## Troubleshooting

- Make sure all times in `wrangler.toml` are in UTC
- Verify your latitude/longitude coordinates are correct
- Ensure your access token is valid and properly set in KV storage

## License

GNU General Public License v3.0

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
