export function getWeatherDescription(sky: number, pty: number): string {
  if (pty === 1) return '비';
  if (pty === 2) return '비/눈';
  if (pty === 3) return '눈';
  if (pty >= 5) return '이슬비';
  if (sky === 1) return '맑음';
  if (sky === 3) return '구름 많음';
  if (sky === 4) return '흐림';
  return '알 수 없음';
}

export function getRainMessage(maxPOP: number, hasRain: boolean): string {
  if (hasRain) return '☔ 우산을 꼭 챙기세요. 비 예보가 있어요!';
  if (maxPOP >= 60) return `🌦️ 강수 확률이 ${maxPOP}%입니다. 우산을 챙기세요.`;
  if (maxPOP >= 30) return `🌤️ 간헐적으로 비가 올 수도 있어요. (확률: ${maxPOP}%)`;
  return '☀️ 비 올 가능성은 낮아요. 우산은 필요 없을 것 같아요!';
}