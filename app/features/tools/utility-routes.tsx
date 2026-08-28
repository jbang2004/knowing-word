"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  LogOut,
  Mic2,
  MoonStar,
  RotateCcw,
  SunMedium,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { grade5Lessons } from "../../data/generated/grade5-volume1/course";
import { totalReadSessions } from "../../domain/learning-day";
import { isLessonLearningComplete } from "../../domain/learning-plan";
import {
  applyReadingAssessment,
  canAssessReading,
  minimumReadingDurationMs,
} from "../../domain/reading-assessment";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { playLearningSound } from "../../infrastructure/browser/learning-audio";
import { speak } from "../../infrastructure/browser/speech";
import { trackIds, withPreferenceUpdate } from "../../lib/profile-model";
import type { CapturedAudio, VoiceRecorder } from "../../platform/contracts";
import { createBrowserVoiceRecorder } from "../../platform/web/browser-recorder";
import { webRecordingsClient } from "../../platform/web";
import { useStudyProfile } from "../profile/use-study-profile";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";

export function AccountRoute() {
  const { profile, setProfile, identity, syncState, resetProfile } = useStudyProfile();
  const totalCompleted = trackIds.reduce((sum, track) => sum + profile.completed[track].length, 0);

  async function clearProgress() {
    if (!window.confirm("清除你的学习足迹吗？课程内容不会受影响。")) return;
    await resetProfile();
  }

  return (
    <LearningPageShell active="profile" name={profile.name}>
      <div className="page profile-page">
        <PageHeading
          density="utility"
          kicker="我的账户"
          title="这是属于你的学习空间"
          copy={syncState === "synced" ? "学习进度已经安全同步，换设备后也能从上次的位置继续。" : "当前处于离线模式，恢复网络后会自动同步。"}
        />
        {/* An anonymous device has no account to show, and repeating the same
            name above the field that sets it made the page look like it asked
            twice. The signed-in case still needs its own row. */}
        {identity?.mode === "workspace" && (
          <section className="account-identity-card">
            <div><span>已登录账户</span><strong>{identity.email ?? identity.displayName}</strong></div>
            <i className={syncState === "synced" ? "is-synced" : ""}>{syncState === "synced" ? "● 已同步" : "○ 离线"}</i>
          </section>
        )}
        <section className="profile-card">
          <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : "学"}</div>
          <div>
            {identity?.mode !== "workspace" && (
              <i className={`profile-sync${syncState === "synced" ? " is-synced" : ""}`}>
                {syncState === "synced" ? "● 学习记录已同步" : "○ 离线，联网后自动同步"}
              </i>
            )}
            <label>学习小名<input value={profile.name} onChange={(event) => setProfile((value) => withPreferenceUpdate(value, "name", event.target.value))} placeholder="给自己取一个名字" maxLength={18} /></label>
            <label>孩子年级
              <select value={profile.grade} onChange={(event) => setProfile((value) => withPreferenceUpdate(value, "grade", Number(event.target.value)))}>
                {[1, 2, 3, 4, 5, 6].map((grade) => <option value={grade} key={grade}>{grade} 年级</option>)}
              </select>
            </label>
            <p>已完成 {totalCompleted} 个学习关卡 · 认识 {profile.learnedComponents.length} 个部件</p>
          </div>
        </section>
        <div className="profile-actions">
          <Link className="account-records" href="/records">
            <ChartNoAxesColumnIncreasing aria-hidden="true" />学习记录与错题重练
          </Link>
          <button onClick={() => setProfile((value) => withPreferenceUpdate(value, "theme", value.theme === "light" ? "night" : "light"))}>
            {profile.theme === "light" ? <MoonStar aria-hidden="true" /> : <SunMedium aria-hidden="true" />}
            {profile.theme === "light" ? "切换夜读模式" : "切换日间模式"}
          </button>
          <button className="is-danger" onClick={clearProgress}><RotateCcw aria-hidden="true" />清除学习记录</button>
          {identity?.mode === "workspace" && <Link className="account-signout" href="/signout-with-chatgpt?return_to=%2F"><LogOut aria-hidden="true" />退出登录</Link>}
        </div>
      </div>
    </LearningPageShell>
  );
}

