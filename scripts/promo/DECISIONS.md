# Decisions

One line per call, newest last.

- Promo look: direction A (site system) with B's heavy headline. See `directions/directions.html`. A tap from a carousel lands on a page that looks the same.
- No glow, no uppercase tracked eyebrows, one accent (`#7dd3fc`) for data only, as in `docs/DESIGN.md`. Yellow from the old carousels is dropped so cyan always means "look here".
- Figures are the site's own renderers (`components/blog/figures`), so every number on a slide is the one the lesson computes.
- Carousel figures use the phone drawing (320 wide) scaled up. The desktop drawing at slide size gives 7 px labels on a phone; the phone drawing gives about 12 px.
- Type: bundled Inter Display ExtraBold for headlines, Inter for text (OFL, subset to Latin), so renders match on any machine.
- Carousel copy comes from the reviewed article fields (title, summary, section headings, captions, quiz). Per-lesson overrides only for the cover hook.
- Film topic: compression attack and release (lesson 057). It has the clearest audible cause and effect, and the site already simulates it.
- Film ground: dark brand ground instead of the prompt's warm neutral default, because the brand is dark and the film sends people to a dark page.
- Film sound: no voice-over. A procedural drum loop through the same compressor the picture shows is the soundtrack, so the viewer hears each change as it is drawn.
