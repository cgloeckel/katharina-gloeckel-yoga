/* Katharina Glöckel – Yoga, Atem & Klang. Kein Framework, keine Cookies, kein Tracking. */
{
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CFG = window.SITE_CONFIG || {};
const TERMINE = window.TERMINE || [];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const root = document.querySelector('link[rel="stylesheet"]')?.getAttribute("href").replace("assets/css/style.css", "") || "";

/* ---------- header, menu, year ---------- */
const headEl = $(".site-head");
const onScroll = () => headEl && headEl.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
const menu = $("#menu"), burger = $(".site-head .burger");
const closeMenu = () => { if (!menu) return; menu.hidden = true; burger?.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; burger?.focus(); };
burger?.addEventListener("click", () => { menu.hidden = false; burger.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; $("[data-close]", menu)?.focus(); });
$("[data-close]", menu || document)?.addEventListener("click", closeMenu);
document.addEventListener("keydown", e => { if (e.key === "Escape" && menu && !menu.hidden) closeMenu(); });
$$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
$$("[data-mail]").forEach(a => { if (CFG.email) { a.href = "mailto:" + CFG.email; a.textContent = CFG.email; } });
$$("[data-zz]").forEach(a => { if (CFG.zyklusZirkelUrl) a.href = CFG.zyklusZirkelUrl; });
$$("[data-cal]").forEach(a => { if (CFG.calendarUrl) { a.href = CFG.calendarUrl; a.rel = "noopener"; } });

/* ---------- moon (exact phases for Baden, computed with ephem) ---------- */
const NEW = ["2026-10-10T15:50Z","2026-11-09T07:02Z","2026-12-09T00:51Z","2027-01-07T20:24Z","2027-02-06T15:56Z","2027-03-08T09:29Z","2027-04-06T23:51Z","2027-05-06T10:58Z","2027-06-04T19:40Z","2027-07-04T03:01Z","2027-08-02T10:05Z","2027-08-31T17:41Z","2027-09-30T02:35Z","2027-10-29T13:36Z","2027-11-28T03:24Z","2027-12-27T20:12Z","2028-01-26T15:12Z","2028-02-25T10:37Z","2028-03-26T04:31Z","2028-04-24T19:46Z","2028-05-24T08:16Z","2028-06-22T18:27Z","2028-07-22T03:01Z","2028-08-20T10:43Z","2028-09-18T18:23Z","2028-10-18T02:56Z","2028-11-16T13:17Z","2028-12-16T02:06Z","2029-01-14T17:24Z"].map(s => new Date(s));
const FULL = ["2026-10-26T04:11Z","2026-11-24T14:53Z","2026-12-24T01:28Z","2027-01-22T12:17Z","2027-02-20T23:23Z","2027-03-22T10:43Z","2027-04-20T22:27Z","2027-05-20T10:58Z","2027-06-19T00:44Z","2027-07-18T15:44Z","2027-08-17T07:28Z","2027-09-15T23:03Z","2027-10-15T13:46Z","2027-11-14T03:25Z","2027-12-13T16:08Z","2028-01-12T04:02Z","2028-02-10T15:03Z","2028-03-11T01:05Z","2028-04-09T10:26Z","2028-05-08T19:48Z","2028-06-07T06:08Z","2028-07-06T18:10Z","2028-08-05T08:09Z","2028-09-03T23:47Z","2028-10-03T16:24Z","2028-11-02T09:17Z","2028-12-02T01:40Z","2028-12-31T16:48Z"].map(s => new Date(s));
const SYN = 29.530588853 * 864e5;
function moonFrac(d) {
  let last = null, next = null;
  for (let i = 0; i < NEW.length; i++) { if (NEW[i] <= d) last = NEW[i]; else { next = NEW[i]; break; } }
  if (last && next) return (d - last) / (next - last);
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  return (((d - ref) % SYN) + SYN) % SYN / SYN;
}
function moonPath(frac, cx, cy, r) {
  const k = Math.cos(2 * Math.PI * frac), rx = Math.abs(k) * r;
  if (frac < .5) return `M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${rx} ${r} 0 0 ${k > 0 ? 0 : 1} ${cx} ${cy - r}Z`;
  return `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx} ${cy + r}A${rx} ${r} 0 0 ${k > 0 ? 1 : 0} ${cx} ${cy - r}Z`;
}
const dfmt = (d, o) => new Intl.DateTimeFormat("de-AT", { timeZone: "Europe/Vienna", ...o }).format(d);
function moonInfo(now = new Date()) {
  const frac = moonFrac(now);
  const illum = Math.round((1 - Math.cos(2 * Math.PI * frac)) / 2 * 100);
  const nf = FULL.find(d => d > now), nn = NEW.find(d => d > now);
  const days = d => Math.round((new Date(dfmt(d, { year: "numeric", month: "2-digit", day: "2-digit" }).split(".").reverse().join("-")) - new Date(dfmt(now, { year: "numeric", month: "2-digit", day: "2-digit" }).split(".").reverse().join("-"))) / 864e5);
  let name = frac < .5 ? "Zunehmender Mond" : "Abnehmender Mond";
  if (frac < .03 || frac > .97) name = "Neumond"; else if (Math.abs(frac - .5) < .03) name = "Vollmond";
  const target = nf && (!nn || nf < nn) ? ["Vollmond", nf] : ["Neumond", nn];
  const dd = target[1] ? days(target[1]) : null;
  const when = dd === 0 ? `Heute ${target[0]}` : dd === 1 ? `${target[0]} morgen` : `${target[0]} in ${dd} Tagen`;
  return { frac, illum, name, when, nf, nn };
}
function drawMoon(svg, frac, size = 40) {
  const c = size / 2, r = size / 2 - 3;
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.innerHTML = `<circle cx="${c}" cy="${c}" r="${r}" fill="#26142C"/><path d="${moonPath(frac, c, c, r)}" fill="#F7E7C6"/><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".35"/>`;
}
{
  const mi = moonInfo();
  $$(".moon-badge").forEach(b => {
    drawMoon($("svg", b), mi.frac);
    const t = $(".mb-text", b); if (t) t.textContent = mi.when;
    b.title = `${mi.name}, ${mi.illum} % beleuchtet. ${mi.when}.`;
    b.setAttribute("aria-label", `${mi.name}, ${mi.when}. Zum Vollmond-Kalender`);
  });
  $$("[data-moon-now]").forEach(s => drawMoon(s, mi.frac, 120));
  $$("[data-moon-text]").forEach(el => el.textContent = `${mi.name}, ${mi.illum} % beleuchtet. ${mi.when}.`);
  if (mi.nn) $$("[data-next-newmoon]").forEach(el => el.textContent = `Nächste Ausgabe zum Neumond am ${dfmt(mi.nn, { weekday: "long", day: "numeric", month: "long" })}.`);
}

/* ---------- forms: real send via SITE_CONFIG, otherwise honest preview ---------- */
function labelFor(el, form) {
  const fs = el.closest("[data-label]"); if (fs && (el.type === "radio" || el.type === "checkbox")) return fs.dataset.label;
  const l = el.id && form.querySelector(`label[for="${el.id}"]`);
  return (l ? l.textContent : el.dataset.label || el.name).replace("*", "").trim();
}
function summarize(form) {
  const lines = [], seen = new Set();
  $$("input,select,textarea", form).forEach(el => {
    if (!el.name || el.classList.contains("hp") || el.type === "hidden" && !el.dataset.label || el.type === "submit") return;
    if (el.type === "checkbox" && el.name === "einwilligung") return;
    if (seen.has(el.name)) return;
    let v;
    if (el.type === "radio" || el.type === "checkbox") { seen.add(el.name); v = $$(`[name="${el.name}"]:checked`, form).map(x => x.value).join(", "); }
    else v = el.value.trim();
    if (v) lines.push(`${labelFor(el, form)}: ${v}`);
  });
  return lines.join("\n");
}
const SUBJECT = {
  kontakt: f => `Anfrage über die Website: ${f.get("anliegen") || "Allgemein"}`,
  buchung: f => `Reservierung: ${f.get("termin")} am ${f.get("datum")}`,
  wunsch: f => `Wunschformat: ${f.get("format_titel") || "Anfrage"}`,
  gastgeber: f => `Kooperationsanfrage: ${f.get("betrieb") || ""}`,
};
function resultBox(form, html) {
  const box = document.createElement("div");
  box.className = "result"; box.setAttribute("role", "status"); box.tabIndex = -1; box.innerHTML = html;
  form.hidden = true; form.after(box); box.focus({ preventScroll: false });
  $("[data-again]", box)?.addEventListener("click", () => { box.remove(); form.hidden = false; });
  return box;
}
async function onSubmit(e) {
  const form = e.target; e.preventDefault();
  if ($(".hp", form)?.value) return;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const kind = form.dataset.form, fd = new FormData(form);
  const first = (fd.get("name") || fd.get("vorname") || fd.get("ansprechperson") || "").toString().split(" ")[0];
  if (kind === "newsletter") {
    if (CFG.newsletterEndpoint) { form.action = CFG.newsletterEndpoint; form.method = "post"; form.target = "_blank"; form.submit(); resultBox(form, `<h3>Fast geschafft${first ? ", " + esc(first) : ""}!</h3><p>Bitte bestätige deine Anmeldung über den Link in der Mail, die gerade zu dir unterwegs ist.</p>`); return; }
    resultBox(form, `<h3>Vorschau: Anmeldung noch nicht verbunden</h3><p>Sobald die Mondpost mit einem Newsletter-Dienst verknüpft ist, kommt hier eine Bestätigungsmail an. Bis dahin wurde nichts gespeichert oder verschickt.</p><button class="btn btn--sm" type="button" data-again>Zurück zum Formular</button>`);
    return;
  }
  const subject = (SUBJECT[kind] || SUBJECT.kontakt)(fd), text = summarize(form);
  const mail = CFG.email || "hallo@katharina-gloeckel.at";
  const mailto = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  if (CFG.formEndpoint) {
    const btn = $('[type="submit"]', form); btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = "Wird gesendet …";
    fd.append("_subject", subject);
    try {
      const r = await fetch(CFG.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status);
      resultBox(form, `<h3>Danke${first ? ", " + esc(first) : ""}!</h3><p>Deine Anfrage ist bei mir angekommen. Ich melde mich innerhalb von zwei Werktagen bei dir.</p>`);
      document.dispatchEvent(new CustomEvent("sent", { detail: { kind } }));
    } catch (err) {
      btn.disabled = false; btn.textContent = btn.dataset.t;
      resultBox(form, `<h3>Das hat nicht geklappt.</h3><p>Die Anfrage konnte gerade nicht gesendet werden. Schick sie mir bitte direkt per E-Mail an <b>${esc(mail)}</b>, der Text ist schon vorbereitet.</p><div class="btns"><a class="btn btn--main btn--sm" href="${mailto}">E-Mail öffnen</a><button class="btn btn--sm" type="button" data-again>Nochmal versuchen</button></div>`);
    }
    return;
  }
  const box = resultBox(form, `<h3>Vorschau: noch nicht verschickt</h3><p>Das Formular ist noch mit keinem Versanddienst verbunden. Deine Angaben sind fertig vorbereitet: Öffne sie als E-Mail oder kopiere den Text und schick ihn an <b>${esc(mail)}</b>.</p><pre>${esc(subject)}\n\n${esc(text)}</pre><div class="btns"><a class="btn btn--main btn--sm" href="${mailto}">Als E-Mail öffnen</a><button class="btn btn--sm" type="button" data-copy>Text kopieren</button><button class="btn btn--sm" type="button" data-again>Bearbeiten</button></div>`);
  $("[data-copy]", box)?.addEventListener("click", async ev => { try { await navigator.clipboard.writeText(subject + "\n\n" + text); ev.target.textContent = "Kopiert"; } catch (_) { ev.target.textContent = "Bitte Text markieren"; } });
}
document.addEventListener("submit", e => { if (e.target.matches("form[data-form]")) onSubmit(e); });

/* ---------- termine ---------- */
const KAT = { alle: "Alle", sunrise: "Sonnenaufgang", vollmond: "Vollmond", klang: "Klang", zyklus: "Zyklus & Hormone", special: "Specials" };
const today = new Date(); today.setHours(0, 0, 0, 0);
const upcoming = TERMINE.filter(t => new Date(t.datum + "T00:00") >= today).sort((a, b) => a.datum.localeCompare(b.datum) || a.von.localeCompare(b.von));
const dParts = t => { const d = new Date(t.datum + "T12:00"); return { d, day: d.getDate(), mon: dfmt(d, { month: "long", year: "numeric" }), wd: dfmt(d, { weekday: "long" }) }; };
function seatsTxt(t) { if (t.frei <= 0) return `<span class="seats seats--low">Ausgebucht</span>`; if (t.frei <= 4) return `<span class="seats seats--low">Nur noch ${t.frei} ${t.frei === 1 ? "Platz" : "Plätze"}</span>`; return `<span class="seats">${t.frei} von ${t.plaetze} Plätzen frei</span>`; }
function row(t) {
  const p = dParts(t);
  return `<li class="date-row" id="t-${esc(t.id)}" data-kat="${esc(t.kat)}">
    <div class="date-big">${p.day}.<small>${esc(p.mon)}<br>${esc(p.wd)}</small></div>
    <div><h3>${esc(t.titel)}</h3><div class="date-meta"><span class="nowrap">${esc(t.von)} bis ${esc(t.bis)} Uhr</span><span>${esc(t.ort)}</span></div><p>${esc(t.text)}</p></div>
    <div class="date-act"><span class="price">${esc(t.preis)}</span>${seatsTxt(t)}<button class="btn ${t.frei > 0 ? "btn--main" : ""} btn--sm" type="button" data-book="${esc(t.id)}">${t.frei > 0 ? "Platz reservieren" : "Auf die Warteliste"}</button>${inFrame ? "" : `<button class="ics" type="button" data-ics="${esc(t.id)}">In den Kalender</button>`}</div></li>`;
}
$$("[data-termine]").forEach(list => {
  const limit = +list.dataset.limit || 999;
  const render = kat => {
    const items = upcoming.filter(t => !kat || kat === "alle" || t.kat === kat).slice(0, limit);
    list.innerHTML = items.length ? items.map(row).join("") : `<li class="empty">Gerade keine offenen Termine in dieser Kategorie. <a href="${root}buchen.html#gestalten">Gestalte dein eigenes Format</a> oder trag dich für die Mondpost ein.</li>`;
  };
  render("alle");
  const fbox = list.dataset.filter && $(list.dataset.filter);
  if (fbox) {
    fbox.innerHTML = Object.entries(KAT).filter(([k]) => k === "alle" || upcoming.some(t => t.kat === k)).map(([k, v]) => `<button class="chip" type="button" aria-pressed="${k === "alle"}" data-k="${k}">${v}</button>`).join("");
    fbox.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$(".chip", fbox).forEach(c => c.setAttribute("aria-pressed", c === b)); render(b.dataset.k); });
  }
});
if (location.hash.startsWith("#t-")) { const r = $(location.hash); if (r) { r.style.background = "color-mix(in srgb,var(--sun) 25%,transparent)"; setTimeout(() => r.scrollIntoView({ block: "center" }), 60); } }

