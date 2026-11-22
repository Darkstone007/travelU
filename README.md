# TravelU

Prototype for our IM-UH 2110 group project (Tyler, Malak, David and Sumeed).
TravelU is an all-in-one travel planner: book flights, stays, tours and activities on their own,
or make a trip, invite people, compare options, vote and split costs.

## How to run
Open `Home.html` in a browser. No install needed.
Everything is saved in the browser (localStorage). Use **Account > Reset all data** to start over.

## Files
- `data.js` fake data (flights, stays, activities, guides, transport, visa rules). None of it is real.
- `app.js` shared code: saving, nav, icons, popups, trips, compare list
- `booking.js` the booking popup
- `style.css`, `menu.css`, `filter.css` styles (phone layout + laptop sidebar)

## References
- mulberry32 random number generator by Tommy Ettinger, JS version from bryc: https://github.com/bryc/code/blob/master/jshash/PRNGs.md
- FNV-1a hash (public domain): http://www.isthe.com/chongo/tech/comp/fnv/
- Font: Plus Jakarta Sans by Gumpita Rahayu (Tokotype), via Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans

## AI use
Code written with help from Claude (Anthropic), based on our group's design and research reports.
