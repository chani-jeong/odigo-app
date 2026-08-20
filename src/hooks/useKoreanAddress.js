import { useState, useEffect, useRef } from 'react';

const cache = {};

/**
 * 카카오 좌표→주소 변환 훅
 * selectedLanguage가 'ko'일 때만 API 호출하며, 결과는 좌표별로 캐싱
 */
export default function useKoreanAddress(lat, lng, fallbackAddress, selectedLanguage) {
  const [address, setAddress] = useState(fallbackAddress);
  const abortRef = useRef(null);

  useEffect(() => {
    if (selectedLanguage !== 'ko') {
      setAddress(fallbackAddress);
      return;
    }
    if (!lat || !lng) {
      setAddress(fallbackAddress);
      return;
    }

    const key = `${lat},${lng}`;

    if (cache[key]) {
      setAddress(cache[key]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY || import.meta.env.VITE_KAKAO_MAP_KEY;

    fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
        signal: controller.signal,
      }
    )
      .then(res => res.json())
      .then(data => {
        const doc = data?.documents?.[0];
        if (doc) {
          const korean =
            doc.road_address?.address_name ||
            doc.address?.address_name ||
            fallbackAddress;
          cache[key] = korean;
          setAddress(korean);
        } else {
          setAddress(fallbackAddress);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('useKoreanAddress error:', err);
          setAddress(fallbackAddress);
        }
      });

    return () => controller.abort();
  }, [lat, lng, selectedLanguage, fallbackAddress]);

  return address;
}