const dlg = $("#book-dlg");
function openBooking(t) {
  if (!dlg) return;
  const p = dParts(t), wait = t.frei <= 0, max = Math.max(1, Math.min(wait ? 6 : t.frei, 10));
  dlg.innerHTML = `<div class="dlg"><button class="x" type="button" data-x aria-label="Schließen">×</button>
    <h2 id="dlg-title">${wait ? "Auf die Warteliste" : "Platz reservieren"}</h2>
    <p><b>${esc(t.titel)}</b></p>
    <div class="date-meta"><span class="nowrap">${esc(p.wd)}, ${p.day}. ${esc(p.mon)}</span><span class="nowrap">${esc(t.von)} bis ${esc(t.bis)} Uhr</span><span class="nowrap">${esc(t.preis)}</span></div>
    <form class="form" data-form="buchung" novalidate>
      <input type="hidden" name="termin" value="${esc(t.titel)}" data-label="Termin"><input type="hidden" name="datum" value="${esc(p.day + ". " + p.mon + ", " + t.von)}" data-label="Datum">
      <input type="hidden" name="art" value="${wait ? "Warteliste" : "Reservierung"}" data-label="Art">
      <div class="row"><div class="field"><label for="b-name">Name <span class="req">*</span></label><input id="b-name" name="name" type="text" autocomplete="name" required></div>
      <div class="field"><label for="b-mail">E-Mail <span class="req">*</span></label><input id="b-mail" name="email" type="email" autocomplete="email" required></div></div>
      <div class="row"><div class="field"><label for="b-tel">Telefon</label><input id="b-tel" name="telefon" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="b-anz">Personen</label><input id="b-anz" name="personen" type="number" min="1" max="${max}" value="1" inputmode="numeric"></div></div>
      <div class="field"><label for="b-msg">Möchtest du mir etwas mitgeben?</label><textarea id="b-msg" name="nachricht" rows="3" placeholder="Yoga-Erfahrung, Verletzungen, Schwangerschaft, Fragen …"></textarea></div>
      <label class="check"><input type="checkbox" name="einwilligung" required> <span>Ich habe die <a href="${root}datenschutz.html">Datenschutzerklärung</a> gelesen und bin einverstanden, dass meine Angaben für diese Reservierung verwendet werden. <span class="req">*</span></span></label>
      <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="btns"><button class="btn btn--main" type="submit">${wait ? "Auf die Warteliste setzen" : "Reservierung anfragen"}</button></div>
      <p class="note">Du bekommst eine Bestätigung mit genauem Ort und Zahlungsinfos per E-Mail. Kostenlos stornieren kannst du bis 7 Tage vorher.</p>
    </form></div>`;
  $("[data-x]", dlg).addEventListener("click", () => dlg.close());
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  setTimeout(() => $("#b-name", dlg)?.focus(), 30);
}
dlg?.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
function ics(t) {
  const d = t.datum.replace(/-/g, ""), a = t.von.replace(":", "") + "00", b = t.bis.replace(":", "") + "00";
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Katharina Gloeckel//Termine//DE", "BEGIN:VEVENT", `UID:${t.id}@katharina-gloeckel.at`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART:${d}T${a}`, `DTEND:${d}T${b}`, `SUMMARY:${t.titel}`, `LOCATION:${t.ort}`, `DESCRIPTION:${t.text}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const l = document.createElement("a"); l.href = url; l.download = t.id + ".ics"; document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-book]"); if (b) { const t = TERMINE.find(x => x.id === b.dataset.book); if (t) openBooking(t); }
  const c = e.target.closest("[data-ics]"); if (c) { const t = TERMINE.find(x => x.id === c.dataset.ics); if (t) ics(t); }
});

