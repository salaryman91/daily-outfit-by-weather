export interface TempRange {
  min: number;
  max: number;
  recommendation: string;
}

export const outfitByTemp: TempRange[] = [
  { min: 28, max: 100, recommendation: '민소매, 반팔 티셔츠, 반바지 / 린넨 원피스' },
  { min: 23, max: 27, recommendation: '반팔 티셔츠, 얇은 셔츠 / 반바지, 면바지' },
  { min: 20, max: 22, recommendation: '얇은 가디건, 후드티 / 면바지, 청바지' },
  { min: 17, max: 19, recommendation: '얇은 니트, 재킷 / 긴바지, 슬랙스' },
  { min: 12, max: 16, recommendation: '재킷, 야상 / 청바지, 기모 후드티' },
  { min: 9, max: 11, recommendation: '트렌치코트, 점퍼 / 기모 바지, 니트' },
  { min: 5, max: 8, recommendation: '가죽 재킷, 울코트 / 레깅스, 플리스' },
  { min: -50, max: 4, recommendation: '패딩, 내복, 장갑 / 방한용품 필수' },
];

export function recommendOutfit(minTemp: number, maxTemp: number): string {
  const tempDiff = maxTemp - minTemp;
  const avgTemp = Math.round((minTemp + maxTemp) / 2);
  const match = outfitByTemp.find(range => avgTemp >= range.min && avgTemp <= range.max);

  // 기본 추천
  let outfit = match ? match.recommendation : '추천 없음';

  // 극단적인 경우: 일교차가 10도 이상이고 최저기온이 낮은 경우
  if (tempDiff >= 10 && minTemp <= 10) {
    outfit += ' + ⚠️ 아침은 많이 추우니 따뜻한 겉옷 챙기세요';
  } else if (tempDiff >= 10 && maxTemp >= 28) {
    outfit += ' + ⚠️ 낮엔 더우니 겉옷은 탈착이 용이한 것으로 준비하세요';
  }

  return outfit;
}

export function generateCaution(
  minTemp: number,
  maxTemp: number,
  weatherAM: string,
  weatherPM: string
): string {
  const diff = maxTemp - minTemp;

  // 비가 오는지를 텍스트에서 판단
  const rainKeywords = ['비', '소나기', '천둥', '우박'];
  const hasRain = rainKeywords.some(keyword =>
    weatherAM.includes(keyword) || weatherPM.includes(keyword)
  );

  if (diff >= 10 && minTemp <= 10) return ' → ⚠️ 일교차 큼, 겉옷 필수!';
  if (diff >= 10 && maxTemp >= 28) return ' → ⚠️ 낮 더위 대비, 겉옷 탈착 권장';
  if (hasRain) return ' → ☂️ 우산 챙기세요';

  return '';
}
