// 팝업의 "종료 여부"를 판단하는 공용 유틸.
// period.end 날짜(day 단위)가 오늘보다 이전이면 종료된 것으로 간주한다.
// (종료일 당일까지는 아직 진행 중으로 취급 — DiscoverList의 D-day 계산과 동일한 기준)
export function isPopupEnded(popup) {
  if (!popup?.period?.end) return false;

  const end = new Date(popup.period.end);
  if (Number.isNaN(end.getTime())) return false;
  end.setHours(23, 59, 59, 999);

  return end < new Date();
}

// 진행 중인 팝업(isPopupEnded === false)을 앞으로, 종료된 팝업을 뒤로 보내는 안정 정렬.
// 각 그룹(진행중/종료) 내부의 상대적 순서는 그대로 유지된다.
// Array.prototype.sort는 ES2019+ 스펙상 안정 정렬이 보장되므로 별도의 인덱스 태깅이 필요 없다.
// 원본 배열은 변경하지 않고 새 배열을 반환한다.
export function sortByEndedStatus(popups) {
  if (!Array.isArray(popups)) return popups;
  return [...popups].sort((a, b) => Number(isPopupEnded(a)) - Number(isPopupEnded(b)));
}
