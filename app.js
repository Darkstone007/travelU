// app.js
// shared stuff every page uses: saving data, the nav, icons, popups, trips and bookings.
// there's no server, so everything is kept in localStorage (it stays when you change pages).

// ---------- saving ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('tu_' + key)
      return v ? JSON.parse(v) : fallback
    } catch (e) {
      return fallback
    }
  },
  set(key, value) {
    localStorage.setItem('tu_' + key, JSON.stringify(value))
  }
}

// ---------- tiny helpers ----------
const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const param = (name) => new URLSearchParams(location.search).get(name) || ''
const uid = () => Math.random().toString(36).slice(2, 9)
const money = (n) => '$' + Math.round(n).toLocaleString('en-US')

// dates are stored as yyyy-mm-dd strings, this makes them readable. T12 so timezones dont move the day
function fmtDate(iso, withDay) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  const opts = withDay ? { weekday: 'short', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short' }
  return d.toLocaleDateString('en-GB', opts)
}
function todayISO() { return new Date().toISOString().slice(0, 10) }
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
// escape stuff before putting it in innerHTML (names people type etc)
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's') }

// ---------- user ----------
function getName() { return store.get('name', '') }
function setName(n) { store.set('name', n.trim()) }
function initial(n) { return (n || '?').trim().charAt(0).toUpperCase() }

// ---------- icons (same set as the design) ----------
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  trip: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  group: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  plane: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14a3 3 0 0 0-3-3h-8v3"/><circle cx="6.5" cy="11" r="1.5"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  bus: '<rect x="5" y="3" width="14" height="14" rx="2.5"/><path d="M5 10h14M8.5 21l1-4M15.5 21l-1-4"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM5 11h14"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  guide: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  map: '<path d="m9 4-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  columns: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
  done: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.5"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1A4.5 4.5 0 0 1 17 18z"/><path d="M12 11v5m-2-2 2 2 2-2"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  nav: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V6a2 2 0 0 1 2-2h11v3M16 13.5h2"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  vote: '<path d="M7 11V20H4V11zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>'
}
function icon(name, cls) {
  return `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`
}
// <i data-icon="plane"></i> in the html gets swapped for the svg
function fillIcons(root = document) {
  $$('i[data-icon]', root).forEach(el => {
    el.outerHTML = icon(el.dataset.icon, el.className)
  })
}

// ---------- nav (built here so it's not copy pasted in 19 files) ----------
const TABS = [
  ['home', 'Home', 'home', 'Home.html'],
  ['plan', 'Plan', 'plan', 'Plan.html'],
  ['trip', 'My trips', 'trip', 'Trip.html'],
  ['group', 'Group', 'group', 'Group.html'],
  ['account', 'Account', 'user', 'Account.html']
]
const MORE = {
  'Book and explore': [
    ['Flights', 'plane', 'Flights.html'], ['Stays', 'bed', 'Accomdations.html'], ['Transport', 'bus', 'Transport.html'],
    ['Activities', 'ticket', 'Activities.html'], ['Tour guides', 'guide', 'Tour_Guide.html'], ['Packages', 'box', 'Travel_Agency.html']
  ],
  'Your trips': [
    ['Calendar', 'cal', 'Calendar.html'], ['Map', 'map', 'Maps.html'], ['Visa and prep', 'shield', 'Visa.html'],
    ['Compare', 'columns', 'Compare.html'], ['Final plan', 'done', 'Final_Plan.html'], ['New trip', 'plus', 'index.html']
  ]
}

