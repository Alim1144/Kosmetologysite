const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// Настройки Telegram (нужно задать в переменных окружения)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(cors());
app.use(express.json());

// API маршруты должны быть до статики
// Создание записи
app.post('/api/bookings', (req, res) => {
  const booking = req.body;

  if (!booking || !booking.name || !booking.phone || !booking.service || !booking.date || !booking.time) {
    return res.status(400).json({ message: 'Не хватает обязательных полей' });
  }

  const record = {
    ...booking,
    id: booking.id || String(Date.now()),
    createdAt: booking.createdAt || new Date().toISOString(),
  };

  fs.readFile(BOOKINGS_FILE, 'utf8', (err, data) => {
    const list = !err && data ? safeParse(data) : [];
    list.push(record);

    fs.writeFile(BOOKINGS_FILE, JSON.stringify(list, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Ошибка записи файла бронирований:', writeErr);
        return res.status(500).json({ message: 'Не удалось сохранить запись' });
      }

      // Пытаемся отправить уведомление в Telegram (ошибка не ломает API)
      sendTelegramNotification(record);

      console.log('Новая запись:', record);
      res.status(201).json({ message: 'Запись сохранена', booking: record });
    });
  });
});

// Просмотр всех записей
app.get('/api/bookings', (req, res) => {
  fs.readFile(BOOKINGS_FILE, 'utf8', (err, data) => {
    if (err || !data) return res.json([]);
    res.json(safeParse(data));
  });
});

function safeParse(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sendTelegramNotification(booking) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — уведомление не отправлено');
    return;
  }

  const text =
    `🧴 Новая запись с сайта\n\n` +
    `<b>Услуга:</b> ${booking.service}\n` +
    `<b>Дата:</b> ${booking.date} ${booking.time}\n` +
    `<b>Цена:</b> ${booking.price} ₽\n\n` +
    `<b>Имя:</b> ${booking.name}\n` +
    `<b>Телефон:</b> ${booking.phone}\n` +
    (booking.email ? `<b>E-mail:</b> ${booking.email}\n` : '') +
    (booking.comment ? `<b>Комментарий:</b> ${booking.comment}\n` : '') +
    `\n#запись #косметолог`;

  const postData = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    res.on('data', () => {});
  });

  req.on('error', (err) => {
    console.error('Ошибка отправки в Telegram:', err.message);
  });

  req.write(postData);
  req.end();
}

// Отдаём статику (CSS, JS) после API маршрутов, но без автоматического index.html
app.use(express.static(__dirname, { index: false }));

// Явно отдаём index.html для корневого пути
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
