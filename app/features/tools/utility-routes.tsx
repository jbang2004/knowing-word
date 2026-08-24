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
import { learningDayKey, totalReadSessions } from "../../domain/learning-day";
import { isLessonLearningComplete } from "../../domain/learning-plan";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { playLearningSound } from "../../infrastructure/browser/learning-audio";
import { speak } from "../../infrastructure/browser/speech";
import { trackIds } from "../../lib/profile-model";
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
        <section className="account-identity-card">
          <div><span>{identity?.mode === "workspace" ? "已登录账户" : "本设备学习身份"}</span><strong>{identity?.email ?? identity?.displayName ?? "小探险家"}</strong></div>
          <i className={syncState === "synced" ? "is-synced" : ""}>{syncState === "synced" ? "● 已同步" : "○ 离线"}</i>
        </section>
        <section className="profile-card">
          <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : "学"}</div>
          <div>
            <label>学习小名<input value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} placeholder="给自己取一个名字" maxLength={18} /></label>
            <label>孩子年级
              <select value={profile.grade} onChange={(event) => setProfile((value) => ({ ...value, grade: Number(event.target.value) }))}>
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
          <button onClick={() => setProfile((value) => ({ ...value, theme: value.theme === "light" ? "night" : "light" }))}>
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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lesson = grade5Lessons.find((item) => item.id === lessonId) ?? grade5Lessons[0];
  const lessonIndex = grade5Lessons.findIndex((item) => item.id === lesson.id);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    let active = true;
    void fetch(`/api/recordings?lessonId=${encodeURIComponent(lessonId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ recordings?: { url: string }[] }> : Promise.reject(new Error("recordings unavailable")))
      .then((payload) => {
        if (!active) return;
        setRecordingUrl(payload.recordings?.[0]?.url ?? null);
        setRecordingStatus(payload.recordings?.[0] ? "saved" : "idle");
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
    setRecordingUrl(null);
    setRecordingStatus("idle");
    const query = new URLSearchParams({ lessonId: nextLessonId });
    if (returnTo) query.set("returnTo", returnTo);
    router.replace(`/read-aloud?${query}`, { scroll: false });
  }

  function countReadSession() {
    queueLearningEvent({ action: "read", lessonId });
    if (!profile.readLessons.includes(lessonId) && isLessonLearningComplete(profile, lessonId)) {
      playLearningSound("dailyComplete");
    }
    setProfile((previous) => {
      const date = learningDayKey();
      const day = previous.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        readLessons: previous.readLessons.includes(lessonId)
          ? previous.readLessons
          : [...previous.readLessons, lessonId],
        daily: { ...previous.daily, [date]: { ...day, readSessions: day.readSessions + 1 } },
      };
    });
  }

  async function toggleRecording() {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const preferredType = ["audio/webm;codecs=opus", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        const contentType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: contentType });
        const localUrl = URL.createObjectURL(blob);
        setRecordingUrl(localUrl);
        setRecordingStatus("saving");
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        countReadSession();
        try {
          const response = await fetch(`/api/recordings?lessonId=${encodeURIComponent(lesson.id)}`, {
            method: "POST",
            headers: { "content-type": blob.type || "audio/webm" },
            body: blob,
          });
          if (!response.ok) throw new Error("recording save failed");
          const payload = await response.json() as { recording: { url: string } };
          URL.revokeObjectURL(localUrl);
          setRecordingUrl(payload.recording.url);
          setRecordingStatus("saved");
        } catch {
          setRecordingStatus("local");
        }
      };
      recorder.start();
      setRecording(true);
    } catch {
      window.alert("麦克风没有开启。你也可以先使用“范读”跟读。");
    }
  }

  return (
    <LearningPageShell active="course" name={profile.name}>
      <div className="page read-page">
        <PageHeading density="utility" kicker="日日朗读" title="先听一遍，再把句子读出来" copy={`已完成 ${totalReadSessions(profile.daily)} 次朗读练习。登录状态下，录音可跨设备回听。`} backHref={returnTo} />
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
            <div><strong>{recordingStatus === "saving" ? "正在保存录音…" : "这次朗读已经录好"}</strong><p>{recordingStatus === "saved" ? "录音已安全同步，可以稍后回来继续听。" : recordingStatus === "local" ? "当前网络不可用，录音暂存在本页。" : "你可以在这里回听。"}</p></div>
            <audio controls src={recordingUrl} />
          </section>
        )}
      </div>
    </LearningPageShell>
  );
}