// builds the nav: bottom tabs on phone, sidebar on laptop. same html, css does the rest
function renderNav() {
  const active = document.body.dataset.tab
  const page = location.pathname.split('/').pop() || 'Home.html'

  let tabs = ''
  TABS.forEach(([key, label, ic, href]) => {
    tabs += `<a class="tab" href="${href}" ${key === active ? 'aria-current="page"' : ''}><span class="pill">${icon(ic)}</span>${label}</a>`
  })

  let more = ''
  for (const group in MORE) {
    more += `<p class="group-label">${group}</p><div class="more-grid">`
    MORE[group].forEach(([label, ic, href]) => {
      more += `<a href="${href}" ${href === page ? 'aria-current="page"' : ''}>${icon(ic)}${label}</a>`
    })
    more += '</div>'
  }

  const nav = document.createElement('nav')
  nav.className = 'tabbar'
  nav.setAttribute('aria-label', 'Main')
  nav.innerHTML = `
    <a class="brand" href="Home.html">Travel<span>U</span></a>
    <button class="more-btn" type="button" aria-expanded="false">All pages ${icon('up', 'sm')}</button>
    <div class="tabs">${tabs}</div>
    <div class="side-more">${more}</div>`
  document.body.appendChild(nav)

  // the pop up sheet for phones
  const back = document.createElement('div')
  back.className = 'sheet-backdrop'
  back.hidden = true
  const sheet = document.createElement('div')
  sheet.className = 'more-sheet'
  sheet.hidden = true
  sheet.innerHTML = `<div class="sheet-head"><h2>All pages</h2><button class="icon-btn filled" type="button" data-close-sheet aria-label="Close">${icon('x')}</button></div>${more}`
  document.body.append(back, sheet)

  const btn = $('.more-btn', nav)
  function toggle(open) {
    sheet.hidden = !open
    back.hidden = !open
    btn.setAttribute('aria-expanded', open)
  }
  btn.addEventListener('click', () => toggle(sheet.hidden))
  back.addEventListener('click', () => toggle(false))
  $('[data-close-sheet]', sheet).addEventListener('click', () => toggle(false))
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { toggle(false); closeModal() } })
}

