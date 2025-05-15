// src/fetch/getForecast.ts
import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { seoulLocations } from '../data/locations.js';

function getBaseTime(): string {
  const now = new Date();
  const hour = now.getHours();
  const timeTable = [2, 5, 8, 11, 14, 17, 20, 23];
  const baseHour = [...timeTable].reverse().find(t => hour >= t) ?? 23;
  return baseHour.toString().padStart(2, '0') + '00';
}

function getBaseDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '');
}

const baseDate = getBaseDate();
const baseTime = getBaseTime();
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error('❌ API_KEY가 .env에서 설정되지 않았습니다.');
  process.exit(1);
}

const outputDir = path.resolve('data/forecast');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  for (const loc of seoulLocations) {
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${loc.nx}&ny=${loc.ny}`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (data.response?.header?.resultCode !== '00') {
        console.warn(`⚠️ ${loc.name} → 데이터 없음. 응답 내용 확인 필요`);
        console.warn(data.response?.header?.resultMsg || '');
        continue;
      }

      const filePath = path.join(outputDir, `forecast_raw_${loc.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`[DEBUG] ✅ ${loc.name} 예보 저장 완료`);
    } catch (err) {
      const error = err as Error;
      console.error(`❌ ${loc.name} → 요청 실패:`, error.message);
    }
  }
})();
