"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export function WritingPad({
  character,
  guided,
  revealAnswer,
  retrying,
  canvasLabel,
  onWrite,
  onClear,
}: {
  character: string;
  guided: boolean;
  revealAnswer: boolean;
  retrying: boolean;
  canvasLabel: string;
  onWrite: () => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeLengthRef = useRef(0);
  const acceptedRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.scale(ratio, ratio);
      context.strokeStyle = "#263b64";
      context.lineWidth = 5;
      context.lineCap = "round";
      context.lineJoin = "round";
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (revealAnswer) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    drawingRef.current = true;
    lastPointRef.current = point;
    strokeLengthRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    const previous = lastPointRef.current;
    if (previous) {
      strokeLengthRef.current += Math.hypot(point.x - previous.x, point.y - previous.y);
    }
    lastPointRef.current = point;
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stop() {
    if (drawingRef.current && strokeLengthRef.current >= 7) {
      setStrokeCount((count) => count + 1);
      // A meaningful stroke enables comparison with the model character. It
      // never marks the answer correct; the explicit self-assessment does.
      if (!acceptedRef.current) {
        acceptedRef.current = true;
        onWrite();
      }
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
    acceptedRef.current = false;
    setStrokeCount(0);
    onClear();
  }

  return (
    <div className={`writing-board${guided ? "" : " is-unguided"}${revealAnswer ? " is-answer-revealed" : ""}`}>
      {(guided || revealAnswer) && <div className="writing-guide" aria-hidden="true">{character}</div>}
      <canvas
        ref={canvasRef}
        aria-label={canvasLabel}
        aria-disabled={revealAnswer}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      />
      <div className="writing-footer">
        <span className={strokeCount ? "writing-status has-ink" : "writing-status"}>
          {revealAnswer
            ? "规范字已显示：请逐部件对照是否漏笔、错位"
            : strokeCount
              ? `已记录 ${strokeCount} 笔，继续把字写完整`
              : retrying
                ? "范字已隐藏并清空：根据刚才发现的问题重新写完整"
                : guided
                  ? "沿着浅色字形认真描写，轻点一下不会算作完成"
                  : "空白书写：写完后再显示范字对照"}
        </span>
        {!revealAnswer && <button onClick={clear}>重新写</button>}
      </div>
    </div>
  );
}
