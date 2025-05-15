import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seoulLocations } from '../data/locations.js';
import { recommendOutfit } from '../utils/outfit.js';
import { getWeatherDescription, getRainMessage } from '../utils/formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const forecastDir = path.resolve(__dirname, '../../data/forecast');
const realtimeDir = path.resolve(__dirname, '../../data/realtime');
const outputPath = path.resolve(__dirname, '../../src/data/weather-data.ts');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

type ForecastItem = { category: string; fcstValue: string; fcstTime: string; fcstDate: string };
type RealtimeItem = { category: string; obsrValue: string };

const result: Record<string, any> = {};

for (const loc of seoulLocations) {
  const { name } = loc;

  const forecastFile = path.join(forecastDir, `forecast_raw_${name}.json`);
  const realtimeFile = path.join(realtimeDir, `realtime_${name}.json`);

  if (!fs.existsSync(forecastFile)) continue;

  const forecastData = JSON.parse(fs.readFileSync(forecastFile, 'utf-8'));
  const forecastItems: ForecastItem[] = forecastData.response.body.items.item;

  const realtimeItems: RealtimeItem[] = fs.existsSync(realtimeFile)
    ? JSON.parse(fs.readFileSync(realtimeFile, 'utf-8'))
    : [];

  const getValue = (cat: string, time: string) =>
    forecastItems.find((item) => item.category === cat && item.fcstTime === time)?.fcstValue ?? '-';

  const times = [...new Set(forecastItems.map((item) => item.fcstTime))].sort();

  const forecastByTime = times.map((t) => {
    const skyCode = getValue('SKY', t);
    const rainCode = getValue('PTY', t);
    const temp = getValue('TMP', t);
    return {
      fcstTime: t,
      fcstDate: forecastItems.find((item) => item.fcstTime === t)?.fcstDate ?? '',
      temp,
      sky: getWeatherDescription(Number(skyCode), Number(rainCode)),
      rain: getRainMessage(
        Number(forecastItems.find((item) => item.category === 'POP' && item.fcstTime === t)?.fcstValue ?? '0'),
        Number(rainCode) > 0
      ),
    };
  });

  const tempMin = forecastItems.find((item) => item.category === 'TMN')?.fcstValue ?? '-';
  const tempMax = forecastItems.find((item) => item.category === 'TMX')?.fcstValue ?? '-';

  const skyCode = forecastItems.find((item) => item.category === 'SKY')?.fcstValue ?? '0';
  const rainCode = forecastItems.find((item) => item.category === 'PTY')?.fcstValue ?? '0';

  const min = Number(tempMin);
  const max = Number(tempMax);
  const outfit = recommendOutfit(isNaN(min) ? 0 : min, isNaN(max) ? 0 : max);

  const getObs = (category: string) =>
    realtimeItems.find((item) => item.category === category)?.obsrValue ?? '-';

  result[name] = {
    date: forecastItems[0]?.fcstDate ?? '',
    tempMin,
    tempMax,
    skyCode,
    rainCode,
    outfit,
    live: {
      temp: getObs('T1H'),
      humidity: getObs('REH'),
      wind: getObs('WSD'),
    },
    forecast: forecastByTime,
  };
}

const fileContent = `export const forecasts = ${JSON.stringify(result, null, 2)};`;

fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log('✅ weather-data.ts 생성 완료');
