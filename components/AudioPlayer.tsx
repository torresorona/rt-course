"use client";

import { useRef, useState, useEffect } from "react";

export default function AudioPlayer({
  src,
  title,
}: {
  src: string;
  title?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];

  function cycleSpeed() {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    audio.playbackRate = next;
    setSpeed(next);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="not-prose my-6 rounded-2xl border border-sand-200 bg-white p-5">
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <p className="mb-3 text-sm font-semibold text-sand-800">{title}</p>
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-900 text-sand-50 transition-colors hover:bg-sand-800"
        >
          {playing ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>
          )}
        </button>

        {/* Progress */}
        <div className="flex flex-1 items-center gap-3">
          <span className="w-10 text-right text-xs tabular-nums text-sand-500">
            {fmt(currentTime)}
          </span>
          <div
            onClick={seek}
            className="relative h-2 flex-1 cursor-pointer rounded-full bg-sand-100"
          >
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-terracotta-500 transition-[width] duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 text-xs tabular-nums text-sand-500">
            {duration ? fmt(duration) : "--:--"}
          </span>
        </div>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          className="shrink-0 rounded-lg bg-sand-100 px-2 py-1 text-xs font-semibold tabular-nums text-sand-600 transition-colors hover:bg-sand-200"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