// ---------- popups ----------
function openModal(html) {
  closeModal()
  const wrap = document.createElement('div')
  wrap.className = 'modal-wrap'
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`
  wrap.addEventListener('click', e => {
    if (e.target === wrap || e.target.closest('[data-close]')) closeModal()
  })
  document.body.appendChild(wrap)
  document.body.classList.add('no-scroll')
  fillIcons(wrap)
  const first = wrap.querySelector('input, select, textarea')
  if (first) first.focus()
  return wrap.querySelector('.modal')
}
function closeModal() {
  const m = $('.modal-wrap')
  if (m) m.remove()
  document.body.classList.remove('no-scroll')
}

let toastTimer
function toast(msg) {
  let t = $('.toast')
  if (!t) {
    t = document.createElement('div')
    t.className = 'toast'
    t.setAttribute('role', 'status')
    document.body.appendChild(t)
  }
  t.innerHTML = icon('check') + '<span>' + esc(msg) + '</span>'
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600)
}

// ---------- trips ----------
// a trip is optional. you can book everything without one.
// ---------- trips ----------
function getTrips() { return store.get('trips', []) }
function saveTrips(list) { store.set('trips', list) }
function getTrip(id) { return getTrips().find(t => t.id === id) }
function updateTrip(id, change) {
  const all = getTrips()
  const t = all.find(x => x.id === id)
  if (t) {
    change(t)
    saveTrips(all)
  }
  return t
}
function deleteTrip(id) {
  saveTrips(getTrips().filter(t => t.id !== id))
  // bookings stay, they just aren't part of a trip anymore
  store.set('bookings', getBookings().map(b => b.tripId === id ? { ...b, tripId: '' } : b))
}

// makes a new trip with a default checklist and saves it
function newTrip(info) {
  const dest = getCity(info.to)
  const me = getName() || 'You'
  const trip = {
    id: uid(),
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),  // for the fake invite link
    name: info.name || ('Trip to ' + (dest ? dest.name : 'somewhere')),
    from: info.from || '', to: info.to || '',
    leave: info.leave || '', ret: info.ret || '',
    travellers: Number(info.travellers) || 1,
    budget: Number(info.budget) || 0,
    members: [{ name: me, you: true }].concat((info.invites || []).map(n => ({ name: n, invited: true }))),
    saved: [],
    checklist: [
      { text: 'Check visa rules' + (dest ? ' for ' + dest.country : ''), done: false, visa: true },
      { text: 'Passport valid 6+ months after the trip', done: false },
      { text: 'Travel insurance', done: false },
      { text: 'Plan how to get from the airport', done: false }
    ],
    created: Date.now()
  }
  const all = getTrips()
  all.push(trip)
  saveTrips(all)
  return trip
}

function inviteLink(trip) { return 'https://travelu.app/join/' + trip.code }

// where the trip is up to (for the progress dots)
function tripProgress(t) {
  const hasFlight = t.saved.some(s => s.type === 'flight') || tripBookings(t.id).some(b => b.type === 'flight')
  const hasStay = t.saved.some(s => s.type === 'stay') || tripBookings(t.id).some(b => b.type === 'stay')
  const voted = t.saved.some(s => Object.keys(s.votes || {}).length > 0)
  const prepped = t.checklist.length > 0 && t.checklist.every(c => c.done)
  const booked = tripBookings(t.id).some(b => b.type === 'flight') && tripBookings(t.id).some(b => b.type === 'stay')
  return [['Plan', true], ['Compare', hasFlight || hasStay], ['Agree', voted], ['Prepare', prepped], ['Book', booked]]
}

// ---------- saving an option to a trip ----------
// turns a flight/stay/etc into a small object we can save or book
function summarize(item, extra = {}) {
  if (item.type === 'flight') {
    return {
      type: 'flight', id: item.id,
      title: item.airline + ' · ' + stopsText(item.stops),
      sub: `${item.from} → ${item.to} · ${fmtDate(item.leave)}${item.ret ? ' to ' + fmtDate(item.ret) : ', one way'} · ${plural(item.pax, 'traveller')}`,
      total: item.total + (item.bag === 'fee' ? item.bagFee * item.pax : 0),
      people: item.pax, date: item.leave, city: item.to, raw: item
    }
  }
  if (item.type === 'stay') {
    return {
      type: 'stay', id: item.id, title: item.name,
      sub: `${item.kind} · ${item.area} · ${plural(item.nights, 'night')} · ${plural(item.guests, 'guest')}`,
      total: item.total, people: item.guests, date: item.checkin, city: item.city, raw: item
    }
  }
  // activities, tours, transport, packages pass their own details
  return Object.assign({ type: item.type, id: item.id, title: item.title, sub: item.sub || '', total: item.total || 0, people: item.people || 1, date: item.date || '', city: item.city || '', raw: item }, extra)
}

// saves a flight/stay/etc onto a trip so people can vote on it
function addToTrip(tripId, summary) {
  let added = false
  updateTrip(tripId, t => {
    if (!t.saved.find(s => s.id === summary.id)) {
      t.saved.push(Object.assign({}, summary, { votes: {} }))
      added = true
    }
  })
  return added
}

function saveToTripModal(summary) {
  const trips = getTrips()
  let list = trips.map(t => `<button class="row-link" type="button" data-trip="${t.id}"><span class="icon-tile sm">${icon('trip')}</span><div><p class="strong">${esc(t.name)}</p><p class="small muted">${t.leave ? fmtDate(t.leave) + ' – ' + fmtDate(t.ret) : 'No dates yet'}</p></div>${icon('plus')}</button>`).join('')
  if (!list) list = '<p class="small muted">You have no trips yet. Make one below, or just book it on its own.</p>'

  const m = openModal(`
    <div class="modal-head"><h2>Save to a trip</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <p class="small muted">${esc(summary.title)}</p>
    <div class="stack" style="margin-top:12px">${list}</div>
    <form class="inline-form" style="margin-top:14px" id="quickTrip">
      <label class="sr-only" for="qtName">New trip name</label>
      <input id="qtName" placeholder="New trip name" required>
      <button class="btn compact dark" type="submit">Create</button>
    </form>`)

  m.addEventListener('click', e => {
    const b = e.target.closest('[data-trip]')
    if (!b) return
    const ok = addToTrip(b.dataset.trip, summary)
    closeModal()
    toast(ok ? 'Saved to ' + getTrip(b.dataset.trip).name : 'Already in that trip')
  })
  $('#quickTrip', m).addEventListener('submit', e => {
    e.preventDefault()
    const raw = summary.raw || {}
    const t = newTrip({ name: $('#qtName', m).value, to: summary.city, from: raw.from, leave: summary.date, ret: raw.ret || raw.checkout, travellers: summary.people })
    addToTrip(t.id, summary)
    closeModal()
    toast('Trip created and saved')
  })
}

// ---------- bookings ----------
function getBookings() { return store.get('bookings', []) }
function tripBookings(tripId) { return getBookings().filter(b => b.tripId === tripId) }
function isBooked(id) { return getBookings().some(b => b.id === id && b.status !== 'Cancelled') }

// ---------- compare list (max 3 of each) ----------
function getCompare() { return store.get('compare', { flight: [], stay: [] }) }
function inCompare(item) { return getCompare()[item.type].some(x => x.id === item.id) }
function toggleCompare(item) {
  const c = getCompare()
  const list = c[item.type]
  const i = list.findIndex(x => x.id === item.id)
  if (i > -1) list.splice(i, 1)
  else {
    if (list.length >= 3) { toast('You can compare 3 at a time'); return false }
    list.push(item)
  }
  store.set('compare', c)
  return true
}

// ---------- selects ----------
function fillCities(sel, placeholder, withCode = true) {
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    CITIES.map(c => `<option value="${c.code}">${c.name}${withCode ? ' (' + c.code + ')' : ''}</option>`).join('')
}
function fillTrips(sel, noneLabel) {
  sel.innerHTML = `<option value="">${noneLabel}</option>` +
    getTrips().map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')
}

// ---------- shared card bits ----------
function stopsText(n) { return n === 0 ? 'Direct' : plural(n, 'stop') }

function bagFlag(f) {
  if (f.bag === 'included') return flag('Bag included', 'ok')
  if (f.bag === 'fee') return flag('Bag +$' + f.bagFee + ' each')
  return flag('Bag fee not confirmed by seller', 'warn')
}
function flag(text, kind) {
  const ic = kind === 'warn' ? 'alert' : kind === 'ok' ? 'check' : 'info'
  return `<span class="flag ${kind || ''}">${icon(ic, 'sm')}${esc(text)}</span>`
}

// the 3 buttons under every bookable thing
function actionRow(item) {
  const booked = isBooked(item.id)
  const cmp = (item.type === 'flight' || item.type === 'stay')
    ? `<label class="cmp-check"><input type="checkbox" data-action="compare" data-id="${item.id}" ${inCompare(item) ? 'checked' : ''}> Compare</label>` : ''
  return `<div class="card-actions">
    ${cmp}
    <button class="btn secondary compact" type="button" data-action="save" data-id="${item.id}">${icon('plus', 'sm')} Save to trip</button>
    <button class="btn compact" type="button" data-action="book" data-id="${item.id}" ${booked ? 'disabled' : ''}>${booked ? icon('check', 'sm') + ' Booked' : 'Book now'}</button>
  </div>`
}

function flightCard(f) {
  const leg = (l, a, b) => `<div class="route">
      <div class="time">${l.dep}<span>${a}</span></div>
      <div class="leg"><span>${durText(l.dur)}</span><i></i><span>${l.via.length ? 'via ' + l.via.join(', ') : 'Direct'}</span></div>
      <div class="time" style="text-align:right">${l.arr}${l.plusDays ? '<sup>+' + l.plusDays + '</sup>' : ''}<span>${b}</span></div>
    </div>`
  const bagCost = f.bag === 'fee' ? f.bagFee * f.pax : 0
  return `<article class="card result" data-id="${f.id}">
    <div class="result-head"><h3>${f.airline}</h3>${bagFlag(f)}</div>
    ${leg(f.out, f.from, f.to)}
    ${f.back ? '<p class="tiny muted" style="margin-top:8px">Return ' + fmtDate(f.ret) + '</p>' + leg(f.back, f.to, f.from) : ''}
    <div class="price-row">
      <div><p class="tiny muted">Total for ${plural(f.pax, 'traveller')}${f.ret ? ', return' : ''}</p>
      <p class="price">${money(f.total + bagCost)}${f.bag === 'unknown' ? '+' : ''} <span>${money(f.pp)} each</span></p></div>
      <span class="flag">${f.fare} fare</span>
    </div>
    <details class="more-info">
      <summary>Cost breakdown and terms ${icon('down', 'sm')}</summary>
      <div>
        <div class="cost-line"><span>Fares and taxes</span><span>${money(f.total)}</span></div>
        <div class="cost-line"><span>Checked bag</span><span>${f.bag === 'included' ? '<span class="good">Included</span>' : f.bag === 'fee' ? money(bagCost) : '<span class="warn-text">Not confirmed</span>'}</span></div>
        <div class="cost-line total"><span>Total</span><span>${money(f.total + bagCost)}${f.bag === 'unknown' ? ' + bag' : ''}</span></div>
        <div class="terms">
          <div><p class="label">Seller</p><p class="strong">${f.seller === f.airline ? f.airline + ', the airline' : f.seller + ', a booking site'}</p><p class="small muted">The seller is who you pay and who handles changes.</p></div>
          <div><p class="label">Cancel</p><p class="strong">${f.cancel}</p></div>
          <div><p class="label">Change</p><p class="strong">${f.change}</p></div>
        </div>
      </div>
    </details>
    ${actionRow(f)}
  </article>`
}

function stayCard(s) {
  const city = getCity(s.city)
  return `<article class="card flush result" data-id="${s.id}">
    ${scene(s.id)}
    <div class="card-body">
      <div class="result-head"><h3>${esc(s.name)}</h3><span class="rating">${icon('star', 'sm')} ${s.rating}</span></div>
      <p class="small muted">${s.kind} · ${esc(s.area)}, ${city.name} · ${s.km} km from centre</p>
      <p style="margin-top:8px"><span class="price">${money(s.total)}${s.tax === 'unknown' ? '+' : ''}</span> <span class="small muted">for ${plural(s.nights, 'night')} · ${money(s.night)}/night</span></p>
      <div class="flags" style="margin-top:10px">
        ${s.tax === 'included' ? flag('Taxes included', 'ok') : s.tax === 'extra' ? flag('Taxes ' + money(s.taxAmount) + ' added') : flag('City tax paid at property, amount unknown', 'warn')}
        ${s.freeCancel ? flag(s.cancel, 'ok') : flag('Non-refundable')}
      </div>
      <details class="more-info">
        <summary>Cost breakdown and terms ${icon('down', 'sm')}</summary>
        <div>
          <div class="cost-line"><span>${plural(s.nights, 'night')} × ${money(s.night)}</span><span>${money(s.night * s.nights)}</span></div>
          <div class="cost-line"><span>Taxes</span><span>${s.tax === 'included' ? 'Included' : s.tax === 'extra' ? money(s.taxAmount) : '<span class="warn-text">Paid at property</span>'}</span></div>
          <div class="cost-line total"><span>Total</span><span>${money(s.total)}</span></div>
          <div class="terms">
            <div><p class="label">Seller</p><p class="strong">Sold by ${esc(s.seller)}</p></div>
            <div><p class="label">Cancel</p><p class="strong">${s.cancel}</p></div>
            <div><p class="label">Has</p><p class="strong">${s.amen.join(', ') || 'Basics only'}</p></div>
          </div>
        </div>
      </details>
      ${actionRow(s)}
    </div>
  </article>`
}

// little skyline picture, colours change per hotel so they don't all look the same
function scene(seed) {
  const r = seeded(seed)
  const cols = [['#60C1E5', '#005A9C'], ['#A0E0EF', '#60C1E5'], ['#005A9C', '#1B365D'], ['#60C1E5', '#1B365D']]
  const [a, b] = cols[Math.floor(r() * cols.length)]
  let x = 0, blocks = ''
  while (x < 320) {
    const w = 18 + Math.floor(r() * 30), h = 24 + Math.floor(r() * 56)
    blocks += `<rect x="${x}" y="${96 - h}" width="${w}" height="${h}" fill="${a}"/>`
    x += w + 4
  }
  return `<svg class="scene" viewBox="0 0 320 96" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="320" height="96" fill="#E8F6FB"/><circle cx="${60 + r() * 200}" cy="26" r="13" fill="#A0E0EF"/>${blocks}<rect y="80" width="320" height="16" fill="${b}"/></svg>`
}

// runs on every page
// run on every page
renderNav()
fillIcons()
