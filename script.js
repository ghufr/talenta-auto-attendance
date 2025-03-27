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
console.log('COMPANY_ID: ' + companyId);
console.log('HOUR_ID: ' + attendances.data[0].attributes.attendance_office_hour_id);
console.log('USER_ID: ' + userId);
