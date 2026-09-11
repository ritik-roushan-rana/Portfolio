"use client";

import { useEffect, useState } from "react";
import Mark from "./Mark";

/**
 * Minimal fixed header: wordmark on the left, a live local clock on the right.
 *
 * It retracts on scroll down and returns on scroll up, so it is present when
 * you reach for it and gone while reading. It is plain white with a text
 * shadow; the hero painting carries a light scrim under it so it reads over
 * the sky as well as over the dark ground.
 *
 * The wordmark carries the site's network mark (components/site/Mark.jsx) as
 * its logo.
 *
 * The clock renders empty on the server and fills in after mount — the time is
 * the visitor's, so any server-rendered value would be a hydration mismatch.
 */
export default function TopBar({ mark, location }) {
  const [hidden, setHidden] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    let last = window.scrollY;
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const y = window.scrollY;
      // The 80px floor keeps the bar pinned at the top of the page, and the
      // 6px threshold ignores trackpad jitter.
      setHidden(y > 80 && y > last + 6);
      last = y;
    };

    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );

    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={`topbar ${hidden ? "topbar--hidden" : ""}`}>
      <span className="topbar__mark">
        <Mark title="Ritik Roushan Rana" />
        {mark}
      </span>
      <span className="topbar__clock">
        {location}
        {time ? ` — ${time} IST` : ""}
      </span>
    </header>
  );
}
