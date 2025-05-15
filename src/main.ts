// 런타임 데이터
import { forecasts } from './data/weather-data.js';
import { recommendOutfit } from './utils/outfit.js';

const tabButtons = document.getElementById('tab-buttons')!;
const app = document.getElementById('app')!;

Object.keys(forecasts).forEach((region, idx) => {
  const button = document.createElement('button');
  button.textContent = region;
  button.className = 'tab';
  button.onclick = () => {
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderForecast(region);
  };
  tabButtons.appendChild(button);
  if (idx === 0) {
    button.classList.add('active');
    renderForecast(region);
  }
});

function renderForecast(region: string) {
  const data = forecasts[region as keyof typeof forecasts] as ForecastData;

  // 날짜 요약
  const dateStr = formatDate(data.date);

  // 상단 요약
  const liveText = `🌡️ ${data.live.temp}℃ / 💧 ${data.live.humidity}% / 🍃 ${data.live.wind}m/s`;
  const tempRange = `최저 ${data.tempMin}℃ ~ 최고 ${data.tempMax}℃`;
  const outfit = recommendOutfit(Number(data.tempMin), Number(data.tempMax));

  // 날짜별 그룹화
  const grouped = groupBy(data.forecast, (item) => item.fcstDate);

  let headerRow1 = '<tr>';
  let headerRow2 = '<tr>';
  let bodyRow1 = '<tr>';
  let bodyRow2 = '<tr>';

  Object.entries(grouped).forEach(([date, entries]: [string, ForecastEntry[]]) => {
    headerRow1 += `<th colspan="${entries.length}">${formatDate(date)}</th>`;
    entries.forEach((entry) => {
      const hour = entry.fcstTime.slice(0, 2);
      headerRow2 += `<th>${hour}시</th>`;
      bodyRow1 += `<td>${entry.temp}℃</td>`;
      bodyRow2 += `<td>${entry.sky}<br/>${entry.rain}</td>`;
    });
  });

  headerRow1 += '</tr>';
  headerRow2 += '</tr>';
  bodyRow1 += '</tr>';
  bodyRow2 += '</tr>';

  app.innerHTML = `
    <h2>${region} (${dateStr})</h2>
    <p>📍 실황: ${liveText}</p>
    <p>🌡️ 예보: ${tempRange}</p>
    <p>👕 추천 옷차림: ${outfit}</p>
    <table border="1" cellspacing="0" cellpadding="4" style="margin-top: 1rem;">
      <thead>
        ${headerRow1}
        ${headerRow2}
      </thead>
      <tbody>
        ${bodyRow1}
        ${bodyRow2}
      </tbody>
    </table>
  `;
}

// 날짜 문자열 포맷 (20250515 → 5/15 (수))
function formatDate(dateStr: string): string {
  const yyyy = dateStr.slice(0, 4);
  const mm = dateStr.slice(4, 6);
  const dd = dateStr.slice(6, 8);
  const d = new Date(`${yyyy}-${mm}-${dd}`);
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${Number(mm)}/${Number(dd)} (${day})`;
}

// 범용 그룹핑 함수
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
}

// 타입 정의
type ForecastEntry = {
  fcstTime: string;
  fcstDate: string;
  temp: string;
  sky: string;
  rain: string;
};

type ForecastData = {
  date: string;
  tempMin: string;
  tempMax: string;
  skyCode: string;
  rainCode: string;
  outfit: string;
  live: {
    temp: string;
    humidity: string;
    wind: string;
  };
  forecast: ForecastEntry[];
};
