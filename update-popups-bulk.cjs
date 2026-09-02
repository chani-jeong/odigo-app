const fs = require('fs');
const path = 'c:\\Users\\user\\Documents\\odigo-app\\src\\data\\popups.sample.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const nameKoMap = {
  'seongsu-ollio-2026': '올리오 팝업 : OLLIO SOCIETY CLUB',
  'yeouido-changeok-2026': '창억떡 팝업',
  'busan-pingu-2026': '핑구의 아이스크림 팝업',
  'suwon-buddhism-2026': '불교 팝업',
  'seongsu-edition-denmark-2026': '에디션 덴마크 X 비이커 성수 팝업',
  'seongsu-laka-oliveyoung-2026': '라카 X 올리브영 N 성수 팝업',
  'seongsu-shinramyun-bunsik-2026': '신라면분식 더 팩토리 팝업',
  'seongsu-toystory-2026': 'House of Toy Story 팝업',
  'seongsu-kpop-goods-2026': 'Kpop 굿즈 스토어',
  'seongsu-fuggler-finca-2026': '퍼글러 X 핀카 팝업',
  'seongsu-cortis-phonedown-2026': '코르티스 팝업 : PUT YOUR PHONE DOWN',
  'yeouido-banksy-stillhere-2026': '뱅크시 특별전 <BANKSY : Still Here>',
  'gangnam-pompompurin-bakery-2026': '폼폼푸린 베이커리 카페',
  'seongsu-ojos-popup-2026': '오호스 팝업',
  'seongsu-jomalone-seasalt-2026': '조말론 런던 팝업',
  'seongsu-oliveyoung-summerrecipe-2026': '올리브영 썸머 레시피 팝업',
  'seongsu-calvinklein-store-2026': '캘빈클라인 성수 스토어',
  'hongdae-popmart-riize-2026': '팝마트 X 라이즈 팝업 @ 홍대',
  'seongsu-torriden-deepdive-2026': '토리든 딥다이브 뉴스 팝업',
  'jamsil-pokemon-muleungdowon-2026': '포켓몬 무릉도원 팝업',
  'myeongdong-medicube-forevercherry-2026': '메디큐브 X 포에버체리 팝업',
  'hannam-soundsgood-2026': '사운즈굿 팝업',
  'hongdae-conan-boxcafe-2026': '명탐정 코난 콜라보 카페',
  'gangnam-bhc-flagship-2026': 'bhc 치킨 팝업',
};

const urlMap = {
  'seongsu-ollio-2026': 'https://www.instagram.com/p/DbfQLNmjNCa/',
  'yeouido-changeok-2026': 'https://www.instagram.com/p/Dbx0GXTD8hS/',
  'busan-pingu-2026': 'https://www.instagram.com/p/Db7yp8IE4X3/',
  'suwon-buddhism-2026': 'https://www.instagram.com/p/Db5pNIwIPcw/',
  'seongsu-edition-denmark-2026': 'https://www.instagram.com/p/Db5Nb0lJlWH/',
  'seongsu-laka-oliveyoung-2026': 'https://www.instagram.com/p/DbYINsYAUl4/',
  'seongsu-shinramyun-bunsik-2026': 'https://map.naver.com/p/entry/place/2082644987?placePath=%252Fhome%253Fentry%253Dplt&searchType=place&lng=127.0542863&lat=37.5424845&c=15.00,0,0,0,dh',
  'seongsu-toystory-2026': 'https://www.instagram.com/p/DYyvnsfk51x',
  'seongsu-kpop-goods-2026': 'https://www.instagram.com/mapdal_seoul/',
  'seongsu-fuggler-finca-2026': 'https://www.instagram.com/p/DbsVywWgX9b/',
  'seongsu-cortis-phonedown-2026': 'https://weverse.io/cortis/notice/38165',
  'yeouido-banksy-stillhere-2026': 'https://www.instagram.com/p/DZWQZbCGKiK/MzllZGZ4MnZkbzV6',
  'gangnam-pompompurin-bakery-2026': 'https://www.instagram.com/p/Da_tfWfDr1B',
  'seongsu-ojos-popup-2026': 'https://www.instagram.com/p/DbajnuymQKa/',
  'seongsu-jomalone-seasalt-2026': 'https://m.booking.naver.com/booking/12/bizes/1712600/items/7939991?area=bmp&map-search=1&startDateTime=2026-08-20T00%3A00%3A00%2B09%3A00',
  'seongsu-oliveyoung-summerrecipe-2026': 'https://www.instagram.com/p/DaPpTWBEtaa/',
  'seongsu-calvinklein-store-2026': 'https://map.naver.com/p/entry/place/2078711277?placePath=%2Fhome%3FfeedId%3D20916027%26from%3Dmap%26fromPanelNum%3D1%26additionalHeight%3D76%26timestamp%3D202608202244%26locale%3Dko%26svcName%3Dmap_pcv5&scrollTo=feed&from=map&fromPanelNum=1&additionalHeight=76&timestamp=202605291444&locale=ko&svcName=map_pcv5&searchType=place&lng=127.0555804&lat=37.5411505&c=15.00,0,0,0,dh',
  'hongdae-popmart-riize-2026': 'https://www.instagram.com/p/Db7ysQ9jGdb/',
  'seongsu-torriden-deepdive-2026': 'https://www.instagram.com/p/Db4eyr4E5qE/',
  'jamsil-pokemon-muleungdowon-2026': 'https://www.instagram.com/p/DbcQDxbPkdN/',
  'myeongdong-medicube-forevercherry-2026': 'https://www.instagram.com/p/Da6xqwoEeVG',
  'hannam-soundsgood-2026': 'https://www.instagram.com/p/DbnM16ATs2J/',
  'hongdae-conan-boxcafe-2026': 'https://www.instagram.com/p/DbnMr8LGOr4/',
  'gangnam-bhc-flagship-2026': 'https://www.instagram.com/p/Dbrskb6EXiP/',
};

let nameKoFilled = 0, urlFilled = 0;

data.forEach(popup => {
  // name.ko 추가
  const ko = nameKoMap[popup.id] || '';
  popup.name = { en: popup.name.en, ko };
  if (ko) nameKoFilled++;

  // access.url 업데이트
  const url = urlMap[popup.id] || '';
  if (!popup.access) popup.access = {};
  popup.access.url = url;
  if (url) urlFilled++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`Done: name.ko filled=${nameKoFilled}, access.url filled=${urlFilled}`);
