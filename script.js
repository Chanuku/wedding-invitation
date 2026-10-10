// 사진 교체: assets에 사진을 넣고 아래 src와 alt만 수정하세요.
const photos = [
  { src: 'assets/sample-3.png', alt: '샘플 3 · 우리의 웨딩 이야기' },
  { src: 'assets/sample-4.png', alt: '샘플 4 · 함께하는 시작' },
];
// 이름·계좌 정보: wedding-data.csv를 구글 시트로 올리고 '웹에 게시(CSV)'한 주소를 넣어 주세요.
// 비워 두면 같은 폴더의 wedding-data.csv를 읽습니다(로컬 미리보기용, 저장소에는 올라가지 않음).
const DATA_URL = '';
// 데이터를 불러오기 전이나 실패했을 때 쓰는 기본값
const couple = {
  groom: { name: '신랑', short: '신랑', english: 'GROOM', initial: 'G' },
  bride: { name: '신부', short: '신부', english: 'BRIDE', initial: 'B' },
};
const $ = (id) => document.getElementById(id);
let timers = [];
let playing = false;
let autoTimer = null;
function playStory(manual = false) {
  if (playing || $('stage').classList.contains('opened')) return;
  clearInterval(autoTimer);
  autoTimer = null;
  playing = true;
  timers.forEach(clearTimeout);
  $('stage').classList.add('opened');
  $('openBox').disabled = true;
  $('replay').hidden = true;
  $('storyCaption').textContent = '우리의 이야기가 시작됩니다';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  timers.push(
    setTimeout(
      () => {
        $('groomBubble').classList.add('show');
        $('storyCaption').textContent =
          `${couple.groom.short}: ${withCall(couple.bride.short)} 나랑 결혼해줄래?`;
      },
      reduced ? 100 : 1200,
    ),
  );
  timers.push(
    setTimeout(
      () => {
        $('brideBubble').classList.add('show');
        $('stage').classList.add('accepted');
        $('storyCaption').textContent = `${couple.bride.short}: 너무 좋아요!`;
        $('replay').hidden = false;
        playing = false;
        if (manual) $('replay').focus({ preventScroll: true });
      },
      reduced ? 300 : 3300,
    ),
  );
}
function startCountdown() {
  clearInterval(autoTimer);
  let remaining = 5;
  $('autoCountdown').textContent = remaining;
  $('openBox').setAttribute('aria-label', '프러포즈 바로 보기. 5초 뒤 자동 재생');
  autoTimer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(autoTimer);
      autoTimer = null;
      playStory();
      return;
    }
    $('autoCountdown').textContent = remaining;
  }, 1000);
}
$('openBox').onclick = () => playStory(true);
$('replay').onclick = () => {
  timers.forEach(clearTimeout);
  $('stage').classList.remove('opened', 'accepted');
  $('groomBubble').classList.remove('show');
  $('brideBubble').classList.remove('show');
  $('openBox').disabled = false;
  $('replay').hidden = true;
  playing = false;
  $('storyCaption').textContent = '위 상자를 눌러 두 사람의 이야기를 만나 보세요';
  $('openBox').focus({ preventScroll: true });
  startCountdown();
};
if (document.readyState === 'complete') startCountdown();
else window.addEventListener('load', startCountdown, { once: true });
const grid = $('calendarGrid');
['일', '월', '화', '수', '목', '금', '토'].forEach((d, i) => {
  let s = document.createElement('span');
  s.textContent = d;
  s.className = 'dow' + (i === 0 ? ' sun' : '');
  grid.append(s);
});
grid.append(document.createElement('span'));
for (let d = 1; d <= 31; d++) {
  let s = document.createElement('span');
  s.textContent = d;
  s.className = d === 27 ? 'chosen' : d % 7 === 0 ? 'sun' : '';
  if (d === 27) s.setAttribute('aria-label', '27일 결혼식');
  grid.append(s);
}
const wedding = new Date('2027-03-27T17:30:00+09:00');
const days = Math.ceil((wedding - Date.now()) / 86400000);
function renderCountdown() {
  if (days > 0) {
    const strong = document.createElement('strong');
    strong.textContent = `${days}일`;
    $('countdown').replaceChildren(
      `${withAnd(couple.groom.short)} ${couple.bride.short}의 결혼식까지 `,
      strong,
      ' 남았습니다.',
    );
  } else {
    $('countdown').textContent =
      days === 0 ? '오늘, 저희 결혼합니다.' : '함께해 주셔서 감사합니다.';
  }
}
$('addCalendar').onclick = () => {
  const ics =
    'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wedding Invitation//KO\r\nBEGIN:VEVENT\r\nUID:wedding-20270327@wedding\r\nDTSTAMP:20261009T000000Z\r\nDTSTART:20270327T083000Z\r\n' +
    `SUMMARY:${couple.groom.name} ♥ ${couple.bride.name} 결혼식\r\n` +
    'LOCATION:JW 메리어트 호텔 서울 5층 그랜드볼룸 (서울 서초구 신반포로 176)\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  const u = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = u;
  a.download = `${couple.groom.short}-${couple.bride.short}-결혼식.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};
let current = 0;
const track = $('galleryTrack');
photos.forEach((p, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', p.alt + ' 크게 보기');
  const img = document.createElement('img');
  img.src = p.src;
  img.alt = p.alt;
  img.loading = 'lazy';
  b.append(img);
  let label = document.createElement('span');
  label.textContent = 'SAMPLE ' + String(i + 1).padStart(2, '0');
  b.append(label);
  b.onclick = () => {
    current = i;
    updateLight();
    $('lightbox').showModal();
  };
  track.append(b);
});
function go(i) {
  current = (i + photos.length) % photos.length;
  const b = track.children[current];
  track.scrollTo({
    left: b.offsetLeft - track.children[0].offsetLeft,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}
track.addEventListener(
  'scroll',
  () => {
    const width = track.children[0].getBoundingClientRect().width + 12;
    current = Math.max(0, Math.min(photos.length - 1, Math.round(track.scrollLeft / width)));
    $('photoCounter').textContent =
      String(current + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
  },
  { passive: true },
);
$('prev').onclick = () => go(current - 1);
$('next').onclick = () => go(current + 1);
track.onkeydown = (e) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    go(current + 1);
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    go(current - 1);
  }
};
function updateLight() {
  $('largePhoto').src = photos[current].src;
  $('largePhoto').alt = photos[current].alt;
  $('lightCounter').textContent = `${current + 1} / ${photos.length}`;
}
$('closeLightbox').onclick = () => $('lightbox').close();
function lightGo(n) {
  current = (current + n + photos.length) % photos.length;
  updateLight();
}
$('lightPrev').onclick = () => lightGo(-1);
$('lightNext').onclick = () => lightGo(1);
$('lightbox').onkeydown = (e) => {
  if (e.key === 'ArrowRight') lightGo(1);
  if (e.key === 'ArrowLeft') lightGo(-1);
};
let touchX = 0;
$('largePhoto').addEventListener('touchstart', (e) => (touchX = e.changedTouches[0].clientX), {
  passive: true,
});
$('largePhoto').addEventListener(
  'touchend',
  (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) lightGo(dx < 0 ? 1 : -1);
  },
  { passive: true },
);
function toast(t) {
  $('toast').textContent = t;
  $('toast').classList.add('visible');
  setTimeout(() => $('toast').classList.remove('visible'), 2600);
}
async function copy(t) {
  try {
    await navigator.clipboard.writeText(t);
    toast('복사했습니다');
  } catch {
    prompt('아래 내용을 복사해 주세요', t);
  }
}
$('copyAddress').onclick = () =>
  copy('서울 서초구 신반포로 176 JW 메리어트 호텔 서울 5층 그랜드볼룸');
$('share').onclick = async () => {
  try {
    if (navigator.share)
      await navigator.share({
        title: document.title,
        text: '2027년 3월 27일 오후 5시 30분 · JW 메리어트 호텔 서울 5층 그랜드볼룸',
        url: location.href,
      });
    else await copy(location.href);
  } catch (e) {
    if (e.name !== 'AbortError') await copy(location.href);
  }
};
function renderAccounts(list, container, side) {
  container.replaceChildren();
  list.forEach((acc, i) => {
    const id = `account-${side}-${i}`;
    const ready = Boolean(acc.bank && acc.number);
    const item = document.createElement('div');
    item.className = 'account-item';
    item.innerHTML = `
      <button class="account-toggle" aria-expanded="false" aria-controls="${id}">
        <span class="account-role"></span><span class="account-name"></span>
        <span class="account-chevron" aria-hidden="true"></span>
      </button>
      <div class="account-panel" id="${id}" role="region">
        <div class="account-inner">
          <div class="account-info">
            <span class="account-bank"></span>
            <span class="account-number"></span>
            <span class="account-holder"></span>
          </div>
          <button class="account-copy">복사</button>
        </div>
      </div>`;
    item.querySelector('.account-role').textContent = acc.role;
    item.querySelector('.account-name').textContent = acc.name;
    item.querySelector('.account-bank').textContent = ready ? acc.bank : '계좌 정보 준비 중';
    item.querySelector('.account-number').textContent = ready ? acc.number : '-';
    item.querySelector('.account-holder').textContent = '예금주 ' + acc.name;
    const toggle = item.querySelector('.account-toggle');
    const copyButton = item.querySelector('.account-copy');
    copyButton.disabled = !ready;
    copyButton.tabIndex = -1;
    toggle.onclick = () => {
      const open = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      copyButton.tabIndex = open ? 0 : -1;
    };
    copyButton.onclick = () => copy(`${acc.bank} ${acc.number}`);
    container.append(item);
  });
}
// 받침 유무에 따라 '민준과 / 지후와', '민준아 / 지후야'처럼 조사를 고릅니다.
function hasBatchim(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}
const withAnd = (word) => word + (hasBatchim(word) ? '과' : '와');
const withCall = (word) => word + (hasBatchim(word) ? '아' : '야');
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) rows.push([...row, cell]);
  const [header = [], ...body] = rows.filter((r) => r.some((v) => v.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || '').trim()])));
}
function applyData(rows) {
  const people = { groom: [], bride: [] };
  rows.forEach((r) => {
    const side = { 신랑: 'groom', 신부: 'bride' }[r['구분']];
    if (!side) return;
    people[side].push({ role: r['역할'], name: r['이름'], bank: r['은행'], number: r['계좌번호'] });
    if (r['역할'] === r['구분']) {
      couple[side] = {
        name: r['이름'],
        short: r['부르는이름'] || r['이름'],
        english: r['영문이름'] || couple[side].english,
        initial: r['이니셜'] || couple[side].initial,
      };
    }
  });
  const parents = (side, self) =>
    people[side]
      .filter((p) => p.role !== self)
      .map((p) => p.name)
      .join(' · ');
  const fields = {
    groomName: couple.groom.name,
    brideName: couple.bride.name,
    groomShort: couple.groom.short,
    brideShort: couple.bride.short,
    groomEnglish: couple.groom.english,
    brideEnglish: couple.bride.english,
    groomInitial: couple.groom.initial,
    brideInitial: couple.bride.initial,
    groomParents: parents('groom', '신랑'),
    brideParents: parents('bride', '신부'),
    brideCall: withCall(couple.bride.short),
  };
  document.querySelectorAll('[data-field]').forEach((el) => {
    el.textContent = fields[el.dataset.field];
  });
  if (rows.length)
    document.title = `${withAnd(couple.groom.short)} ${couple.bride.short}, 결혼합니다`;
  renderCountdown();
  renderAccounts(people.groom, $('groomAccounts'), 'groom');
  renderAccounts(people.bride, $('brideAccounts'), 'bride');
}
applyData([]);
fetch(DATA_URL || 'wedding-data.csv', { cache: 'no-store' })
  .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
  .then((text) => applyData(parseCsv(text)))
  .catch(() => console.warn('이름·계좌 정보를 불러오지 못했습니다. DATA_URL을 확인해 주세요.'));
