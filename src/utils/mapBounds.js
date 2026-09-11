const AREA_LABELS_KO = {
  seongsu: '성수',
  hongdae: '홍대',
  gangnam: '강남',
  yeouido: '여의도',
  jamsil: '잠실',
  myeongdong: '명동',
  hannam: '한남',
  magok: '마곡',
  suwon: '수원',
  suwon_paldal: '수원 팔달',
  suwon_jangan: '수원 장안',
  seongnam_bundang: '성남 분당',
  hanam: '하남',
  yongin_cheoin: '용인 처인',
  gwangju_gyeonggi: '경기 광주',
  gimpo: '김포',
  busan_haeundae: '부산 해운대',
  busan_bujin: '부산 부산진',
  busan_gijang: '부산 기장',
  daegu_jung: '대구 중구',
  daegu_dong: '대구 동구',
  daejeon_yuseong: '대전 유성',
  daejeon_jung: '대전 중구',
  cheongju_heungdeok: '청주 흥덕',
  cheonan_dongnam: '천안 동남',
  jeju: '제주',
  seogwipo: '서귀포',
  jeonju_wansan: '전주 완산',
  changwon_seongsan: '창원 성산',
  yongsan: '용산',
  jung: '중구',
};

export function formatAreaLabel(area, lang = 'en') {
  if (!area) return '';
  if (lang === 'ko' && AREA_LABELS_KO[area]) return AREA_LABELS_KO[area];
  return area
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function fitMapToPopups(map, popups) {
  if (!map || !window.kakao?.maps || !Array.isArray(popups)) return;

  const withLoc = popups.filter((p) => p?.location?.lat && p?.location?.lng);
  if (withLoc.length === 0) return;

  if (withLoc.length === 1) {
    map.setCenter(new window.kakao.maps.LatLng(withLoc[0].location.lat, withLoc[0].location.lng));
    map.setLevel(5);
    return;
  }

  const bounds = new window.kakao.maps.LatLngBounds();
  withLoc.forEach((p) => {
    bounds.extend(new window.kakao.maps.LatLng(p.location.lat, p.location.lng));
  });
  // 상단 필터·하단 캐러셀이 핀을 가리지 않도록 패딩
  map.setBounds(bounds, 100, 40, 260, 40);
}

export const MAP_CATEGORIES = [
  'beauty_fashion',
  'food',
  'character',
  'kpop',
  'lifestyle',
  'exhibition',
];