/* ---------- simple filters (offers, journal) ---------- */
function filterChips(box, items, attr) {
  box.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    $$(".chip", box).forEach(c => c.setAttribute("aria-pressed", c === b));
    const f = b.dataset.f; let n = 0;
    items.forEach(it => { const show = f === "alle" || (it.dataset[attr] || "").split(" ").includes(f); it.hidden = !show; if (show) n++; });
    const out = $("[data-count]", box.parentElement); if (out) out.textContent = n === 1 ? "1 Format" : `${n} Formate`;
  });
}
$$("[data-offer-filter]").forEach(b => filterChips(b, $$(".offer"), "tags"));
$$("[data-post-filter]").forEach(b => filterChips(b, $$(".post[data-cat]"), "cat"));

/* ---------- breath ---------- */
const breath = $("#breath");
if (breath) {
  const MODES = { ruhe: [["Einatmen", 4, 1], ["Ausatmen", 6, .56]], box: [["Einatmen", 4, 1], ["Halten", 4, 1], ["Ausatmen", 4, .56], ["Halten", 4, .56]], "478": [["Einatmen", 4, 1], ["Halten", 7, 1], ["Ausatmen", 8, .56]] };
  const core = $(".b-core", breath), lab = $(".breath-label b", breath), num = $(".breath-label span", breath), btn = $("[data-breath-go]", breath), snd = $("#b-sound");
  let mode = "ruhe", timer = null, i = 0, left = 0, running = false;
  const setScale = (s, dur) => { core.style.transitionDuration = dur + "s"; core.style.transform = `scale(${s})`; };
  const step = () => {
    const ph = MODES[mode][i % MODES[mode].length]; left = ph[1];
    lab.textContent = ph[0]; num.textContent = left; setScale(ph[2], ph[1]);
    if (snd?.checked && ph[0] !== "Halten") pan.strike(ph[0] === "Einatmen" ? 220 : 146.83, .22);
  };
  const tick = () => { left--; if (left <= 0) { i++; step(); } else num.textContent = left; };
  const stop = () => { clearInterval(timer); running = false; i = 0; btn.textContent = "Starten"; lab.textContent = "Bereit?"; num.textContent = MODES[mode].map(p => p[1]).join("·"); setScale(.78, 1.2); };
  btn.addEventListener("click", () => { if (running) return stop(); running = true; btn.textContent = "Pause"; i = 0; step(); timer = setInterval(tick, 1000); });
  $$(".chip", breath).forEach(c => c.addEventListener("click", () => { $$(".chip", breath).forEach(x => x.setAttribute("aria-pressed", x === c)); mode = c.dataset.mode; stop(); }));
  stop();
}