export function ReadAloudRoute({
  returnTo = "/account",
  initialLessonId,
}: {
  returnTo?: string;
  initialLessonId?: string;
}) {
  const router = useRouter();
  const { profile, setProfile } = useStudyProfile();
  const [lessonId, setLessonId] = useState<string>(() => grade5Lessons.some((item) => item.id === initialLessonId) ? initialLessonId! : grade5Lessons[0].id);
  const [activeText, setActiveText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "saving" | "saved" | "local">("idle");
  const [readingAssessment, setReadingAssessment] = useState<"accurate" | "needs-practice" | null>(null);
  const [recordingListenedToEnd, setRecordingListenedToEnd] = useState(false);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const localCaptureRef = useRef<CapturedAudio | null>(null);
  const lesson = grade5Lessons.find((item) => item.id === lessonId) ?? grade5Lessons[0];
  const lessonIndex = grade5Lessons.findIndex((item) => item.id === lesson.id);

  useEffect(() => () => {
    recorderRef.current?.dispose();
    localCaptureRef.current?.release();
  }, []);

  useEffect(() => {
    let active = true;
    void webRecordingsClient.latestForLesson(lessonId)
      .then((latest) => {
        if (!active) return;
        setRecordingUrl(latest?.url ?? null);
        setRecordingStatus(latest ? "saved" : "idle");
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [lessonId]);

  function play(text: string) {
    setActiveText(text);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }

  function selectLesson(nextLessonId: string) {
    if (!grade5Lessons.some((item) => item.id === nextLessonId)) return;
    setLessonId(nextLessonId);
    setActiveText("");
    setSpeaking(false);
    localCaptureRef.current?.release();
    localCaptureRef.current = null;
    setRecordingUrl(null);
    setRecordingStatus("idle");
    setReadingAssessment(null);
    setRecordingListenedToEnd(false);
    setRecordingDurationMs(0);
    const query = new URLSearchParams({ lessonId: nextLessonId });
    if (returnTo) query.set("returnTo", returnTo);
    router.replace(`/read-aloud?${query}`, { scroll: false });
  }

  function recordReadingAssessment(accuracy: "accurate" | "needs-practice") {
    const now = new Date().toISOString();
    queueLearningEvent({
      action: "read",
      lessonId,
      readingAccuracy: accuracy,
      latencyMs: recordingDurationMs,
    });
    if (accuracy === "accurate" && !profile.readLessons.includes(lessonId) && isLessonLearningComplete(profile, lessonId)) {
      playLearningSound("dailyComplete");
    }
    setProfile((previous) => applyReadingAssessment(previous, lessonId, accuracy, now));
    setReadingAssessment(accuracy);
  }

  async function toggleRecording() {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      return;
    }
    try {
      setReadingAssessment(null);
      setRecordingListenedToEnd(false);
      setRecordingDurationMs(0);
      const recorder = recorderRef.current ?? createBrowserVoiceRecorder();
      recorderRef.current = recorder;
      await recorder.start(async (capture) => {
        localCaptureRef.current?.release();
        localCaptureRef.current = capture;
        setRecordingDurationMs(capture.durationMs);
        setRecordingUrl(capture.localUrl);
        setRecordingStatus("saving");
        setRecording(false);
        try {
          const saved = await webRecordingsClient.upload(
            lesson.id,
            capture.body,
            capture.contentType,
          );
          capture.release();
          if (localCaptureRef.current === capture) localCaptureRef.current = null;
          setRecordingUrl(saved.url);
          setRecordingStatus("saved");
        } catch {
          setRecordingStatus("local");
        }
      });
      setRecording(true);
    } catch {
      window.alert("麦克风没有开启。你也可以先使用“范读”跟读。");
    }
  }

  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className="page read-page">
        <PageHeading density="utility" kicker="日日朗读" title="先听一遍，再把句子读出来" copy={`已完成 ${totalReadSessions(profile.daily)} 次朗读练习。登录状态下，录音可跨设备回听，每课保留最近 3 次。`} backHref={returnTo} />
        <div className="read-lesson-picker">
          <button disabled={lessonIndex <= 0} aria-label="上一课" onClick={() => selectLesson(grade5Lessons[lessonIndex - 1]?.id)}><ChevronLeft aria-hidden="true" /></button>
          <label>
            <span>选择朗读课次</span>
            <select value={lesson.id} onChange={(event) => selectLesson(event.target.value)}>
              {grade5Lessons.map((item) => <option value={item.id} key={item.id}>第 {item.position} 课 · {item.title}</option>)}
            </select>
          </label>
          <span className="read-lesson-position">{lessonIndex + 1} / {grade5Lessons.length}</span>
          <button disabled={lessonIndex >= grade5Lessons.length - 1} aria-label="下一课" onClick={() => selectLesson(grade5Lessons[lessonIndex + 1]?.id)}><ChevronRight aria-hidden="true" /></button>
        </div>
        <section className="read-studio">
          <div className="read-mascot">读</div>
          <div><p className="kicker">跟读小任务</p><h2>{lesson.title}</h2><p>先听范读，再按下录音键读一遍。</p></div>
          <button className={`game-button ${recording ? "recording" : "primary"}`} onClick={toggleRecording}>
            {recording ? <><CircleStop aria-hidden="true" />结束录音</> : <><Mic2 aria-hidden="true" />开始录音</>}
          </button>
        </section>
        <div className="sentence-list">
          <article className={activeText === lesson.context ? "is-speaking" : ""}>
            <p>“{lesson.context}”</p>
            <button onClick={() => play(lesson.context)}><Volume2 aria-hidden="true" />{speaking && activeText === lesson.context ? "正在范读…" : "范读"}</button>
          </article>
        </div>
        {recordingUrl && (
          <section className="recording-result">
            <span><CheckCircle2 aria-hidden="true" /></span>
            <div>
              <strong>{recordingStatus === "saving" ? "正在保存录音…" : readingAssessment === "accurate" ? "朗读自查已记录" : readingAssessment === "needs-practice" ? "已经找到需要重读的地方" : "先回听，再判断是否读准"}</strong>
              <p>{readingAssessment === "accurate"
                ? "这是回听后的自评记录；先保持读准，再比较是否更流利。"
                : readingAssessment === "needs-practice"
                  ? "回到范读听清读错的字，再录一次，不追求速度。"
                  : recordingStatus === "saved"
                    ? "录音已安全同步。只有确认读准后，才会完成本课朗读。"
                    : recordingStatus === "local"
                      ? "当前网络不可用，录音暂存在本页；仍可以回听自查。"
                      : "完整听一遍自己的录音。"}</p>
            </div>
            <audio
              controls
              src={recordingUrl}
              onPlay={() => setRecordingListenedToEnd(false)}
              onEnded={() => setRecordingListenedToEnd(true)}
            />
            {!readingAssessment && recordingStatus !== "saving" && !canAssessReading(
              lesson.context,
              recordingDurationMs,
              recordingListenedToEnd,
            ) && (
              <p className="recording-check-gate" role="status">
                {recordingDurationMs < minimumReadingDurationMs(lesson.context)
                  ? "这段录音太短，可能没有读完整；请重新录完全文。"
                  : "请先完整回听录音，再判断每个字是否读准。"}
              </p>
            )}
            {!readingAssessment && recordingStatus !== "saving" && canAssessReading(
              lesson.context,
              recordingDurationMs,
              recordingListenedToEnd,
            ) && (
              <div className="recording-assessment" aria-label="朗读准确性自查">
                <button className="game-button primary" onClick={() => recordReadingAssessment("accurate")}>我回听后自评：每个字都读准了</button>
                <button className="game-button ghost" onClick={() => recordReadingAssessment("needs-practice")}>有字读错，再练一次</button>
              </div>
            )}
          </section>
        )}
      </div>
    </LearningPageShell>
  );
}
