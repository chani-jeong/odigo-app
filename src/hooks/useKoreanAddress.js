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

    // Use Kakao Maps SDK Geocoder if available
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        const coord = new window.kakao.maps.LatLng(lat, lng);
        geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const doc = result[0];
            const korean =
              doc.road_address?.address_name ||
              doc.address?.address_name ||
              fallbackAddress;
            cache[key] = korean;
            setAddress(korean);
          } else {
            setAddress(fallbackAddress);
          }
        });
      });
    } else {
      setAddress(fallbackAddress);
    }
  }, [lat, lng, selectedLanguage, fallbackAddress]);

  return address;
}
