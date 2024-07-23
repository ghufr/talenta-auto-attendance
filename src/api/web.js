import axios from 'axios';
import config from '../config';

const instance = new axios.create({
  baseURL: `https://api.mekari.com/internal/talenta-attendance-web/v1/organisations/${config.companyId}`,
  headers: {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.7',
    authorization: `Bearer ${config.token}`,
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
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  },
});

const createData = (payload) => {
  const data = {
    latitude: payload.latitude,
    longitude: payload.longitude,
    event_type: payload.eventType,
    notes: '',
    selfie_photo: null,
    organisation_user_id: config.userId,
    source: 'mobileweb',
    schedule_date: payload.scheduleDate,
    attendance_office_hour_id: config.hourId,
  };
  return data;
};

const clockIn = (payload) => {
  const data = createData(payload);
  instance.post(`attendance_clocks`, data, {});
};

const clockOut = (payload) => {
  const data = createData(payload);
  instance.post(`attendance_clocks`, data, {});
};

export { clockIn, clockOut };
