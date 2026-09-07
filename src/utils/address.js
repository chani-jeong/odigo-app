// 한글 주소 문자열을 "시/도 + 구(군)" 수준까지만 잘라서 반환한다.
// 예) "서울특별시 성동구 성수이로 16길 5" -> "서울특별시 성동구"
//     "서울 성동구 성수이로7가길 13" -> "서울 성동구"
//     "경기도 성남시 분당구 판교역로 240" -> "경기도 성남시 분당구"
//     "제주특별자치도 제주시 ..." -> "제주특별자치도 제주시"
//     "52, Seongsui-ro 4-gil, Seongdong-gu, Seoul (서울 성동구 ...)" -> "서울 성동구"
//
// 영문+한글 혼합 주소는 괄호 안의 한글을 우선 사용한다.
// 행정구역 약칭(서울, 경기 등)과 시/도/구/군 토큰만 누적하고,
// 구/군을 만나거나 다음이 도로명·번지면 종료한다.
const ADMIN_UNIT_PATTERN = /(시|도|구|군)$/;
const REGION_ABBREVS = new Set([
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '제주',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남',
]);

function cleanToken(token) {
  return token.replace(/[.,]/g, '');
}

function isAdminToken(token) {
  const cleaned = cleanToken(token);
  return ADMIN_UNIT_PATTERN.test(cleaned) || REGION_ABBREVS.has(cleaned);
}

function isGuGun(token) {
  const cleaned = cleanToken(token);
  if (REGION_ABBREVS.has(cleaned)) return false;
  return /(구|군)$/.test(cleaned);
}

function extractKoreanSource(fullAddress) {
  const parenMatch = fullAddress.match(/\(([^)]*[\uAC00-\uD7A3][^)]*)\)/);
  if (parenMatch) return parenMatch[1];

  const koreanStart = fullAddress.search(/[\uAC00-\uD7A3]/);
  if (koreanStart >= 0) return fullAddress.slice(koreanStart);

  return null;
}

function shortenKorean(koreanAddress) {
  const tokens = koreanAddress.replace(/,/g, ' ').trim().split(/\s+/).filter(Boolean);
  const parts = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!isAdminToken(token)) {
      if (parts.length === 0) continue;
      break;
    }

    parts.push(cleanToken(token));

    if (isGuGun(token)) break;

    const next = tokens[i + 1];
    if (!next || !isAdminToken(next)) break;
  }

  return parts.join(' ');
}

function shortenEnglish(fullAddress) {
  const parts = fullAddress
    .split('(')[0]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const districtIdx = parts.findIndex((part) => /-(gu|gun)$/i.test(part));
  if (districtIdx >= 0) {
    const district = parts[districtIdx];
    const city = parts[districtIdx + 1];
    return city ? `${district}, ${city}` : district;
  }

  const siIdx = parts.findIndex((part) => /-si$/i.test(part));
  if (siIdx >= 0) {
    const city = parts[siIdx];
    const region = parts[siIdx + 1];
    return region ? `${city}, ${region}` : city;
  }

  return '';
}

export function getShortAddress(fullAddress) {
  if (!fullAddress || typeof fullAddress !== 'string') return fullAddress || '';

  const koreanSource = extractKoreanSource(fullAddress);
  if (koreanSource) {
    const shortened = shortenKorean(koreanSource);
    if (shortened) return shortened;
  }

  const english = shortenEnglish(fullAddress);
  if (english) return english;

  return fullAddress;
}