/* ---------- cycle wheel ---------- */
const PH = {
  winter: { t: "Innerer Winter", d: "Menstruation, etwa Tag 1 bis 5", ar: "Die Weise Alte", e: "Oft leiser, nach innen gerichtet, ruhebedürftig.", y: "Yin Yoga, sanfte Vorbeugen, Yoga Nidra. Umkehrhaltungen darfst du nach Gefühl weglassen.", a: "Lange, weiche Ausatmung und Bauchatmung.", k: "Klangreise im Liegen: nichts tun müssen." },
  fruehling: { t: "Innerer Frühling", d: "Follikelphase, etwa Tag 6 bis 12", ar: "Die Jungfrau", e: "Die Energie steigt, Neugier und Lust auf Neues wachsen.", y: "Lebendiger Vinyasa Flow, neue Haltungen ausprobieren, Balancen.", a: "Belebende Atmung, zum Beispiel Kapalabhati in kurzen Runden.", k: "Hell und rhythmisch: Handpan zum Mitsummen." },
  sommer: { t: "Innerer Sommer", d: "Eisprung, etwa Tag 13 bis 17", ar: "Die Mutter oder Königin", e: "Kraftvoll, offen, gesellig.", y: "Kraftvolle Flows, Herzöffner, Praxis in der Gruppe.", a: "Ujjayi im Flow: Atem und Bewegung im Gleichklang.", k: "Gemeinsam tönen, Mantras singen." },
  herbst: { t: "Innerer Herbst", d: "Lutealphase, etwa Tag 18 bis 28", ar: "Die Zauberin", e: "Die Energie sinkt, die innere Kritikerin wird oft lauter.", y: "Erdende Standhaltungen, langsamere Flows, Hüftöffner, abends Yin.", a: "Wechselatmung (Nadi Shodhana) zum Ausgleichen.", k: "Tiefe Töne, Klangschalen und Stille danach." },
};
const wheel = $("#wheel"), panel = $("#phase-panel");
if (wheel && panel) {
  const show = k => {
    const p = PH[k]; wheel.dataset.active = k;
    $$(".arc", wheel).forEach(a => a.setAttribute("aria-pressed", a.dataset.phase === k));
    panel.innerHTML = `<h3>${p.t}</h3><p class="days">${p.d}</p><dl><dt>Archetyp</dt><dd>${p.ar}</dd><dt>Energie</dt><dd>${p.e}</dd><dt>Yoga</dt><dd>${p.y}</dd><dt>Atem</dt><dd>${p.a}</dd><dt>Klang</dt><dd>${p.k}</dd></dl>`;
  };
  $$(".arc", wheel).forEach(a => { a.addEventListener("click", () => show(a.dataset.phase)); a.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(a.dataset.phase); } }); });
  show("herbst");
}

