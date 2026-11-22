// data.js
// All the fake data for the TravelU prototype lives here.
// NOTHING here is real: prices, times, hotels, guides and visa rules are made up
// so the screens have something to show. Same search = same results, so testing is repeatable.

// every city we support. lat/lng is only used for the rough flight distance
const CITIES = [
  { code: 'AUH', name: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.45, lon: 54.38, tz: 4, cost: 1.0,
    areas: ['Corniche', 'Saadiyat', 'Yas Island', 'Al Reem'],
    sights: ['Sheikh Zayed Grand Mosque', 'Louvre Abu Dhabi', 'Qasr Al Watan', 'Mangrove National Park'] },
  { code: 'DXB', name: 'Dubai', country: 'United Arab Emirates', lat: 25.25, lon: 55.36, tz: 4, cost: 1.15,
    areas: ['Downtown', 'Dubai Marina', 'Deira', 'Jumeirah'],
    sights: ['Burj Khalifa', 'Dubai Creek', 'Al Fahidi', 'Dubai Frame'] },
  { code: 'LHR', name: 'London', country: 'United Kingdom', lat: 51.47, lon: -0.45, tz: 0, cost: 1.4,
    areas: ['Soho', 'Camden', 'South Bank', 'Shoreditch'],
    sights: ['British Museum', 'Tower of London', 'Borough Market', 'Hyde Park'] },
  { code: 'JFK', name: 'New York', country: 'United States', lat: 40.64, lon: -73.78, tz: -5, cost: 1.5,
    areas: ['Midtown', 'Brooklyn', 'Lower East Side', 'Harlem'],
    sights: ['Central Park', 'The Met', 'Brooklyn Bridge', 'The High Line'] },
  { code: 'PVG', name: 'Shanghai', country: 'China', lat: 31.14, lon: 121.81, tz: 8, cost: 0.85,
    areas: ["Jing'an", 'The Bund', 'Xintiandi', 'Pudong'],
    sights: ['Yu Garden', 'The Bund', 'M50 Art District', 'Shanghai Tower'] },
  { code: 'HND', name: 'Tokyo', country: 'Japan', lat: 35.55, lon: 139.78, tz: 9, cost: 1.2,
    areas: ['Shinjuku', 'Shibuya', 'Asakusa', 'Ginza'],
    sights: ['Senso-ji', 'Meiji Shrine', 'Tsukiji Outer Market', 'Tokyo Skytree'] },
  { code: 'CDG', name: 'Paris', country: 'France', lat: 49.0, lon: 2.55, tz: 1, cost: 1.35,
    areas: ['Le Marais', 'Montmartre', 'Latin Quarter', 'Saint-Germain'],
    sights: ['The Louvre', 'Eiffel Tower', "Musée d'Orsay", 'Sacré-Cœur'] },
  { code: 'IST', name: 'Istanbul', country: 'Türkiye', lat: 41.26, lon: 28.74, tz: 3, cost: 0.8,
    areas: ['Sultanahmet', 'Beyoğlu', 'Kadıköy', 'Beşiktaş'],
    sights: ['Hagia Sophia', 'Grand Bazaar', 'Galata Tower', 'Bosphorus ferry'] },
  { code: 'CPT', name: 'Cape Town', country: 'South Africa', lat: -33.97, lon: 18.6, tz: 2, cost: 0.75,
    areas: ['City Bowl', 'Sea Point', 'Waterfront', 'Woodstock'],
    sights: ['Table Mountain', 'Robben Island', 'Kirstenbosch Garden', 'Bo-Kaap'] },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', lat: 1.36, lon: 103.99, tz: 8, cost: 1.25,
    areas: ['Marina Bay', 'Chinatown', 'Little India', 'Orchard'],
    sights: ['Gardens by the Bay', 'Maxwell Hawker Centre', 'Sentosa', 'Haji Lane'] },
]

const PASSPORTS = ['United Arab Emirates', 'United States', 'United Kingdom', 'South Africa', 'India', 'Pakistan',
  'Egypt', 'Nigeria', 'China', 'Japan', 'France', 'Türkiye', 'Singapore', 'Philippines', 'Kenya']

