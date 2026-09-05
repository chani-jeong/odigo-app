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
