import { isPopupEnded } from './popupStatus';

const FRONT_MIN = 3;
const FRONT_MAX = 4;

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickFrontCount(matchingCount) {
  if (matchingCount <= FRONT_MIN) return matchingCount;
  return Math.random() < 0.5 ? FRONT_MIN : FRONT_MAX;
}

/**
 * Discover 스와이프 덱 인덱스 순서.
 * 1) 종료 팝업 제외
 * 2) (옵션) 이미 본 팝업 제외
 * 3) 관심사 매칭 카드 3~4장을 라운드로빈으로 뽑아 맨 앞
 * 4) 나머지 매칭 + 비매칭을 셔플해 뒤에 붙임
 * 관심사가 없으면 전체를 셔플
 */
export function buildActiveDeckOrder(
  events,
  { userInterests = [], seenPopupIds = [], excludeSeen = false } = {}
) {
  const seen = new Set(excludeSeen ? seenPopupIds : []);

  const activeIndices = events.reduce((acc, event, index) => {
    if (isPopupEnded(event)) return acc;
    if (seen.has(event.id)) return acc;
    acc.push(index);
    return acc;
  }, []);

  if (activeIndices.length === 0) return [];

  const interests = (userInterests || []).filter(Boolean);
  if (interests.length === 0) {
    return shuffle(activeIndices);
  }

  const matching = [];
  const nonMatching = [];
  for (const idx of activeIndices) {
    if (interests.includes(events[idx]?.category)) matching.push(idx);
    else nonMatching.push(idx);
  }

  if (matching.length === 0) {
    return shuffle(activeIndices);
  }

  const buckets = interests
    .map((interest) => shuffle(matching.filter((idx) => events[idx]?.category === interest)))
    .filter((bucket) => bucket.length > 0);

  const targetFront = pickFrontCount(matching.length);
  const front = [];
  while (front.length < targetFront) {
    let added = false;
    for (const bucket of buckets) {
      if (bucket.length > 0 && front.length < targetFront) {
        front.push(bucket.shift());
        added = true;
      }
    }
    if (!added) break;
  }

  const leftoverMatching = buckets.flat();
  const tail = shuffle([...leftoverMatching, ...nonMatching]);

  return [...shuffle(front), ...tail];
}

export const DECK_FRONT_SIZE = { min: FRONT_MIN, max: FRONT_MAX };
