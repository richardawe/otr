/* On the record — no dependencies, no build step. */

(function () {
  "use strict";

  var fmt = function (n) { return n.toLocaleString(); };

  /* ---------------- corpus: one action ---------------- */

  function em(datum, holder, note) { return { kind: "emitted", datum: datum, holder: holder, note: note || "" }; }
  function inf(datum, holder, note) { return { kind: "inferred", datum: datum, holder: holder, note: note || "" }; }
  function rel(datum, holder, note) { return { kind: "relational", datum: datum, holder: holder, note: note || "" }; }

  var PHONE = [
    em("Cell tower connections, minute by minute", "Mobile network", "retained for months under lawful-intercept rules"),
    em("Wifi and Bluetooth beacons broadcast to nearby receivers", "Retail and venue analytics"),
    em("Which apps opened, in what order, for how long", "Handset OS vendor"),
    inf("Home and work locations, from where you dwell overnight and by day", "Ad tech, data brokers", "never entered by you; derived from the pattern")
  ];

  var MODULES = [
    { keys: ["bus", "train", "tube", "tram", "metro", "transit", "commute", "subway"], records: [
      em("Card tap at boarding, with time and stop", "Transit operator"),
      em("Onboard and platform CCTV frames", "Transit operator, police on request"),
      inf("Commuting pattern and likely shift hours", "Transit operator"),
      inf("Household income band, from route and stop", "Data brokers", "stops correlate strongly with postcode income"),
      rel("Other passengers in the same CCTV frames", "Transit operator", "captured without any relationship to your journey"),
      rel("Placement in a 'commuter' segment built from strangers", "Ad tech", "your price set by people you have never met")
    ]},
    { keys: ["card", "bought", "buy", "paid", "pay", "shop", "purchase", "contactless", "apple pay"], records: [
      em("Merchant, amount, time, terminal ID", "Bank, card network"),
      em("Item-level SKUs on the receipt", "Retailer", "linked to you if a loyalty card was scanned"),
      em("Store entry and dwell time on camera", "Retailer"),
      inf("Spending category profile and disposable income", "Bank, credit bureaux"),
      inf("Life-stage flags — new baby, house move, illness", "Retailer", "inferred from shifts in basket composition"),
      rel("Anyone you shop for appears in your profile as your behaviour", "Retailer", "the gift and the habit look identical")
    ]},
    { keys: ["cigarette", "smoke", "tobacco", "vape", "alcohol", "wine", "beer", "drink"], records: [
      inf("Smoker or drinker status attached to your record", "Insurers, data brokers", "purchase category is enough; no declaration needed"),
      inf("Health-risk score adjusting quoted premiums", "Insurers"),
      inf("Ad segments for cessation products and, separately, for tobacco brands", "Ad tech", "the same signal sells you the habit and the cure"),
      rel("Household members scored on the same basket", "Data brokers", "shared address, shared inference")
    ]},
    { keys: ["sleep", "insomnia", "awake", "bed", "night", "scroll", "scrolling"], records: [
      em("Timestamps of every session, including 3am ones", "Platform, handset OS"),
      em("Scroll velocity, pauses, rewatches, what you hovered on", "Platform"),
      em("Text typed into a box and then deleted", "Platform", "captured on many platforms though never sent"),
      em("Screen-on time and sleep windows", "Handset OS, wearable"),
      inf("Disrupted sleep, and mood state from posting hours", "Platform", "night-time engagement is a known distress signal"),
      inf("Emotional volatility scores used to time what you are shown", "Platform"),
      rel("Content ranked for you by what similar insomniacs stayed on", "Platform", "strangers' compulsions shaping your feed")
    ]},
    { keys: ["run", "ran", "jog", "walk", "walked", "cycle", "gym", "exercise", "park", "hike"], records: [
      em("GPS trace of the route, with pace per segment", "Fitness app"),
      em("Heart rate, cadence, recovery time", "Wearable maker"),
      em("Faces in doorbell and dashcam footage along the route", "Camera owners"),
      inf("Fitness trajectory and injury risk", "Wearable maker, insurers"),
      inf("Home address, from where routes begin and end", "Fitness app", "loops betray their origin even with a privacy radius"),
      rel("Everyone you pass, recorded incidentally", "Camera owners"),
      rel("Your times ranked against segment leaderboards", "Fitness app", "made legible only by others' data")
    ]},
    { keys: ["call", "called", "phone", "rang", "text", "message", "mum", "mom", "dad", "friend"], records: [
      em("Call detail record: numbers, duration, time, cell mast", "Mobile network", "content not needed; metadata is the product"),
      em("Contact graph and reply latency", "Messaging platform"),
      inf("Closeness ranking of your relationships", "Platform", "from frequency, duration, who calls first"),
      inf("Caregiving burden, bereavement, family crisis", "Ad tech", "sharp changes in call patterns are legible events"),
      rel("The other person's record of you, held under their account", "Platform, network"),
      rel("Contacts uploaded by others who have your number", "Platform", "you appear in the graph without ever consenting")
    ]},
    { keys: ["drove", "drive", "car", "parked", "traffic", "petrol", "fuel"], records: [
      em("Number plate reads at fixed cameras", "Police, tolling, car parks"),
      em("Telematics: speed, braking, cornering, night driving", "Insurer, carmaker"),
      em("In-cabin microphone and camera activity", "Carmaker"),
      inf("Driver risk score setting your premium", "Insurer"),
      rel("Passengers recorded by the cabin camera", "Carmaker")
    ]},
    { keys: ["work", "office", "meeting", "email", "slack", "shift", "laptop"], records: [
      em("Badge swipes and movement between zones", "Employer"),
      em("Keystroke rate, idle time, periodic screenshots", "Employer, monitoring vendor"),
      em("Meeting transcripts and speaking time per person", "Employer"),
      inf("Productivity and flight-risk scores", "Employer", "flight risk is often modelled before you have decided"),
      rel("Colleagues transcribed alongside you", "Employer")
    ]},
    { keys: ["searched", "google", "looked up", "browsed", "online", "website"], records: [
      em("Query text, with timestamp and location", "Search provider"),
      em("Pages visited, via embedded trackers", "Ad tech"),
      inf("Health conditions and worries, from symptom searches", "Ad tech", "search history is the most candid record most people keep"),
      inf("Sexuality, faith, immigration status", "Data brokers", "inferred, sold, and hard to correct")
    ]},
    { keys: ["home", "house", "kitchen", "cooked", "tv", "watched", "shower", "flat"], records: [
      em("Appliance-level electricity draw, disaggregated", "Smart meter operator", "the meter can tell the kettle from the shower"),
      em("What is on screen, including from plugged-in devices", "TV maker", "automatic content recognition, on by default"),
      em("Wake words and the seconds either side", "Smart speaker maker"),
      inf("Occupancy, routine, and when the house is empty", "Utility, insurers"),
      rel("Visitors captured by the doorbell", "Camera maker, neighbours' networks")
    ]}
  ];

  var READING = "None of these fragments is you. Recombined with strangers', they set what you are offered, at what price, and whether the door opens.";
  var UNRECORDED = ["Why you did it", "What you noticed and said nothing about", "What you decided against doing"];
  var EXAMPLES = [
    "I took the bus to work",
    "I couldn't sleep and scrolled my phone",
    "I bought cigarettes with my card",
    "I went for a run in the park",
    "I called my mum"
  ];
  var KINDS = [
    { id: "emitted", label: "Emitted", gloss: "You produced it." },
    { id: "inferred", label: "Inferred", gloss: "A model produced it. You never gave it." },
    { id: "relational", label: "Relational", gloss: "It is about other people too." }
  ];

  function compose(text) {
    var low = text.toLowerCase();
    var hits = MODULES.filter(function (m) {
      return m.keys.some(function (k) { return low.indexOf(k) !== -1; });
    });
    var records = PHONE.slice();
    hits.forEach(function (m) { records = records.concat(m.records); });
    var seen = {};
    var deduped = records.filter(function (x) {
      if (seen[x.datum]) return false;
      seen[x.datum] = true;
      return true;
    });
    return {
      act: text.trim().toLowerCase().replace(/\.$/, ""),
      matched: hits.length,
      records: deduped
    };
  }

  /* ---------------- corpus: one day ---------------- */

  function E(n, datum, holder, note) { return { kind: "emitted", n: n, datum: datum, holder: holder, note: note || "" }; }
  function I(datum, holder, note) { return { kind: "inferred", n: 1, datum: datum, holder: holder, note: note || "" }; }
  function R(n, datum, holder, note) { return { kind: "relational", n: n, datum: datum, holder: holder, note: note || "" }; }

  var DAY = [
    { t: 0, label: "00:00", act: "Asleep. Phone charging on the nightstand.", records: [
      E(388, "Cell mast handovers while stationary", "Mobile network"),
      E(480, "Minute-level heart rate and movement", "Wearable maker"),
      E(146, "Background app refreshes and ad SDK pings", "App developers, ad SDKs", "apps you have not opened since yesterday"),
      I("Sleep stages, restlessness, and a proxy for last night's drinking", "Wearable maker, insurers")
    ]},
    { t: 402, label: "06:42", act: "Alarm. First unlock of the day.", records: [
      E(4, "Alarm dismissed, unlock, first screen-on", "Handset OS vendor"),
      E(1, "Night's sleep summary uploaded", "Wearable maker"),
      I("Chronotype and wake-time consistency", "Wearable maker", "sold on as a wellness segment")
    ]},
    { t: 425, label: "07:05", act: "Shower, kettle, toast.", records: [
      E(2, "Half-hourly meter reads, disaggregated by appliance", "Energy supplier", "the meter can tell the shower from the kettle"),
      I("Household occupancy and morning routine window", "Energy supplier, insurers")
    ]},
    { t: 440, label: "07:20", act: "Reads the news on the sofa.", records: [
      E(34, "Page views logged with embedded third-party trackers", "Publishers, ad tech"),
      E(96, "Bid requests broadcasting location and interests", "Up to 1,000+ bidders", "part of an estimated 462 a day for a UK adult"),
      I("Political leaning and income band", "Data brokers")
    ]},
    { t: 475, label: "07:55", act: "Leaves the house.", records: [
      E(3, "Doorbell clips — own, and two neighbours'", "Camera makers, police on request"),
      R(11, "Passers-by recorded in the same frames", "Camera makers", "no relationship to you, kept anyway")
    ]},
    { t: 490, label: "08:10", act: "Bus into town.", records: [
      E(1, "Card tap: route, stop, time", "Transit operator"),
      E(2, "Onboard and platform CCTV", "Transit operator", "roughly 40,000 frames across the journey"),
      E(14, "Mast handovers along the route", "Mobile network"),
      I("Home and work addresses, from where the journey begins and ends", "Ad tech, brokers", "never entered by you")
    ]},
    { t: 530, label: "08:50", act: "Coffee, paid by phone.", records: [
      E(2, "Merchant, amount, terminal, and item-level SKU", "Bank, retailer"),
      E(1, "Wifi probe captured at the counter", "Retail analytics vendor"),
      I("Daily spend rhythm and brand loyalty", "Bank, retailer")
    ]},
    { t: 550, label: "09:10", act: "At a desk until half twelve.", records: [
      E(6, "Badge swipes between zones", "Employer"),
      E(408, "Keystroke rate and idle-time samples", "Employer, monitoring vendor", "sampled every thirty seconds"),
      E(1, "Meeting transcript with speaking time per person", "Employer"),
      I("Productivity score and flight risk", "Employer", "flight risk is modelled before you have decided anything"),
      R(5, "Colleagues transcribed alongside you", "Employer")
    ]},
    { t: 760, label: "12:40", act: "Walks out for lunch.", records: [
      E(5, "High-street CCTV and one plate read", "Council, police, private operators"),
      E(126, "Location pings from apps in the foreground", "Ad tech, app developers"),
      R(40, "Strangers in frame along the route", "Camera operators")
    ]},
    { t: 855, label: "14:15", act: "Looks up a symptom, privately.", records: [
      E(4, "Query text with timestamp and location", "Search provider"),
      E(22, "Trackers embedded on the health pages read", "Ad tech"),
      I("A probable health condition attached to the profile", "Data brokers, insurers", "a sensitive category, inferred rather than declared")
    ]},
    { t: 960, label: "16:00", act: "Texts back and forth. Calls mum.", records: [
      E(38, "Call records and message metadata", "Mobile network, platform", "content not needed; the pattern is the product"),
      I("Closeness ranking across your relationships", "Platform"),
      R(1, "Your number, uploaded by someone else's contacts sync", "Platform", "you are in the graph without ever joining")
    ]},
    { t: 1055, label: "17:35", act: "Commute home.", records: [
      E(1, "Card tap", "Transit operator"),
      E(2, "CCTV, onboard and at the barrier", "Transit operator"),
      E(16, "Mast handovers", "Mobile network")
    ]},
    { t: 1110, label: "18:30", act: "Big shop on the way back.", records: [
      E(31, "Every item, linked by the loyalty card", "Supermarket"),
      E(4, "Store cameras and shelf sensors", "Supermarket, analytics vendor"),
      I("Household size, and a change in diet worth acting on", "Supermarket", "basket shifts flag pregnancy, illness, separation"),
      R(3, "Items bought for other people, filed as your habits", "Supermarket")
    ]},
    { t: 1200, label: "20:00", act: "Two hours in front of the television.", records: [
      E(480, "Screen samples identifying what is playing", "TV maker", "including from the games console plugged into it"),
      E(74, "Pauses, rewinds, and the thing abandoned after four minutes", "Streaming service"),
      I("Household composition, from who watches what together", "TV maker, ad tech")
    ]},
    { t: 1365, label: "22:45", act: "In bed, scrolling. Can't settle.", records: [
      E(902, "Dwell time, scroll velocity, hovers, rewatches", "Platform"),
      E(3, "Messages typed and then deleted", "Platform", "captured though never sent"),
      E(180, "Further bid requests, now with a night-time signal", "Ad tech"),
      I("Disrupted sleep and mood volatility, used to time what you see next", "Platform"),
      R(1, "Your feed ranked by what similar insomniacs stayed on", "Platform")
    ]},
    { t: 1430, label: "23:50", act: "Asleep. The wearable picks back up.", records: [
      E(62, "Heart rate resumes at minute intervals", "Wearable maker"),
      I("Tomorrow's readiness score, already computed", "Wearable maker")
    ]}
  ];

  var PROFILE = [
    ["Lives here, works there", "Never told anyone; the commute said it"],
    ["Income band and political leaning", "From what was read before eight in the morning"],
    ["A health condition", "From one search, now a sensitive-category flag"],
    ["Smoker, drinker, or neither", "From the basket, not from any form"],
    ["Sleeps badly, and is volatile late at night", "The most commercially useful fact of the day"],
    ["Likely to leave the job within a year", "The employer knows before the employee does"],
    ["Household of two, one of them a child", "From co-viewing and shopping, not from a declaration"],
    ["Worth 4p more per ad impression after 11pm", "Recombined with strangers who behave the same way"]
  ];

  /* ---------------- dom helpers ---------------- */

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function recordRow(rec, delay, countLabel) {
    var row = el("div", "row");
    if (delay) row.style.animationDelay = delay + "ms";

    if (countLabel !== undefined) {
      row.appendChild(el("span", "count" + (rec.kind === "inferred" ? " infer" : ""), countLabel));
    } else {
      row.appendChild(el("span", "marker " + rec.kind));
    }

    var mid = el("div", "datum" + (countLabel !== undefined && rec.kind === "inferred" ? " infer" : ""));
    mid.appendChild(document.createTextNode(rec.datum));
    if (rec.note) mid.appendChild(el("div", "note", rec.note));
    row.appendChild(mid);

    row.appendChild(el("div", "holder", rec.holder));
    return row;
  }

  /* ---------------- view: one action ---------------- */

  var entry = $("entry");
  var submit = $("submit");
  var out = $("action-out");

  EXAMPLES.forEach(function (ex) {
    var b = el("button", "ghost", ex);
    b.addEventListener("click", function () {
      entry.value = ex;
      submit.disabled = false;
      runAction(ex);
    });
    $("examples").appendChild(b);
  });

  entry.addEventListener("input", function () { submit.disabled = !entry.value.trim(); });
  entry.addEventListener("keydown", function (ev) { if (ev.key === "Enter") runAction(entry.value); });
  submit.addEventListener("click", function () { runAction(entry.value); });

  function runAction(text) {
    var act = (text || "").trim();
    if (!act) return;
    out.innerHTML = "";
    out.appendChild(el("p", "status", "Reading the act back as data…"));
    setTimeout(function () { renderAction(compose(act)); }, 360);
  }

  function renderAction(result) {
    out.innerHTML = "";

    var total = result.records.length;
    var emittedCount = result.records.filter(function (x) { return x.kind === "emitted"; }).length;

    var sum = el("div", "summary");
    sum.appendChild(el("span", null, result.act));
    sum.appendChild(el("span", "right", total + " records · " + (total - emittedCount) + " you never gave"));
    out.appendChild(sum);

    if (result.matched === 0) {
      out.appendChild(el("p", "nomatch",
        "No specific pattern matched, so this shows only what a phone in your pocket generates regardless. Try one of the examples for a fuller register."));
    }

    KINDS.forEach(function (k) {
      var items = result.records.filter(function (x) { return x.kind === k.id; });
      if (!items.length) return;

      var sec = el("section", "group");
      var head = el("div", "group-head");
      var h = el("h2", k.id === "inferred" ? "infer" : null, k.label);
      head.appendChild(h);
      head.appendChild(el("span", "gloss", items.length + " · " + k.gloss));
      sec.appendChild(head);

      items.forEach(function (rec, idx) {
        sec.appendChild(recordRow(rec, Math.min(idx * 45, 600)));
      });
      out.appendChild(sec);
    });

    out.appendChild(el("p", "reading", READING));

    var un = el("div", "unrecorded");
    un.appendChild(el("div", "head", "Still unrecorded"));
    UNRECORDED.forEach(function (u) { un.appendChild(el("div", "item", u)); });
    out.appendChild(un);
  }

  /* ---------------- view: one day ---------------- */

  var now = 1440;
  var playing = false;
  var timer = null;

  var scrub = $("scrub");
  var playBtn = $("play");
  var chart = $("day-chart");

  var cumulative = (function () {
    var acc = 0;
    return DAY.map(function (m) {
      acc += m.records.reduce(function (s, x) { return s + x.n; }, 0);
      return { t: m.t, v: acc };
    });
  })();
  var maxV = cumulative[cumulative.length - 1].v;

  scrub.addEventListener("input", function () {
    stop();
    now = Number(scrub.value);
    renderDay();
  });

  playBtn.addEventListener("click", function () {
    if (playing) { stop(); renderDay(); return; }
    if (now >= 1440) now = 0;
    playing = true;
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      now = Math.min(1440, now + 8);
      scrub.value = now;
      renderDay();
      if (now >= 1440) stop();
    }, 40);
  });

  $("skip").addEventListener("click", function () {
    stop();
    now = 1440;
    scrub.value = 1440;
    renderDay();
  });

  function stop() {
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
    playBtn.textContent = now >= 1440 ? "Replay the day" : "Play the day";
  }

  function renderDay() {
    var past = DAY.filter(function (m) { return m.t <= now; });
    var all = past.reduce(function (a, m) { return a.concat(m.records); }, []);

    var emitted = all.filter(function (x) { return x.kind === "emitted"; })
                     .reduce(function (s, x) { return s + x.n; }, 0);
    var relational = all.filter(function (x) { return x.kind === "relational"; })
                        .reduce(function (s, x) { return s + x.n; }, 0);
    var conclusions = all.filter(function (x) { return x.kind === "inferred"; }).length;
    var total = emitted + relational + conclusions;

    var hh = String(Math.floor(now / 60) % 24);
    var mm = String(now % 60);
    var clock = (hh.length < 2 ? "0" + hh : hh) + ":" + (mm.length < 2 ? "0" + mm : mm);

    $("day-headline").textContent =
      "By " + clock + " you have generated " + fmt(total) + " records without doing anything unusual.";

    var split = $("day-split");
    split.innerHTML = "";
    split.appendChild(document.createTextNode(
      fmt(emitted) + " you emitted · " + fmt(relational) + " are about other people · "));
    split.appendChild(el("span", "concl", conclusions + " are conclusions nobody asked you to confirm"));

    drawChart(past);
    drawFeed(past);
    drawProfile(emitted + relational);
  }

  function drawChart(past) {
    var NS = "http://www.w3.org/2000/svg";
    chart.innerHTML = "";

    var base = document.createElementNS(NS, "line");
    base.setAttribute("x1", 0); base.setAttribute("y1", 30);
    base.setAttribute("x2", 100); base.setAttribute("y2", 30);
    base.setAttribute("stroke", "#B4B8B0"); base.setAttribute("stroke-width", "0.4");
    chart.appendChild(base);

    var visible = cumulative.filter(function (p) { return p.t <= now; });
    if (visible.length > 1) {
      var d = visible.map(function (p, k) {
        return (k ? "L" : "M") + (p.t / 1440) * 100 + "," + (30 - (p.v / maxV) * 30);
      }).join(" ");
      var line = document.createElementNS(NS, "path");
      line.setAttribute("d", d);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", "#1A1E1C");
      line.setAttribute("stroke-width", "0.9");
      chart.appendChild(line);
    }

    past.forEach(function (m) {
      if (!m.records.some(function (x) { return x.kind === "inferred"; })) return;
      var tick = document.createElementNS(NS, "line");
      var x = (m.t / 1440) * 100;
      tick.setAttribute("x1", x); tick.setAttribute("y1", 30);
      tick.setAttribute("x2", x); tick.setAttribute("y2", 25);
      tick.setAttribute("stroke", "#C6006F"); tick.setAttribute("stroke-width", "0.7");
      chart.appendChild(tick);
    });
  }

  function drawFeed(past) {
    var feed = $("day-feed");
    feed.innerHTML = "";
    past.slice().reverse().forEach(function (m) {
      var sec = el("section", "moment");
      var head = el("div", "moment-head");
      head.appendChild(el("span", "act", m.act));
      head.appendChild(el("span", "time", m.label));
      sec.appendChild(head);
      m.records.forEach(function (rec) {
        sec.appendChild(recordRow(rec, 0, rec.kind === "inferred" ? "1 concl." : fmt(rec.n)));
      });
      feed.appendChild(sec);
    });
  }

  function drawProfile(records) {
    var box = $("day-profile");
    box.innerHTML = "";
    if (now < 1440) return;

    box.className = "profile";
    box.appendChild(el("h2", null, "What the day concluded about you"));
    box.appendChild(el("p", "lede",
      "Roughly " + fmt(records) + " records, and this is what they were for. None of it was declared. All of it is actionable tomorrow."));

    PROFILE.forEach(function (pair) {
      var c = el("div", "claim");
      c.appendChild(el("div", "what", pair[0]));
      c.appendChild(el("div", "note", pair[1]));
      box.appendChild(c);
    });
  }

  /* ---------------- tabs ---------------- */

  var tabs = document.querySelectorAll(".tab");
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener("click", function () {
      Array.prototype.forEach.call(tabs, function (other) {
        var on = other === t;
        other.setAttribute("aria-selected", on ? "true" : "false");
        $("panel-" + other.dataset.panel).hidden = !on;
      });
    });
  });

  renderDay();
})();
