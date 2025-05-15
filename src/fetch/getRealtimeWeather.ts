import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seoulLocations } from '../data/locations.js';
import dotenv from 'dotenv';

dotenv.config();

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기본 설정
const API_KEY = encodeURIComponent(process.env.API_KEY || '');
const BASE_DATE = getBaseDate();
const BASE_TIME = getBaseTime();

const outputDir = path.resolve(__dirname, '../../data/realtime');
fs.mkdirSync(outputDir, { recursive: true });

type WeatherItem = {
  category: string;
  obsrValue: string;
};

for (const loc of seoulLocations) {
  const { nx, ny, name } = loc;

  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` +
              `?serviceKey=${API_KEY}` +
              `&pageNo=1&numOfRows=1000&dataType=JSON` +
              `&base_date=${BASE_DATE}` +
              `&base_time=${BASE_TIME}` +
              `&nx=${nx}&ny=${ny}`;

  console.log(`[DEBUG] 실황 요청: ${name} (${BASE_DATE} ${BASE_TIME})`);

  try {
    const response = await axios.get(url);
    const items: WeatherItem[] = response.data?.response?.body?.items?.item;

    if (items && items.length > 0) {
      const outPath = path.resolve(outputDir, `realtime_${name}.json`);
      fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf-8');
      console.log(`✅ ${name} → 실황 저장 완료`);
    } else {
      console.warn(`⚠️ ${name} → 실황 데이터 없음. 응답 내용 확인 필요`);
      console.dir(response.data, { depth: null });
    }
  } catch (error: any) {
    console.error(`❌ ${name} 실황 요청 실패: ${error.message}`);
  }
}

function getBaseDate(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30); // 발표 지연 보정
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function getBaseTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = now.getMinutes() < 30 ? '00' : '30';
  return `${hh}${mm}`;
}
