// booking.js
// the booking popup. works for flights, stays, tours, activities, packages, transport.
// you DON'T need a trip to book. adding it to a trip is optional at the end.
// payment is fake, nothing gets charged (it's a prototype)

// sum = the short summary of what theyre booking (title, price, type...)
function openBooking(sum, opts = {}) {
  const me = getName()
  const people = sum.people || 1

  // one name box per traveller. first one is you if you've told us your name
  let names = ''
  for (let i = 0; i < people; i++) {
    names += `<div class="field"><label for="bn${i}">${people > 1 ? 'Traveller ' + (i + 1) : 'Full name'}</label>
      <input id="bn${i}" class="bname" required value="${i === 0 ? esc(me) : ''}" placeholder="Name as on passport"></div>`
  }

  const dateField = sum.needDate
    ? `<div class="field"><label for="bdate">Date</label><input id="bdate" type="date" required min="${todayISO()}" value="${sum.date || ''}"></div>`
    : ''

  const trips = getTrips()
  const tripField = trips.length
    ? `<div class="field"><label for="btrip">Add to a trip (optional)</label><select id="btrip"><option value="">Don't add to a trip</option>${trips.map(t => `<option value="${t.id}" ${opts.tripId === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>`
    : ''

  const payAtProperty = sum.type === 'stay' ? '<label class="radio-row"><input type="radio" name="pay" value="Pay at the property"> Pay at the property</label>' : ''

  const m = openModal(`
    <div class="modal-head"><h2>Book</h2><button class="icon-btn" type="button" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="card tint" style="padding:12px 14px">
      <p class="strong">${esc(sum.title)}</p>
      <p class="small muted">${esc(sum.sub)}</p>
    </div>
    <form id="bookForm" class="form" style="margin-top:14px">
      ${names}
      ${dateField}
      <div class="field"><label for="bemail">Email for the confirmation</label><input id="bemail" type="email" required placeholder="you@example.com" value="${esc(store.get('email', ''))}"></div>
      <fieldset class="field" style="border:0;padding:0;margin:0">
        <legend class="label" style="margin-bottom:6px">Pay with (demo, nothing is charged)</legend>
        <label class="radio-row"><input type="radio" name="pay" value="Card" checked> Card</label>
        <label class="radio-row"><input type="radio" name="pay" value="Apple Pay"> Apple Pay</label>
        ${payAtProperty}
      </fieldset>
      ${tripField}
      <div class="cost-line total"><span>Total</span><span>${money(sum.total)}</span></div>
      <button class="btn" type="submit">Confirm booking · ${money(sum.total)}</button>
    </form>`)

  $('#bookForm', m).addEventListener('submit', e => {
    e.preventDefault()
    const travellers = $$('.bname', m).map(i => i.value.trim())
    const email = $('#bemail', m).value.trim()
    store.set('email', email)   // remember it for next time
    if (!getName() && travellers[0]) setName(travellers[0].split(' ')[0])

    const booking = Object.assign({}, sum, {
      bookingId: uid(),
      code: 'TU-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      names: travellers, email,
      pay: $('input[name=pay]:checked', m).value,
      tripId: $('#btrip', m) ? $('#btrip', m).value : (opts.tripId || ''),
      date: $('#bdate', m) ? $('#bdate', m).value : sum.date,
      paidBy: getName() || 'You',
      status: 'Confirmed',
      bookedAt: Date.now()
    })
    delete booking.raw   // don't need the whole object in storage
    const all = getBookings()
    all.push(booking)
    store.set('bookings', all)

    // show the confirmation in the same popup
    m.innerHTML = `
      <div style="text-align:center;padding:10px 0">
        <span class="check-mark big-check">${icon('check')}</span>
        <h2 style="margin-top:12px">Booking confirmed</h2>
        <p class="muted small" style="margin-top:4px">${esc(sum.title)}</p>
        <p class="code-box">${booking.code}</p>
        <p class="small muted">A confirmation would go to ${esc(email)}.</p>
      </div>
      <div class="btn-row">
        <a class="btn secondary" href="Account.html#bookings">My bookings</a>
        <button class="btn" type="button" data-close>Done</button>
      </div>`
    if (opts.onDone) opts.onDone(booking)
  })
}

// hooks up Compare / Save / Book on a list of cards.
// findItem(id) gives back the raw item, toSum(item) makes the summary (optional)
function wireCardActions(root, findItem, toSum) {
  root.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]')
    if (!btn || btn.tagName === 'INPUT') return
    const item = findItem(btn.dataset.id)
    if (!item) return
    const sum = toSum ? toSum(item) : summarize(item)

    if (btn.dataset.action === 'book') {
      openBooking(sum, {
        tripId: param('trip'),
        onDone: () => { btn.disabled = true; btn.innerHTML = icon('check', 'sm') + ' Booked' }
      })
    }
    if (btn.dataset.action === 'save') saveToTripModal(sum)
  })

  // compare is a checkbox so it uses change
  root.addEventListener('change', e => {
    const box = e.target.closest('[data-action=compare]')
    if (!box) return
    const item = findItem(box.dataset.id)
    if (!toggleCompare(item)) box.checked = false
    if (typeof updateCompareBar === 'function') updateCompareBar()
  })
}

// the bar at the bottom of results that says "compare 2 →"
function updateCompareBar() {
  const bar = $('#compareBar')
  if (!bar) return
  const c = getCompare()
  const n = c.flight.length + c.stay.length
  bar.hidden = n === 0
  bar.querySelector('span').textContent = 'Compare ' + plural(n, 'option')
}