/* ---------- handpan (Web Audio, D-Kurd) ---------- */
const pan = (() => {
  let ctx, out, rev;
  const init = () => {
    if (ctx) return ctx.resume?.();
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); out = ctx.createGain(); out.gain.value = .9;
    rev = ctx.createConvolver(); const len = ctx.sampleRate * 2.6, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    rev.buffer = buf; const wet = ctx.createGain(); wet.gain.value = .32;
    out.connect(ctx.destination); out.connect(rev); rev.connect(wet); wet.connect(ctx.destination);
  };
  const strike = (f, vol = .5) => {
    try { init(); if (!ctx) return; } catch (e) { return; }
    const t = ctx.currentTime, lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200; lp.connect(out);
    [[1, 1, 3.4], [2, .34, 2.2], [3, .11, 1.3], [4.02, .04, .7]].forEach(([m, a, dec]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f * m; o.detune.value = (Math.random() - .5) * 4;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * a, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dec);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + dec + .05);
    });
  };
  return { strike };
})();
const panEl = $("#pan");
if (panEl) {
  const fields = $$(".tf", panEl);
  const hit = tf => { pan.strike(+tf.dataset.f, tf.dataset.ding ? .6 : .48); tf.classList.add("is-on"); clearTimeout(tf._t); tf._t = setTimeout(() => tf.classList.remove("is-on"), 420); };
  fields.forEach(tf => {
    tf.addEventListener("pointerdown", e => { e.preventDefault(); hit(tf); });
    tf.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(tf); } });
  });
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea,select") || e.metaKey || e.ctrlKey || e.altKey) return;
    const n = +e.key; if (n >= 1 && n <= 9) { const tf = fields.find(f => +f.dataset.n === n); if (tf) hit(tf); }
  });
}

