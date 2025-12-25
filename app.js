const metroStations = [
  { name: 'Центр Нальчика', color: '#22c55e', walk: 5 },
];

const services = [
  {
    id: 'clean',
    title: 'Чистка лица',
    desc: 'Базовая чистка для очищения и выравнивания тона.',
    duration: 60,
    tag: 'Уход',
    price: 2500,
  },
  {
    id: 'capill',
    title: 'Капилляротерапия лица',
    desc: 'Укрепление капилляров и улучшение микроциркуляции.',
    duration: 45,
    tag: 'Уход',
    price: 2000,
  },
  {
    id: 'peeling',
    title: 'Пилинг',
    desc: 'Мягкое обновление кожи и выравнивание рельефа.',
    duration: 40,
    tag: 'Пилинг',
    price: 1000,
  },
  {
    id: 'hijama',
    title: 'Хиджама',
    desc: 'Точечная процедура для общего восстановления.',
    duration: 50,
    tag: 'Процедура',
    price: 1000,
  },
  {
    id: 'complex',
    title: 'Комплекс: чистка + капилляротерапия + пилинг',
    desc: 'Последовательный комплекс ухода за кожей.',
    duration: 90,
    tag: 'Комплекс',
    price: 3000,
  },
  {
    id: 'ears',
    title: 'Прокол ушей',
    desc: 'Аккуратный прокол с соблюдением стерильности.',
    duration: 25,
    tag: 'Пирсинг',
    price: 1000,
  },
  {
    id: 'piercing',
    title: 'Пирсинг',
    desc: 'Профессиональный пирсинг выбранной зоны.',
    duration: 30,
    tag: 'Пирсинг',
    price: 3000,
  },
  {
    id: 'lips-sardenya-1',
    title: 'Губы: Sardenya 1 мл',
    desc: 'Контур и объём на филлере Sardenya.',
    duration: 50,
    tag: 'Губы',
    price: 8000,
  },
  {
    id: 'lips-sardenya-05',
    title: 'Губы: Sardenya 0,5 мл',
    desc: 'Лёгкое увеличение и увлажнение губ.',
    duration: 45,
    tag: 'Губы',
    price: 5500,
  },
  {
    id: 'lips-stylage-1',
    title: 'Губы: STYLAGE 1 мл',
    desc: 'Выраженное увеличение с филлером STYLAGE.',
    duration: 50,
    tag: 'Губы',
    price: 12000,
  },
  {
    id: 'lips-stylage-05',
    title: 'Губы: STYLAGE 0,5 мл',
    desc: 'Деликатный объём и чёткий контур.',
    duration: 45,
    tag: 'Губы',
    price: 8500,
  },
];

const schedule = buildSchedule();

const state = {
  selectedServiceId: services[0].id,
  selectedDate: schedule[0].key,
  selectedTime: schedule[0].slots[0],
};

