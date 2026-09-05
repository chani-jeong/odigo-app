import { IconWalk, IconCalendarCheck, IconTicket } from '@tabler/icons-react';

// access.booking_required 4단계 값에 대응하는 뱃지 메타 정보.
// "unknown" (확인 안 됨)은 뱃지를 표시하지 않으므로 여기 포함하지 않는다.
export const BOOKING_STATUS_META = {
  walkin_only: {
    labelKey: 'card.booking_walkin_only',
    bg: '#E8F5F4',
    color: '#2D9F98',
    Icon: IconWalk,
  },
  reservation_available: {
    labelKey: 'card.booking_reservation_available',
    bg: '#FFF4DA',
    color: '#B8860B',
    Icon: IconCalendarCheck,
  },
  reservation_required: {
    labelKey: 'card.booking_reservation_required',
    bg: '#FFE3E9',
    color: '#FF3670',
    Icon: IconTicket,
  },
};

// bookingRequired: "walkin_only" | "reservation_available" | "reservation_required" | "unknown"
// -> 매칭되는 메타 객체, 없으면(= "unknown"이거나 값이 없으면) null
export function getBookingStatusMeta(bookingRequired) {
  return BOOKING_STATUS_META[bookingRequired] || null;
}