/* ---------- configurator ---------- */
const cfg = $("#cfg");
if (cfg) {
  const val = n => $(`[name="${n}"]:checked`, cfg);
  const vals = n => $$(`[name="${n}"]:checked`, cfg);
  const keys = n => vals(n).map(x => x.dataset.k);
  const PRESET = {
    sunrise: { wer: "gruppe", inhalt: ["flow", "atem"], zeit: "sunrise", dauer: "90", ort: "draussen" },
    park: { wer: "gruppe", inhalt: ["flow"], zeit: "abend", dauer: "60", ort: "draussen" },
    vollmond: { wer: "gruppe", inhalt: ["yin", "nidra", "klang"], zeit: "vollmond", dauer: "90", ort: "draussen" },
    klangreise: { wer: "gruppe", inhalt: ["klang"], zeit: "abend", dauer: "90", ort: "raum" },
    breathwork: { wer: "mich", inhalt: ["atem", "meditation"], zeit: "abend", dauer: "60", ort: "raum", n: 1 },
    zyklus: { wer: "gruppe", anlass: ["frauenkreis"], inhalt: ["zyklus", "yin"], zeit: "abend", dauer: "90", ort: "raum" },
    hormon: { wer: "gruppe", inhalt: ["hormon", "atem"], zeit: "tag", dauer: "halbtag", ort: "raum" },
    jga: { wer: "gruppe", anlass: ["jga"], inhalt: ["flow", "klang"], zeit: "tag", dauer: "90", ort: "draussen", n: 10 },
    bauernhof: { wer: "gruppe", anlass: ["auszeit"], inhalt: ["flow", "atem", "klang"], zeit: "offen", dauer: "wochenende", ort: "hof", n: 10 },
    heuriger: { wer: "gruppe", inhalt: ["flow"], zeit: "tag", dauer: "halbtag", ort: "hof", n: 14 },
    retreat: { wer: "gruppe", anlass: ["retreat"], inhalt: ["flow", "meditation", "klang"], zeit: "offen", dauer: "mehrtaegig", ort: "hof", n: 14 },
    firma: { wer: "gaeste", anlass: ["team"], inhalt: ["atem", "meditation"], zeit: "tag", dauer: "60", ort: "zuhause", n: 15 },
    einzeln: { wer: "mich", inhalt: ["flow", "atem"], zeit: "offen", dauer: "60", ort: "zuhause", n: 1 },
    gaeste: { wer: "gaeste", anlass: ["gaesteprogramm"], inhalt: ["flow", "klang"], zeit: "sunrise", dauer: "60", ort: "hof", n: 12 },
    gutschein: { wer: "mich", anlass: ["geburtstag"], inhalt: ["klang"], zeit: "offen", dauer: "90", ort: "raum", n: 1 },
    empowerment: { wer: "gruppe", anlass: ["frauenkreis"], inhalt: ["atem", "zyklus", "meditation"], zeit: "tag", dauer: "halbtag", ort: "raum", n: 12 },
  };
  const apply = p => {
    $$("input[type=radio],input[type=checkbox]", cfg).forEach(i => { if (i.name !== "einwilligung") i.checked = false; });
    const set = (n, k) => { const el = $(`[name="${n}"][data-k="${k}"]`, cfg); if (el) el.checked = true; };
    ["wer", "zeit", "dauer", "ort"].forEach(n => p[n] && set(n, p[n]));
    (p.anlass || []).forEach(k => set("anlass", k)); (p.inhalt || []).forEach(k => set("inhalt", k));
    $("#c-n", cfg).value = p.n || 8;
  };
  const range = $("#c-n", cfg), outN = $("#c-n-out", cfg);
  const title = () => {
    const I = keys("inhalt"), A = keys("anlass"), z = val("zeit")?.dataset.k, d = val("dauer")?.dataset.k, w = val("wer")?.dataset.k, n = +range.value;
    let core = ["Yoga-Flow", "m"];
    if (A.includes("frauenkreis") && (d === "halbtag" || d === "60" || d === "90")) core = ["Empowerment-Workshop", "m"];
    else if (d === "mehrtaegig" || A.includes("retreat")) core = [A.includes("frauenkreis") ? "Frauen-Retreat" : I.includes("zyklus") ? "Zyklus-Retreat" : I.includes("klang") ? "Klang-Retreat" : "Retreat", "n"];
    else if (d === "wochenende") core = [A.includes("jga") ? "JGA-Wochenende" : "Yoga-Wochenende", "n"];
    else if (I.includes("klang")) core = ["Klangreise", "f"];
    else if (I.includes("hormon")) core = ["Hormon-Yoga", "n"];
    else if (I.includes("zyklus")) core = ["Zyklus-Yoga", "n"];
    else if (!I.includes("flow") && I.includes("atem")) core = ["Atemreise", "f"];
    else if (!I.includes("flow") && I.includes("nidra")) core = ["Yoga-Nidra-Reise", "f"];
    else if (!I.includes("flow") && I.includes("meditation")) core = ["Meditation", "f"];
    else if (!I.includes("flow") && I.includes("yin")) core = ["Yin-Praxis", "f"];
    if (!/Retreat|Wochenende/.test(core[0])) {
      const pre = A.includes("jga") ? "JGA" : z === "sunrise" ? "Sunrise" : z === "vollmond" ? "Vollmond" : A.includes("team") ? "Team" : "";
      if (pre) core[0] = core[0] === "Yoga-Flow" ? pre + "-Flow" : pre + "-" + core[0];
    }
    const plural = w === "gruppe" || w === "gaeste" || n > 1;
    const art = core[1] === "f" ? (plural ? "Eure" : "Deine") : (plural ? "Euer" : "Dein");
    return `${art} ${core[0]}`;
  };
  const render = () => {
    const n = +range.value; outN.textContent = n >= 40 ? "40+" : n;
    range.style.setProperty("--p", ((n - 1) / 39 * 100) + "%");
    const t = title(); $("#c-title").value = t;
    const txt = n2 => (vals(n2).map(x => x.value).join(", ") || "noch offen");
    const datum = $("#c-datum", cfg).value ? dfmt(new Date($("#c-datum", cfg).value + "T12:00"), { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "flexibel";
    const ortTxt = [val("ort")?.value, $("#c-plz", cfg).value.trim()].filter(Boolean).join(", ") || "noch offen";
    const sum = $("#cfg-sum");
    $("h3", sum).textContent = t;
    $("dl", sum).innerHTML = `<dt>Für</dt><dd>${esc(val("wer")?.value || "noch offen")}</dd><dt>Anlass</dt><dd>${esc(txt("anlass"))}</dd><dt>Inhalt</dt><dd>${esc(txt("inhalt"))}</dd><dt>Wann</dt><dd>${esc((val("zeit")?.value || "noch offen") + ", " + datum)}</dd><dt>Dauer</dt><dd>${esc(val("dauer")?.value || "noch offen")}</dd><dt>Wo</dt><dd>${esc(ortTxt)}</dd><dt>Personen</dt><dd>${n >= 40 ? "40 oder mehr" : n}</dd>`;
    const ms = $(".mob-sum b"); if (ms) ms.textContent = t;
  };
  cfg.addEventListener("input", render); cfg.addEventListener("change", render);
  const fromHash = () => { const m = location.hash.match(/^#wunsch-([a-z]+)/); if (m && PRESET[m[1]]) { apply(PRESET[m[1]]); render(); setTimeout(() => $("#gestalten")?.scrollIntoView(), 60); } };
  window.addEventListener("hashchange", fromHash);
  render(); fromHash();
}

/* ---------- contact: preselect topic from hash ---------- */
const anl = $("#k-anliegen");
if (anl) {
  const map = { "#gutschein": "Gutschein", "#kennenlernen": "Kennenlerngespräch", "#kooperation": "Kooperation als Gastgeber", "#presse": "Presse & Sonstiges" };
  const pick = () => { const v = map[location.hash]; if (v) { anl.value = v; $("#kontaktformular")?.scrollIntoView({ block: "start" }); } };
  window.addEventListener("hashchange", pick); pick();
}

console.log("%cFür Katharina. Mit Liebe gebaut. 🌕", "font:600 14px Georgia;color:#D6336C");
}