const els = {
  metroList: document.getElementById('metroList'),
  serviceSelect: document.getElementById('serviceSelect'),
  serviceCards: document.getElementById('serviceCards'),
  dateList: document.getElementById('dateList'),
  timeList: document.getElementById('timeList'),
  bookingForm: document.getElementById('bookingForm'),
  reviewForm: document.getElementById('reviewForm'),
  reviewsList: document.getElementById('reviewsList'),
  ratingValue: document.getElementById('ratingValue'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modalBody'),
  closeModal: document.getElementById('closeModal'),
  videoTrigger: document.getElementById('videoTrigger'),
  openMap: document.getElementById('openMap'),
  statusTime: document.getElementById('statusTime'),
  selectedServiceHint: document.getElementById('selectedServiceHint'),
};

init();

function init() {
  renderStatusTime();
  renderMetro();
  renderServices();
  renderSchedule();
  bindGlobalEvents();
  loadReviews();
}

function renderStatusTime() {
  const now = new Date();
  const str = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  els.statusTime.textContent = str;
}

function renderMetro() {
  els.metroList.innerHTML = metroStations
    .map(
      (m) =>
        `<div class="metro-item"><span class="metro-dot" style="background:${m.color}"></span>${m.name} · 🚶 ${m.walk} мин</div>`
    )
    .join('');
}

function renderServices() {
  els.serviceSelect.innerHTML = services
    .map((s) => `<option value="${s.id}">${s.title}</option>`)
    .join('');
  els.serviceSelect.value = state.selectedServiceId;

  els.serviceCards.innerHTML = services
    .map((s) => serviceCardTemplate(s, s.id === state.selectedServiceId))
    .join('');

  updateServiceHint();
}

function renderSchedule() {
  els.dateList.innerHTML = schedule
    .map((day) => dateChipTemplate(day, day.key === state.selectedDate))
    .join('');

  els.timeList.innerHTML = slotsForSelectedDate()
    .map((time) => timeButtonTemplate(time, time === state.selectedTime))
    .join('');
}

function bindGlobalEvents() {
  els.serviceSelect.addEventListener('change', (e) => {
    state.selectedServiceId = e.target.value;
    renderServices();
  });

  els.serviceCards.addEventListener('click', (e) => {
    const card = e.target.closest('.service-card');
    if (!card) return;
    state.selectedServiceId = card.dataset.id;
    renderServices();
  });

  els.dateList.addEventListener('click', (e) => {
    const chip = e.target.closest('.date-chip');
    if (!chip) return;
    state.selectedDate = chip.dataset.key;
    state.selectedTime = schedule.find((d) => d.key === state.selectedDate).slots[0];
    renderSchedule();
  });

  els.timeList.addEventListener('click', (e) => {
    const btn = e.target.closest('.time-slot');
    if (!btn) return;
    state.selectedTime = btn.dataset.time;
    renderSchedule();
  });

  els.bookingForm.addEventListener('submit', handleBooking);

  els.closeModal.addEventListener('click', hideModal);
  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) hideModal();
  });

  els.videoTrigger.addEventListener('click', () =>
    showModal(`
      <h3>Видео-приветствие</h3>
      <p>Привет! Я Алина Темиржанова, косметолог-эстетист. Помогу подобрать уход, безопасно сделать процедуры и подобрать филлеры для губ. Пока видео грузится — выберите время приёма.</p>
    `)
  );

  els.openMap.addEventListener('click', () => {
    window.open('https://yandex.ru/maps/?text=Нальчик, Байсултанова 35г', '_blank');
  });

  // Обработка формы отзывов
  els.reviewForm.addEventListener('submit', handleReview);

  // Обработка звёзд рейтинга
  const starButtons = document.querySelectorAll('.star-btn');
  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.dataset.rating);
      setRating(rating);
    });
  });
}

function handleBooking(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name')?.trim();
  const phone = formData.get('phone')?.trim();
  const email = formData.get('email')?.trim();
  const comment = formData.get('comment')?.trim();

  if (!name || !phone) {
    showModal('<h3>Проверьте данные</h3><p>Имя и телефон обязательны для подтверждения записи.</p>');
    return;
  }

  const booking = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    service: getSelectedService().title,
    price: getSelectedService().price,
    date: state.selectedDate,
    time: state.selectedTime,
    name,
    phone,
    email,
    comment,
    createdAt: new Date().toISOString(),
  };

  // Отправляем на бэкенд
  fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || 'Ошибка при создании записи. Попробуйте ещё раз.';
        throw new Error(msg);
      }
      return res.json();
    })
    .then((data) => {
      const saved = data.booking || booking;

      showModal(`
        <h3>Запись создана</h3>
        <div class="success">
          <span>✅</span>
          <div>
            <div>${saved.service}</div>
            <div>${formatDateHuman(saved.date)}, ${saved.time}</div>
            <div>${formatMoney(saved.price)}</div>
          </div>
        </div>
        <p>Мы свяжемся с вами в течение 2 минут по телефону ${saved.phone}.</p>
      `);

      e.target.reset();
    })
    .catch((err) => {
      console.error(err);
      showModal(`<h3>Что-то пошло не так</h3><p>${err.message}</p>`);
    });
}

function serviceCardTemplate(service, active) {
  return `
    <article class="service-card ${active ? 'active' : ''}" data-id="${service.id}">
      <div class="service-top">
        <div class="service-title">${service.title}</div>
        <div class="price-pill">${formatMoney(service.price)}</div>
      </div>
      <div class="service-desc">${service.desc}</div>
      <div class="service-meta">
        <span class="tag">${service.tag}</span>
        <span>⏱ ${service.duration} мин</span>
      </div>
    </article>
  `;
}

