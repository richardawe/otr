import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useSettings } from "../state/settings";
import { getRecord, profileFile } from "../content";
import {
  DAY_END_MINUTES,
  cumulativeSeries,
  formatClock,
  maxCumulativeValue,
  momentsUpTo,
  totalsFor
} from "../lib/day";
import { RecordRow } from "../components/RecordRow";
import { RecordDetail } from "../components/RecordDetail";
import { exportNodeAsPdf, exportNodeAsPng } from "../lib/export";
import type { Record_ } from "../types";

const PLAY_STEP_MINUTES = 8;
const PLAY_INTERVAL_MS = 40;

export function OneDay() {
  const { t } = useI18n();
  const { educatorMode } = useSettings();
  const [now, setNow] = useState(DAY_END_MINUTES);
  const [playing, setPlaying] = useState(false);
  const [openRecord, setOpenRecord] = useState<Record_ | null>(null);
  const scrubId = useId();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setNow((n) => {
        const next = Math.min(DAY_END_MINUTES, n + PLAY_STEP_MINUTES);
        if (next >= DAY_END_MINUTES) setPlaying(false);
        return next;
      });
    }, PLAY_INTERVAL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playing]);

  const past = useMemo(() => momentsUpTo(now), [now]);
  const totals = useMemo(() => totalsFor(past), [past]);
  const visiblePoints = useMemo(() => cumulativeSeries.filter((p) => p.t <= now), [now]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (now >= DAY_END_MINUTES) setNow(0);
    setPlaying(true);
  };

  const chartWidth = 100;
  const chartHeight = 30;
  const pathD = visiblePoints
    .map((p, i) => {
      const x = (p.t / DAY_END_MINUTES) * chartWidth;
      const y = chartHeight - (p.value / maxCumulativeValue) * chartHeight;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <section id="panel-day" role="tabpanel" aria-labelledby="tab-day" tabIndex={-1}>
      <div id="day-export-root">
        <p className="display small" aria-live={playing ? "off" : "polite"} aria-atomic="true">
          {t("oneDay.headline", { time: formatClock(now), total: totals.total.toLocaleString() })}
        </p>
        <p className="split">
          {t("oneDay.splitEmitted", { count: totals.emitted.toLocaleString() })} ·{" "}
          {t("oneDay.splitRelational", { count: totals.relational.toLocaleString() })} ·{" "}
          <span className="concl">
            {t("oneDay.splitInferred", { count: totals.inferred.toLocaleString() })}
          </span>
        </p>

        <svg
          className="day-chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={t("oneDay.chartLabel")}
          style={{ direction: "ltr" }}
        >
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} className="chart-base" />
          {pathD && <path d={pathD} className="chart-line" />}
          {past.map((m) =>
            cumulativeSeries.find((p) => p.t === m.t)?.hasInference ? (
              <line
                key={m.t}
                x1={(m.t / DAY_END_MINUTES) * chartWidth}
                y1={chartHeight}
                x2={(m.t / DAY_END_MINUTES) * chartWidth}
                y2={chartHeight - 5}
                className="chart-tick"
              >
                <title>{t("oneDay.inferenceTickLabel")}</title>
              </line>
            ) : null
          )}
        </svg>
        <div className="axis" dir="ltr">
          <span>{t("oneDay.axisMidnight")}</span>
          <span>{t("oneDay.axisNoon")}</span>
          <span>{t("oneDay.axisMidnight")}</span>
        </div>

        <label htmlFor={scrubId} className="sr-only">
          {t("oneDay.scrubLabel")}
        </label>
        <input
          id={scrubId}
          type="range"
          dir="ltr"
          min={0}
          max={DAY_END_MINUTES}
          value={now}
          onChange={(e) => {
            setPlaying(false);
            setNow(Number(e.target.value));
          }}
          aria-valuetext={formatClock(now)}
        />

        <div className="controls">
          <button type="button" className="btn" onClick={togglePlay}>
            {playing ? t("oneDay.pause") : now >= DAY_END_MINUTES ? t("oneDay.replay") : t("oneDay.play")}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setPlaying(false);
              setNow(DAY_END_MINUTES);
            }}
          >
            {t("oneDay.skipToMidnight")}
          </button>
        </div>

        <h2 className="sr-only">{t("oneDay.feedHeading")}</h2>
        <div id="day-feed">
          {past
            .slice()
            .reverse()
            .map((m) => (
              <section className="moment" key={m.t}>
                <div className="moment-head">
                  <span className="act">{m.act}</span>
                  <span className="time">{formatClock(m.t)}</span>
                </div>
                {educatorMode && m.prompt && (
                  <p className="prompt">
                    <strong>{t("educator.promptHeading")}: </strong>
                    {m.prompt}
                  </p>
                )}
                {m.entries.map((entry) => {
                  const record = getRecord(entry.record);
                  return (
                    <RecordRow
                      key={record.id + m.t}
                      record={record}
                      onOpen={setOpenRecord}
                      count={entry.count}
                      countLabel={
                        record.kind === "inferred" ? "1" : entry.count.toLocaleString()
                      }
                    />
                  );
                })}
              </section>
            ))}
        </div>

        {now >= DAY_END_MINUTES && (
          <div className="profile">
            <h2>{t("oneDay.profileHeading")}</h2>
            <p className="lede">
              {t("oneDay.profileLede", { count: (totals.emitted + totals.relational).toLocaleString() })}
            </p>
            {profileFile.conclusions.map((c) => (
              <button
                type="button"
                className="claim"
                key={c.claim}
                onClick={() => setOpenRecord(getRecord(c.record))}
              >
                <span className="what">{c.claim}</span>
                <span className="note">{c.note}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="controls export-controls">
        <button type="button" className="ghost" onClick={() => exportNodeAsPng("day-export-root", "on-the-record-day.png")}>
          {t("export.asPng")}
        </button>
        <button type="button" className="ghost" onClick={() => exportNodeAsPdf("day-export-root", "on-the-record-day.pdf")}>
          {t("export.asPdf")}
        </button>
      </div>

      {openRecord && <RecordDetail record={openRecord} onClose={() => setOpenRecord(null)} />}
    </section>
  );
}
