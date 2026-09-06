// 카테고리 뱃지 / 예약상태(booking) 뱃지 / Foreigner-Ready 뱃지 등
// "작은 정보 뱃지" 전반에서 공유하는 기본 pill 스타일.
//
// 배경색(background)·글자색(color)만 뱃지마다 다르게 지정하고,
// padding / font-size / border-radius / font-family 등 크기·모양은 항상 이 값을 통해 통일한다.
// (기존에는 카테고리 뱃지가 border+큰 padding으로 다른 뱃지보다 크고 사각형으로 튀는 문제가 있었음)
export const PILL_BADGE_BASE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 'bold',
  fontFamily: 'var(--font-sans)',
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
};
