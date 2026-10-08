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
- Film v2, after the founder asked for video only and "not boring": 120 BPM, 32 s, the A/B hook in frame one (same snare, 1 ms against 30 ms attack), big kinetic type with the one word to notice in the accent, full-bleed lanes instead of a panel, the camera reframing between one hit and a bar, a short line pulse on each hit, a riser and impact into the key idea, and the bed entering after the hook.
- Brand in the film: the founder's picture with the Virzy Guns lettering (`public/images/virzy-guns-dp.jpg`) as a small badge and on the end card, with the tagline "100% Art. 100% Science.", as the founder asked.
- Attack scenes use a 60 ms release, not the 120 ms in the lesson's figure: at 120 ms a 1 ms attack also holds the body down, so after level matching the two attacks sound nearly alike. The readout shows the values used.
- Makeup gain matches each compressed scene to the K-weighted loudness of the plain loop, the lesson's "judge at matched level".
- Master: gain into a soft clipper, not a limiter, because a limiter's release ducks the body after each crack, which is the fast-attack sound the film argues against. Noise sources are band-limited to 11 kHz so clipping does not create inter-sample peaks.
- Mastered on the delivered stereo track, aiming 0.7 dB under the -1.5 dBTP limit because AAC raises true peak by about 0.6 dB.
- From the design review: the held hit before a scene's first snare is drawn with that scene's settings; the 9:16 readout sits above the caption area; the attack and release scenes are compressed in the sound as well as the picture; "Above the threshold, it starts pulling down" (gain reduction carries on below it); "Release back to 90 ms" (90 ms is a choice, not derived from the tempo); the payoff plays over the whole bar; frame one carries the hook; the grey "before" line and the playhead were raised to 3:1 contrast.