const AIRLINES = ['Etihad', 'Emirates', 'Qatar Airways', 'Turkish Airlines', 'British Airways', 'Air France',
  'China Eastern', 'ANA', 'Singapore Airlines', 'flydubai', 'Air Arabia', 'Lufthansa']
const HUBS = ['DOH', 'IST', 'DXB', 'FRA', 'SIN', 'AUH', 'CDG', 'LHR']
const BOOKING_SITES = ['FareHub', 'SkyDeals', 'TripPoint', 'StayPoint']

// small seeded random so the same search always gives the same list.
// string -> number uses FNV-1a (public domain, isthe.com/chongo/tech/comp/fnv/)
// the generator is mulberry32 by Tommy Ettinger, JS version from github.com/bryc/code/blob/master/jshash/PRNGs.md
function seeded(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return function () {
    h += 0x6D2B79F5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// random item from a list using the seeded random
function pick(r, arr) { return arr[Math.floor(r() * arr.length)] }

function getCity(code) { return CITIES.find(c => c.code === code) }

// rough distance between two cities in km (haversine)
function distanceKm(a, b) {
  const R = 6371, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// minutes since midnight -> "14:05"
function toClock(mins) {
  mins = ((mins % 1440) + 1440) % 1440
  return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0')
}
function durText(mins) { return Math.floor(mins / 60) + 'h ' + String(mins % 60).padStart(2, '0') + 'm' }

// makes one leg (times, stops, duration) for a flight
function makeLeg(r, a, b, stops) {
  const base = distanceKm(a, b) / 820 * 60 + 40
  const dur = Math.round((base + stops * (80 + r() * 200)) / 5) * 5
  const dep = Math.floor(r() * 24) * 60 + pick(r, [0, 15, 30, 45])
  const arrRaw = dep + dur + (b.tz - a.tz) * 60
  const via = []
  for (let s = 0; s < stops; s++) {
    via.push(pick(r, HUBS.filter(h => h !== a.code && h !== b.code && !via.includes(h))))
  }
  return { dep: toClock(dep), arr: toClock(arrRaw), plusDays: Math.floor(arrRaw / 1440), dur, via }
}

// FLIGHTS ------------------------------------------------------------
// from/to are airport codes, ret can be empty for one way
function genFlights(from, to, leave, ret, pax, cabin) {
  const a = getCity(from), b = getCity(to)
  if (!a || !b || from === to) return []
  const r = seeded(from + to + leave + ret + cabin)
  const dist = distanceKm(a, b)
  const cabinX = { Economy: 1, 'Premium economy': 1.7, Business: 3.4 }[cabin] || 1
  const list = []

  for (let i = 0; i < 12; i++) {
    const stops = r() < 0.38 ? 0 : (r() < 0.8 ? 1 : 2)
    const airline = pick(r, AIRLINES)
    const out = makeLeg(r, a, b, stops)
    const back = ret ? makeLeg(r, b, a, stops) : null

    // cheaper with more stops, plus some noise
    let pp = (70 + dist * 0.062) * (stops === 0 ? 1 : stops === 1 ? 0.8 : 0.7) * (0.82 + r() * 0.45) * cabinX
    if (ret) pp = pp * 1.75
    pp = Math.round(pp)

    // bag: included, a known fee, or the seller hasn't said
    const bagRoll = r()
    const bag = bagRoll < 0.6 ? 'included' : bagRoll < 0.85 ? 'fee' : 'unknown'
    const fare = pick(r, ['Basic', 'Standard', 'Standard', 'Flex'])
    const cancel = fare === 'Flex' ? 'Free cancellation until 3 days before'
      : fare === 'Standard' ? 'Refund minus $' + (60 + Math.round(r() * 8) * 10) + ' per person'
      : 'Non-refundable'
    const seller = r() < 0.7 ? airline : pick(r, BOOKING_SITES.slice(0, 3))

    list.push({
      id: ['f', from, to, leave, ret, cabin, i].join('-'),
      type: 'flight', airline, from, to, leave, ret, pax, cabin,
      stops, out, back, pp, total: pp * pax,
      bag, bagFee: bag === 'fee' ? 25 + Math.round(r() * 6) * 5 : 0,
      fare, cancel, seller,
      change: fare === 'Basic' ? 'Changes not allowed' : '$' + (40 + Math.round(r() * 4) * 10) + ' fee plus fare difference'
    })
  }
  return list
}

// STAYS --------------------------------------------------------------
const STAY_WORDS = ['Garden', 'Harbour', 'Lantern', 'Blue Door', 'Palm', 'Courtyard', 'Loft', 'Corner', 'Atlas', 'Cedar', 'Willow', 'North Star']
const AMENITIES = ['Wi-Fi', 'Breakfast', 'Pool', 'Gym', 'Kitchen', 'Airport shuttle', 'Laundry', 'Air conditioning']

// how many nights between two dates
function nightsBetween(a, b) {
  if (!a || !b) return 1
  const n = Math.round((new Date(b) - new Date(a)) / 86400000)
  return n > 0 ? n : 1
}

function genStays(cityCode, checkin, checkout, guests) {
  const city = getCity(cityCode)
  if (!city) return []
  const r = seeded('stay' + cityCode)   // same hotels for a city every time
  const nights = nightsBetween(checkin, checkout)
  const list = []

  for (let i = 0; i < 12; i++) {
    const kind = pick(r, ['Hotel', 'Hotel', 'Hostel', 'Apartment', 'Guesthouse'])
    const area = pick(r, city.areas)
    const word = STAY_WORDS[(i * 5 + Math.floor(r() * 3)) % STAY_WORDS.length]
    const base = { Hotel: 85, Hostel: 28, Apartment: 72, Guesthouse: 50 }[kind]
    let night = Math.round(base * city.cost * (0.7 + r() * 0.9))
    // more guests = bigger room, a bit more money
    if (guests > 2) night = Math.round(night * (1 + (guests - 2) * 0.35))

    const taxRoll = r()
    const tax = taxRoll < 0.55 ? 'included' : taxRoll < 0.85 ? 'extra' : 'unknown'
    const taxAmount = tax === 'extra' ? Math.round(night * nights * 0.12) : 0
    const freeCancel = r() < 0.6
    const amen = AMENITIES.filter(() => r() < 0.45)
    if (kind === 'Apartment' && !amen.includes('Kitchen')) amen.push('Kitchen')

    list.push({
      id: ['s', cityCode, i].join('-'),
      type: 'stay', city: cityCode, checkin, checkout, guests, nights,
      name: word + ' ' + (kind === 'Hostel' ? 'Hostel ' + area : area + ' ' + kind),
      kind, area,
      rating: Math.round((3.5 + r() * 1.45) * 10) / 10,
      km: Math.round(r() * 60) / 10,
      night, total: night * nights + taxAmount,
      tax, taxAmount,
      cancel: freeCancel ? 'Free cancellation until ' + (2 + Math.floor(r() * 6)) + ' days before' : 'Non-refundable',
      freeCancel,
      seller: r() < 0.65 ? 'the property' : pick(r, BOOKING_SITES),
      amen
    })
  }
  return list
}

// ACTIVITIES ---------------------------------------------------------
function genActivities(cityCode) {
  const city = getCity(cityCode)
  if (!city) return []
  const r = seeded('act' + cityCode)
  const list = []
  city.sights.forEach((s, i) => {
    const free = r() < 0.25
    list.push({
      id: 'a-' + cityCode + '-' + i, type: 'activity', city: cityCode,
      title: s, cat: i % 2 ? 'Culture' : 'Sights',
      area: pick(r, city.areas),
      hours: pick(r, [1.5, 2, 2.5, 3]),
      pp: free ? 0 : Math.round((8 + r() * 30) * city.cost),
    })
  })
  const extras = [
    ['Street food tour in AREA', 'Food'], ['Cooking class with a local chef', 'Food'],
    ['Night walk around AREA', 'Nightlife'], ['Morning market in AREA', 'Shopping'],
    ['Bike tour of AREA', 'Outdoors'], ['Rooftop evening in AREA', 'Nightlife'],
    ['Day trip outside the city', 'Outdoors'], ['Museum pass, 2 days', 'Culture']
  ]
  extras.forEach(([t, cat], i) => {
    const area = pick(r, city.areas)
    list.push({
      id: 'a-' + cityCode + '-x' + i, type: 'activity', city: cityCode,
      title: t.replace('AREA', area), cat, area,
      hours: pick(r, [2, 3, 4, 6]),
      pp: cat === 'Shopping' ? 0 : Math.round((12 + r() * 60) * city.cost),
    })
  })
  return list
}

// TOUR GUIDES --------------------------------------------------------
const GUIDE_NAMES = ['Lin Wei', 'Sara Haddad', 'Tom Becker', 'Aiko Mori', 'Lerato Dlamini', 'Omar Farouk',
  'Chen Yu', 'Elif Kaya', 'Marc Dubois', 'Priya Nair', 'James Okoro', 'Noura Salem']
const LANGS = ['English', 'Arabic', 'French', 'Mandarin', 'Japanese', 'Spanish', 'Turkish', 'Afrikaans']

function genGuides(cityCode) {
  const city = getCity(cityCode)
  if (!city) return []
  const r = seeded('guide' + cityCode)
  const list = []
  for (let i = 0; i < 7; i++) {
    const priv = r() < 0.4
    const langs = ['English'].concat(LANGS.slice(1).filter(() => r() < 0.22))
    list.push({
      id: 'g-' + cityCode + '-' + i, type: 'tour', city: cityCode,
      guide: pick(r, GUIDE_NAMES),
      title: pick(r, ['Old town walk', 'Food tour', 'Photo walk', 'History tour', 'Hidden spots tour', 'Night tour']) + ': ' + pick(r, city.sights),
      priv, size: priv ? 'Private' : 'Group up to ' + pick(r, [8, 10, 12]),
      langs, hours: pick(r, [2, 3, 3.5, 4]),
      pp: Math.round((priv ? 55 : 22) * city.cost * (0.8 + r() * 0.5)),
      rating: Math.round((4 + r()) * 10) / 10,
      cancel: r() < 0.7 ? 'Free cancellation 24h before' : 'Non-refundable',
      tip: r() < 0.3
    })
  }
  return list
}

// TRANSPORT ----------------------------------------------------------
function genTransport(cityCode, area) {
  const city = getCity(cityCode)
  if (!city) return []
  const r = seeded('tr' + cityCode + area)
  const far = 30 + Math.round(r() * 30)  // minutes by car, roughly
  return [
    { id: 'tr-train', mode: 'Train / metro', icon: 'train', mins: far + 20 + Math.round(r() * 15), price: Math.round(3 * city.cost * 10) / 10, note: '1 change · runs until about 23:00', book: false },
    { id: 'tr-bus', mode: 'Airport bus', icon: 'bus', mins: far + 25, price: Math.round(5 * city.cost), note: 'Every 30 min from arrivals', book: false },
    { id: 'tr-taxi', mode: 'Taxi', icon: 'car', mins: far, price: Math.round(32 * city.cost), note: 'Official rank at arrivals, price changes with traffic', book: false },
    { id: 'tr-ride', mode: 'Ride-hail', icon: 'car', mins: far + 5, price: Math.round(26 * city.cost), note: 'Pickup zone outside arrivals', book: true },
    { id: 'tr-shuttle', mode: 'Shared shuttle', icon: 'bus', mins: far + 35, price: Math.round(14 * city.cost), note: 'Pre-book, drops at your hotel', book: true }
  ]
}

// VISA (DEMO ONLY - not real rules!) ---------------------------------
function genVisa(passport, country) {
  if (!passport || !country) return null
  if (passport === country) return { level: 'ok', title: 'No visa needed', text: 'This is your own country.' }
  const r = seeded('visa' + passport + country)
  const n = r()
  if (n < 0.35) return { level: 'ok', title: 'Visa-free', text: 'Stay up to ' + pick(r, [30, 60, 90]) + ' days without a visa.' }
  if (n < 0.55) return { level: 'info', title: 'Visa on arrival', text: 'Get it at the airport. Bring your return ticket and hotel booking.' }
  if (n < 0.75) return { level: 'warn', title: 'eVisa needed', text: 'Apply online at least 2 weeks before you fly.' }
  return { level: 'warn', title: 'Visa required', text: 'Apply at the embassy or visa centre. Allow about 4 weeks.' }
}
