const postClock = (data, env) => {
	return fetch(`https://api.mekari.com/internal/talenta-attendance-web/v1/organisations/${env.ORGANIZATION_ID}/attendance_clocks`, {
		method: 'POST',
		headers: {
			accept: '*/*',
			'accept-language': 'en-US,en;q=0.7',
			authorization: `Bearer ${env.ACCESS_TOKEN}`,
			'cache-control': 'no-cache',
			'content-type': 'application/json',
			dnt: '1',
			origin: 'https://hr.talenta.co',
			pragma: 'no-cache',
			priority: 'u=1, i',
			referer: 'https://hr.talenta.co/',
			'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'cross-site',
			'sec-gpc': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		},
		body: JSON.stringify(data),
	});
};

export default {
	async scheduled(event, env, ctx) {
		const date = new Date(event.scheduledTime);
		const localeDateString = date.toLocaleDateString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			timeZone: 'Asia/Jakarta',
		});

		const [_, eventType, latitude, longitude] = env.CRONS.find((cron) => cron[0] === event.cron) ?? [];

		if (!eventType) {
			console.log('SKIP: no eventType');
			return;
		}

		const data = {
			latitude,
			longitude,
			event_type: eventType,
			notes: '',
			selfie_photo: null,
			organisation_user_id: env.USER_ID,
			source: 'mobileweb',
			schedule_date: localeDateString,
			attendance_office_hour_id: env.HOUR_ID,
		};

		console.log(data);
		const response = await postClock(data, env)
			.then((res) => res.json())
			.catch((err) => console.log(err));
		console.log(response);
	},
};
