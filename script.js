let isAdmin = false, mxOn = false;
const SECRET_CODE = '7777';
const out = document.getElementById('out');

function log(t) {
  out.innerHTML += '<div>> ' + t + '</div>';
  out.scrollTop = out.scrollHeight;
}

function getDeviceModel() {
  const ua = navigator.userAgent;
  let model = 'ПК / Неизвестно';
  if (ua.indexOf('iPhone') > -1) model = 'Apple iPhone';
  else if (ua.indexOf('iPad') > -1) model = 'Apple iPad';
  else if (ua.indexOf('Android') > -1) {
    const parts = ua.split(';');
    const part2 = parts.length > 2 ? parts.slice(2, 3).join('') : '';
    const raw = part2 ? part2.split(')').slice(0, 1).join('').trim() : '';
    model = (raw && raw !== 'K') ? raw : 'Android Smartphone';
  } else if (ua.indexOf('Windows') > -1) model = 'Windows PC';
  else if (ua.indexOf('Mac OS') > -1) model = 'Apple Mac';
  return model + ' (' + screen.width + 'x' + screen.height + ')';
}

function auth() {
  const n = document.getElementById('nick').value.trim() || 'GHOST';
  const p = document.getElementById('pass').value.trim();
  isAdmin = (p === SECRET_CODE);
  document.getElementById('login').classList.add('hide');
  document.getElementById('panel').classList.remove('hide');
  document.getElementById('role').textContent = (isAdmin ? '★ ADMIN: ' : 'USER: ') + n.toUpperCase();
  log('Добро пожаловать, ' + n + '. Доступ: ' + (isAdmin ? 'ROOT (Админ)' : 'GUEST'));
  log('Нажми на точки радара или введи "help" в консоль.');
  loadInfo();
}

function loadInfo() {
  document.getElementById('dev').textContent = getDeviceModel();
  if (navigator.getBattery) {
    navigator.getBattery().then(function(b) {
      document.getElementById('bat').textContent = 'BAT: ' + Math.round(b.level * 100) + '%';
    });
  }
  const url = ['https://', 'ipwho', '.', 'is/'].join('');
  fetch(url).then(function(r) { return r.json(); }).then(function(d) {
    document.getElementById('ip').textContent = d.ip || 'Скрыт';
    document.getElementById('loc').textContent = (d.city || '?') + ', ' + (d.country || '?');
    document.getElementById('isp').textContent = (d.connection && d.connection.isp) || 'Неизвестно';
  }).catch(function() {
    document.getElementById('ip').textContent = '192.168.1.1 (Local)';
  });
}

function pingRadar() {
  log('[RADAR] Импульс отправлен. Кликни по белой точке для перехвата.');
}

function catchNode(e, name) {
  e.stopPropagation();
  log('[Перехват] Узел ' + name + ' взломан! Пакет данных расшифрован.');
}

function run() {
  const i = document.getElementById('cmd');
  if (!i.value.trim()) return;
  exec(i.value.trim().toLowerCase());
  i.value = '';
}

function exec(c) {
  log('$ ' + c);
  if (c === 'help') log('Команды: scan, matrix, alert, trace, clear');
  else if (c === 'scan') {
    log('Сканирование портов...');
    setTimeout(function() { log('Открыты порты: 80 (HTTP), 443 (HTTPS), 22 (SSH)'); }, 600);
  }
  else if (c === 'matrix') {
    mxOn = !mxOn;
    log('Фон Матрицы: ' + (mxOn ? 'ВКЛ' : 'ВЫКЛ'));
  }
  else if (c === 'alert') {
    if (!isAdmin) return log('ОШИБКА: Нужны права Администратора!');
    document.body.classList.toggle('red');
    log('ВНИМАНИЕ! Боевой режим переключен.');
  }
  else if (c === 'trace') log('Маршрут: localhost -> шлюз провайдера -> спутник [OK]');
  else if (c === 'clear') out.innerHTML = '';
  else log('Неизвестная команда. Введи help');
}

const cv = document.getElementById('mx'), ctx = cv.getContext('2d');
cv.width = innerWidth; cv.height = innerHeight;
const cols = Array(Math.floor(cv.width / 14)).fill(0);

setInterval(function() {
  if (!mxOn) { ctx.clearRect(0, 0, cv.width, cv.height); return; }
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = document.body.classList.contains('red') ? '#ff2a2a' : '#00ff41';
  cols.forEach(function(y, idx) {
    ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), idx * 14, y);
    cols[idx] = y > cv.height && Math.random() > 0.975 ? 0 : y + 14;
  });
}, 50);
