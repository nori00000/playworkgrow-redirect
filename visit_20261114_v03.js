(() => {
  'use strict';
  const todayKST = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  document.querySelectorAll('[data-until]').forEach(item => { if (todayKST > item.dataset.until) item.hidden = true; });
  const farm = { name: '놀일 농장', query: '경기도 고양시 일산서구 대화동 1667-4', address: '경기 고양시 일산서구 대화동 1667-4' };
  const cards = [...document.querySelectorAll('.place')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('status');
  let timer;
  const mapState = document.createElement('p');
  mapState.id = 'map-state';
  mapState.className = 'map-state';
  mapState.setAttribute('role', 'status');
  mapState.textContent = '지도를 불러오는 중입니다. 아래 네이버 지도 링크도 이용할 수 있습니다.';
  document.querySelector('.map-head').append(mapState);
  document.getElementById('place-map').addEventListener('load', () => { mapState.textContent = ''; });
  function announce(message) { clearTimeout(timer); status.textContent = message; timer = setTimeout(() => { status.textContent = ''; }, 5000); }
  function selectCategory(category) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    cards.forEach(card => { card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category); });
    document.getElementById('place-count').textContent = `주변 시설 ${cards.filter(card => !card.hidden).length}곳`;
    const first = cards.find(card => !card.hidden);
    showMap(category === 'all' ? farm : first.dataset, false);
  }
  filters.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.filter)));
  function showMap(place, scroll = true) {
    document.getElementById('map-title').textContent = place.name;
    document.getElementById('map-address').textContent = place.address;
    const frame = document.getElementById('place-map');
    mapState.textContent = '선택한 장소의 지도를 불러오는 중입니다.';
    frame.title = `${place.name} 위치 지도`;
    frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(place.query)}&output=embed&hl=ko&z=15`;
    document.getElementById('map-external').href = `https://map.naver.com/p/search/${encodeURIComponent(place.query)}`;
    if (scroll && window.matchMedia('(max-width: 720px)').matches) document.getElementById('map-panel').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    announce(`${place.name} 지도를 선택했습니다.`);
  }
  cards.forEach(card => card.querySelector('[data-show-map]').addEventListener('click', () => showMap(card.dataset)));
  document.getElementById('map-reset').addEventListener('click', () => showMap(farm, false));
  document.querySelectorAll('[data-reveal]').forEach(link => link.addEventListener('click', () => selectCategory('all')));
  function revealHash() {
    const card = cards.find(item => `#${item.id}` === location.hash);
    if (card && card.hidden) { selectCategory('all'); card.scrollIntoView(); }
  }
  window.addEventListener('hashchange', revealHash);
  async function copyText(text, success) {
    try { await navigator.clipboard.writeText(text); announce(success); }
    catch (_) {
      const field = document.createElement('textarea'); field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
      let copied = false; try { copied = document.execCommand('copy'); } catch (_) { /* Show selectable text below. */ } field.remove();
      announce(copied ? success : text);
    }
  }
  document.getElementById('copy-address').addEventListener('click', () => copyText(farm.query, '농장 주소를 복사했습니다.'));
  document.getElementById('share').addEventListener('click', async () => {
    const url = 'https://playworkgrow.club/visit.html';
    if (navigator.share) {
      try { await navigator.share({ title: '놀일 · 아지트 만들기', text: '맨땅에서 시작하는 아지트 만들기와 농장 방문 안내를 확인하세요.', url }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    await copyText(url, '방문 안내 링크를 복사했습니다.');
  });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
})();
