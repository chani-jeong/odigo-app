import React from 'react';
import { IconCalendarOff } from '@tabler/icons-react';

// "종료된 팝업"을 나타내는 공용 뱃지.
// 기존 "Foreigner-Ready" 뱃지와 동일한 pill 형태/크기를 쓰되,
// 회색 배경 + 흰 텍스트로 시각적으로 구분한다.
export default function EndedBadge({ label, style }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(26,26,26,0.75)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <IconCalendarOff size={14} />
      {label}
    </div>
  );
}
