// 한글 주소 문자열을 "시/도 + 구(군)" 수준까지만 잘라서 반환한다.
// 예) "서울특별시 성동구 성수이로 16길 5" -> "서울특별시 성동구"
//     "경기도 성남시 분당구 판교역로 240" -> "경기도 성남시 분당구" (구가 나오는 시점까지 포함)
//     "제주특별자치도 제주시 ..." -> "제주특별자치도 제주시" (구 단위가 없는 지역은 시/도 다음 단위까지만)
//
// 행정구역 단위(시/도/구/군)로 끝나는 토큰만 순서대로 누적하고,
// - "구" 또는 "군"으로 끝나는 토큰을 만나면 그 토큰까지 포함해 종료
// - 다음 토큰이 행정구역 단위가 아니면(도로명, 번지 등) 그 앞에서 종료
// 영문 주소 등 패턴에 맞지 않는 문자열은 원본 그대로 반환한다.
const ADMIN_UNIT_PATTERN = /(시|도|구|군)$/;

export function getShortAddress(fullAddress) {
  if (!fullAddress || typeof fullAddress !== 'string') return fullAddress || '';

  const tokens = fullAddress.trim().split(/\s+/).filter(Boolean);
  const parts = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!ADMIN_UNIT_PATTERN.test(token)) break;

    parts.push(token);

    if (/(구|군)$/.test(token)) break; // 구/군까지 포함했으면 종료

    const next = tokens[i + 1];
    if (!next || !ADMIN_UNIT_PATTERN.test(next)) break; // 다음이 도로명 등이면 여기서 종료
  }

  return parts.length > 0 ? parts.join(' ') : fullAddress;
}