function dateChipTemplate(day, active) {
  return `
    <button class="date-chip ${active ? 'active' : ''}" data-key="${day.key}">
      <div class="weekday">${day.weekday}</div>
      <div class="day">${day.label}</div>
    </button>
  `;
}

function timeButtonTemplate(time, active) {
  return `<button class="time-slot ${active ? 'active' : ''}" data-time="${time}">${time}</button>`;
}

function formatMoney(amount) {
  return amount.toLocaleString('ru-RU') + ' ₽';
}

function buildSchedule() {
  const days = [];
  const base = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.getDate() + ' ' + d.toLocaleString('ru-RU', { month: 'short' }),
      weekday: d.toLocaleString('ru-RU', { weekday: 'short' }),
      slots: ['10:00', '13:00', '15:30', '16:30', '17:30', '18:30', '20:00', '21:00'],
    });
  }
  return days;
}

function slotsForSelectedDate() {
  const day = schedule.find((d) => d.key === state.selectedDate);
  return day ? day.slots : [];
}

function getSelectedService() {
  return services.find((s) => s.id === state.selectedServiceId) || services[0];
}

function formatDateHuman(dateKey) {
  const d = new Date(dateKey);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
}

function showModal(html) {
  els.modalBody.innerHTML = html;
  els.modal.classList.remove('hidden');
}

function hideModal() {
  els.modal.classList.add('hidden');
}

function updateServiceHint() {
  const s = getSelectedService();
  els.selectedServiceHint.textContent = `${s.title} · ${s.duration} мин`;
}

// Функция localStorage больше не используется, но можно оставить при желании как запасной вариант

// ========== ФУНКЦИИ ДЛЯ ОТЗЫВОВ ==========

function setRating(rating) {
  els.ratingValue.value = rating;
  const starButtons = document.querySelectorAll('.star-btn');
  starButtons.forEach((btn, index) => {
    if (index < rating) {
      btn.classList.add('active');
      btn.style.color = '#f59e0b';
    } else {
      btn.classList.remove('active');
      btn.style.color = '#d1d5db';
    }
  });
}

function handleReview(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name')?.trim();
  const rating = parseInt(els.ratingValue.value);
  const text = formData.get('text')?.trim();

  if (!name || !rating || !text) {
    showModal('<h3>Проверьте данные</h3><p>Заполните все поля: имя, оценка и текст отзыва.</p>');
    return;
  }

  if (rating < 1 || rating > 5) {
    showModal('<h3>Ошибка</h3><p>Выберите оценку от 1 до 5 звёзд.</p>');
    return;
  }

  const review = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    rating,
    text,
    createdAt: new Date().toISOString(),
  };

  fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  })
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || 'Ошибка при отправке отзыва. Попробуйте ещё раз.';
        throw new Error(msg);
      }
      return res.json();
    })
    .then(() => {
      showModal('<h3>Спасибо!</h3><p>Ваш отзыв успешно добавлен и будет виден всем посетителям.</p>');
      e.target.reset();
      setRating(0);
      loadReviews();
    })
    .catch((err) => {
      console.error(err);
      showModal(`<h3>Что-то пошло не так</h3><p>${err.message}</p>`);
    });
}

function loadReviews() {
  els.reviewsList.innerHTML = '<div class="loading">Загрузка отзывов...</div>';

  fetch('/api/reviews')
    .then((res) => res.json())
    .then((reviews) => {
      if (reviews.length === 0) {
        els.reviewsList.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
        return;
      }

      els.reviewsList.innerHTML = reviews.map((review) => reviewTemplate(review)).join('');
    })
    .catch((err) => {
      console.error(err);
      els.reviewsList.innerHTML = '<div class="error">Не удалось загрузить отзывы. Попробуйте обновить страницу.</div>';
    });
}

function reviewTemplate(review) {
  const date = new Date(review.createdAt);
  const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

  return `
    <article class="review-card">
      <div class="review-header">
        <div class="review-author">${escapeHtml(review.name)}</div>
        <div class="review-date">${dateStr}</div>
      </div>
      <div class="review-rating">${stars}</div>
      <div class="review-text">${escapeHtml(review.text)}</div>
    </article>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

