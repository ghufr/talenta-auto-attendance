import axios from 'axios';
import config from '../config';

const instance = new axios.create({
  baseURL: `https://api.mekari.com/internal/talenta-mobile/v2/attendance/companies/${config.companyId}`,
  headers: {
    'x-device-id': config.deviceId,
    'x-app-version': config.appVersion,
    'x-os-version': config.deviceName,
    'x-portal-version': '2',
    'user-agent': 'okhttp/4.11.0',
    'accept-language': 'en-EN',
    v2: 'true',
    'x-tl-legacy-response': 'true',
    host: 'api.mekari.com',
    'accept-encoding': 'gzip',
    'x-device-mode': config.deviceName,
    authorization: `Bearer ${config.token}`,
    is_return_message: 'true',
    'Content-Transfer-Encoding': 'binary',
  },
});

const _createData = (payload) => {
  const data = new FormData();
  data.append('event_type', payload.eventType);
  data.append('attendance_office_hour_id', config.hourId);
  data.append('mixpanel[Entry point]', 'Index');
  data.append('attendance_office_hour_setting_id', config.hourId);
  data.append('latitude', payload.latitude);
  data.append('longitude', payload.longitude);
  data.append('schedule_date', payload.scheduleDate);
  return data;
};

const clockIn = (payload) => {
  const data = _createData(payload);

  instance.post('attendance_clocks/validate_location', data, {
    headers: data.getHeaders(),
  });
};

const clockOut = (payload) => {
  const data = _createData(payload);

  instance.post(
    'attendance_clocks/validate_location',
    { data },
    { headers: data.getHeaders() },
  );
};

export { clockIn, clockOut };
