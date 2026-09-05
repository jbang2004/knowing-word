"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Crown, Flame, Heart, HelpCircle, Pause, Play, RotateCcw, Shield, Sparkles, Swords, Volume2, VolumeX, X, Zap } from "lucide-react";
import { BATTLE_BOSSES, BATTLE_CARDS, createBattleState, selectBattleCard, answerBattleQuestion, cancelBattleCard, advanceBattle, getBossIntent, getCurrentQuestion, type BattleQuestion } from "../lib/card-battle";

const visuals = {
  ember: { icon: Flame, art: "card-ember.webp", label: "烈焰", effect: "22 伤害", flavor: "以一字，燃万千星火", tone: "ember" },
  thunder: { icon: Zap, art: "card-thunder.webp", label: "雷霆", effect: "34 伤害", flavor: "落笔惊雷，破云而来", tone: "thunder" },
  aegis: { icon: Shield, art: "card-aegis.webp", label: "守护", effect: "18 护盾 · 8 伤害", flavor: "月光所至，万物无伤", tone: "aegis" },
  bloom: { icon: Heart, art: "card-bloom.webp", label: "生息", effect: "18 治疗 · 6 伤害", flavor: "枯木逢春，生生不息", tone: "bloom" },
  star: { icon: Sparkles, art: "card-star.webp", label: "星辰", effect: "16 伤害 · 8 治疗", flavor: "星河入梦，字字生辉", tone: "star" },
};
const bossNames = ["墨羽书灵", "月蚀霜龙", "烬日神凰"];
const realms = ["遗忘之森", "月隐冰庭", "烬日天阙"];

export default function CardBattle({ questions, lessonId, lessonTitle, lessons }: {
  questions: BattleQuestion[]; lessonId: string; lessonTitle: string; lessons: { id: string; title: string; position: number }[];
}) {
  const [state, setState] = useState(() => createBattleState(questions));
  const [paused, setPaused] = useState(false);
  const [help, setHelp] = useState(false);
  const [muted, setMuted] = useState(false);
  const [impact, setImpact] = useState(false);
  const [lessonMenu, setLessonMenu] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const spellPanel = useRef<HTMLElement | null>(null);
  const question = getCurrentQuestion(state);
  const boss = BATTLE_BOSSES[state.bossIndex];
  const intent = getBossIntent(state.phase === "result" ? { ...state, turn: state.turn + 1 } : state);
  const selected = BATTLE_CARDS.find(card => card.id === state.selectedCardId);
  const result = state.lastResult;
  const isEnd = ["boss-defeated", "victory", "defeat"].includes(state.phase);
  const overlay = paused || help || lessonMenu || isEnd;

  function sound(kind: "pick" | "hit" | "wrong" | "win") {
    if (muted) return;
    try {
      const context = audio.current ?? new AudioContext(); audio.current = context;
      void context.resume();
      const tones = kind === "wrong" ? [160, 120] : kind === "win" ? [392, 494, 587, 784] : kind === "hit" ? [294, 440, 880] : [523, 784];
      tones.forEach((frequency, i) => {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = kind === "wrong" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime + i * .07);
        gain.gain.setValueAtTime(0, context.currentTime + i * .07);
        gain.gain.linearRampToValueAtTime(.10, context.currentTime + i * .07 + .015);
        gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + i * .07 + .35);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(context.currentTime + i * .07); oscillator.stop(context.currentTime + i * .07 + .4);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Sound is optional when browser audio is unavailable. */ }
  }
  function pick(id: typeof BATTLE_CARDS[number]["id"]) {
    if (overlay || state.phase !== "ready") return;
    sound("pick"); setState(selectBattleCard(state, id));
  }
  function answer(id: string) {
    if (overlay || state.phase !== "question") return;
    const next = answerBattleQuestion(state, id);
    if (next === state) return;
    sound(next.lastResult?.correct ? next.phase === "victory" ? "win" : "hit" : "wrong");
    setImpact(true); setState(next);
  }
  function next() { setImpact(false); setState(advanceBattle(state)); window.scrollTo({ top: 0, behavior: "instant" }); }
  function restart() { setState(createBattleState(questions)); setPaused(false); setImpact(false); window.scrollTo({ top: 0, behavior: "instant" }); sound("pick"); }

  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => {
    if (state.bossIndex >= BATTLE_BOSSES.length - 1) return;
    // Warm the next realm while the player is answering; no blocking transition.
    for (const filename of [`arena-${state.bossIndex + 2}.webp`, `boss-${state.bossIndex + 2}.webp`]) {
      const image = new window.Image(); image.src = `/card-battle/${filename}`;
    }
  }, [state.bossIndex]);
  useEffect(() => {
    if (state.phase !== "question") return;
    const timer = setTimeout(() => spellPanel.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }), 100);
    return () => clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => {
    const onHide = () => { if (document.hidden) setPaused(true); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);
  useEffect(() => {
    if (!impact) return;
    const timer = setTimeout(() => setImpact(false), 850);
    return () => clearTimeout(timer);
  }, [impact]);
  useEffect(() => {
    if (!overlay) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const element = modalRef.current;
    const focusables = () => element?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], select, [tabindex="0"]');
    focusables()?.[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isEnd) { setPaused(false); setHelp(false); setLessonMenu(false); }
      if (event.key !== "Tab") return;
      const nodes = focusables(); if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); previousFocus.current?.focus(); };
  }, [overlay, isEnd]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (overlay || event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement) return;
      if (event.key === "Escape") { setPaused(true); return; }
      const index = "12345".indexOf(event.key);
      if (index >= 0) {
        if (state.phase === "ready" && BATTLE_CARDS[index]) pick(BATTLE_CARDS[index].id);
        if (state.phase === "question" && question?.options[index]) answer(question.options[index].id);
      }
      if (event.key === "Enter" && state.phase === "result") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return <main className={`cb-game cb-realm-${state.bossIndex} ${paused ? "cb-paused" : ""} ${impact ? result?.correct ? "cb-hit" : "cb-hurt" : ""}`} data-phase={state.phase}>
    <div key={state.bossIndex} className="cb-world" style={{ backgroundImage: `url('/card-battle/${state.bossIndex === 0 ? "arena" : `arena-${state.bossIndex + 1}`}.webp')` }} aria-hidden="true" />
    <div className="cb-vignette" aria-hidden="true" />
    {impact && result?.correct && <div className={`cb-cast-effect ${result.cardId}`} aria-hidden="true"><i className="cb-cast-comet" /><i className="cb-cast-ring" />{Array.from({ length: 8 }, (_, i) => <b key={i} style={{ "--spark": i } as CSSProperties} />)}</div>}
    <div className="cb-motes" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>
    <header className="cb-header">
      <Link href="/practice" className="cb-back"><ArrowLeft size={18} /><span>返回练习</span></Link>
      <div className="cb-brand"><span className="cb-brand-sigil">字</span><div><h1>字灵秘境</h1><small>THE REALM OF GLYPHS</small></div></div>
      <div className="cb-controls">
        <button onClick={() => setMuted(!muted)} aria-label={muted ? "开启音效" : "关闭音效"}>{muted ? <VolumeX /> : <Volume2 />}</button>
        <button onClick={() => setHelp(true)} aria-label="玩法说明"><HelpCircle /></button>
        <button onClick={() => setPaused(true)} aria-label="暂停游戏"><Pause /></button>
      </div>
    </header>
    <div className="cb-topline">
      <button className="cb-lesson" onClick={() => setLessonMenu(true)}><BookOpen size={16} /><span>《{lessonTitle}》</span><small>切换课文</small></button>
      <nav className="cb-journey" aria-label="秘境进度">{realms.map((name, i) => <span className={i === state.bossIndex ? "active" : i < state.bossIndex ? "complete" : ""} key={name}><i>{i < state.bossIndex ? <Check size={12} /> : `0${i + 1}`}</i><span>{name}</span>{i < 2 && <ChevronRight size={13} />}</span>)}</nav>
      <span className="cb-round">ROUND <b>{String(state.turn).padStart(2, "0")}</b></span>
    </div>
    <section className="cb-arena" aria-label="卡牌战场">
      <aside className="cb-quest"><span className="cb-eyebrow">秘境试炼 · {state.bossIndex + 1} / 3</span><h2>{realms[state.bossIndex]}</h2><p>唤醒文字的力量<br />净化被遗忘的守关者</p><div className="cb-quest-line" /><span className="cb-objective"><Swords size={16} />击败{bossNames[state.bossIndex]}</span><div className="cb-combo"><Sparkles size={18} /><strong>{state.combo}</strong><span>连击<small>{state.combo ? `法术伤害 +${Math.min(state.combo * 4, 12)}` : "连续答对，强化法术"}</small></span></div></aside>
      <div className={`cb-boss-wrap cb-boss-${state.bossIndex}`}>
        <div className="cb-boss-title"><span>秘 境 守 关 者</span><h2>{bossNames[state.bossIndex]}</h2></div>
        <div className="cb-boss-health"><div role="meter" aria-label="Boss生命" aria-valuemin={0} aria-valuemax={boss.maxHp} aria-valuenow={state.bossHp}><i style={{ width: `${state.bossHp / boss.maxHp * 100}%` }} /></div><span>{state.bossHp} <small>/ {boss.maxHp}</small></span></div>
        <div className="cb-portrait"><div className="cb-portrait-inner" style={{ backgroundImage: `url('/card-battle/boss-${state.bossIndex + 1}.webp')` }} /><div className="cb-portrait-trim" /><span className="cb-boss-gem"><Crown size={20} /></span>{impact && result?.correct && <span className="cb-damage">−{result.damageDealt}</span>}</div>
        <div className="cb-boss-shadow" />
        <div className={`cb-intent ${intent.damage === 0 ? "charging" : ""}`}><Swords size={16} /><span>下次行动：{intent.name}</span><b>{intent.damage === 0 ? "蓄力" : `${intent.damage} 伤害`}</b></div>
      </div>
      <aside className="cb-log"><span className="cb-eyebrow">战斗纪事</span><p>{state.answeredQuestions === 0 ? "古老的书页在风中低语。选一张卡牌，唤醒你的第一道法术。" : result ? result.correct ? `${selected?.name ?? "法术"}命中守关者，造成 ${result.damageDealt} 点伤害。` : "法术暂未唤醒。记住这次的答案，下一回合再出发。" : "新的回合开始。观察守关者的意图，选择你的法术。"}</p><span className="cb-log-count">已唤醒 <b>{state.correctAnswers}</b> 道法术</span><div className="cb-deck-mini" aria-hidden="true"><i /><i /><i /><span>字</span></div><span className="cb-deck-label">知识法典 · {questions.length} 题</span></aside>
      <div className="cb-rune-floor" aria-hidden="true"><i /><span>文 · 字 · 有 · 灵</span></div>
    </section>
    <section ref={spellPanel} className={`cb-spell-panel ${state.phase === "question" || state.phase === "result" ? "is-question" : ""}`} aria-label="法术与题目">
      {state.phase === "ready" && <div className="cb-ready"><span className="cb-small-rule" /><Sparkles size={18} /><div><h2>你的回合 · 选择一张法术牌</h2><p>答对一道题，唤醒卡牌的力量</p></div><span className="cb-small-rule" /></div>}
      {(state.phase === "question" || state.phase === "result") && question && <div className="cb-question" key={question.id}>
        <div className="cb-question-top"><span><Sparkles size={15} />正在唤醒 · {selected?.name}</span><small>《{lessonTitle}》 · 课内练习</small>{state.phase === "question" && <button className="cb-repick" onClick={() => setState(cancelBattleCard(state))}>换张牌</button>}</div>
        <h2>{question.prompt}</h2>
        <div className="cb-options">{question.options.map((option, i) => <button key={option.id} disabled={state.phase !== "question"} onClick={() => answer(option.id)} className={state.phase === "result" ? option.id === result?.correctOptionId ? "correct" : option.id === result?.optionId ? "wrong" : "" : ""}><span>{String.fromCharCode(65 + i)}</span>{option.text}{state.phase === "result" && option.id === result?.correctOptionId && <Check size={17} />}</button>)}</div>
        {state.phase === "result" && result && <div className={`cb-answer-result ${result.correct ? "correct" : "wrong"}`} role="status"><div><strong>{result.correct ? `法术生效！造成 ${result.damageDealt} 伤害` : "没关系，记住这次的答案"}</strong><p>{question.explanation}</p><small>{result.blocked > 0 && `护盾抵挡 ${result.blocked} · `}{result.healed > 0 && `恢复 ${result.healed} 生命 · `}守关者反击 {result.damageTaken} 伤害</small></div><button className="cb-primary" onClick={next}>下一回合 <ArrowRight size={16} /></button></div>}
      </div>}
    </section>
    <section className="cb-hand-zone" aria-label="法术手牌">
      <div className={`cb-player ${impact && result?.shieldGained ? "cb-shield-gain" : ""} ${impact && result?.healed ? "cb-heal-gain" : ""}`}><div className="cb-player-emblem" role="img" aria-label="手持灵笔的见习唤字师" /><div><span>见习唤字师</span><div className="cb-player-meter"><Heart size={15} /><b>{state.playerHp}<small> / {state.playerMaxHp}</small></b></div><div className="cb-player-hp"><i style={{ width: `${state.playerHp}%` }} /></div><small className="cb-shield"><Shield size={12} /> 护盾 {state.shield}</small></div></div>
      <span className="cb-swipe-hint">左右滑动查看 5 张手牌 ↔</span><div className="cb-hand">{BATTLE_CARDS.map((card, i) => {
        const visual = visuals[card.id]; const Icon = visual.icon; const cooldown = Math.max(0, (state.cooldowns[card.id] ?? 0) - (state.phase === "result" ? 1 : 0));
        return <button key={card.id} onClick={() => pick(card.id)} disabled={state.phase !== "ready" || cooldown > 0 || overlay} aria-label={`${card.name}，${visual.effect}${cooldown ? `，冷却${cooldown}回合` : ""}`} className={`cb-card ${visual.tone} ${state.selectedCardId === card.id ? "selected" : ""}`} style={{ "--card-index": i } as CSSProperties}>
          <div className="cb-card-border" /><span className="cb-card-cost"><Icon size={19} /></span><span className="cb-card-school">{visual.label}</span><div className="cb-card-art" style={{ backgroundImage: `url('/card-battle/${visual.art}')` }} /><span className="cb-card-name">{card.name}</span><span className="cb-card-text"><strong>{visual.effect}</strong><small>{visual.flavor}</small></span><span className="cb-card-bottom">{cooldown ? `冷却 ${cooldown} 回合` : card.id === "thunder" ? "冷却 2 回合" : card.id === "bloom" ? "冷却 1 回合" : "每回合可用"}</span><kbd>{i + 1}</kbd>{cooldown > 0 && <span className="cb-cooldown"><RotateCcw size={22} />{cooldown} 回合</span>}
        </button>;
      })}</div>
      <div className="cb-hand-tip"><span className="cb-turn-orb"><Sparkles size={24} /></span><strong>{state.phase === "ready" ? "轮到你了" : "文字即法术"}</strong><small>每回合施放一张牌</small></div>
    </section>
    <footer className="cb-footer"><span>知字 · 卡牌冒险</span><span>选择卡牌 → 回答问题 → 释放法术</span><span>1–5 选择 · Enter 继续</span></footer>
    {overlay && <div className="cb-overlay"><section ref={modalRef} className={`cb-modal ${state.phase === "victory" ? "cb-victory-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cb-modal-title">
      {!isEnd && <button className="cb-modal-close" aria-label="关闭" onClick={() => { setPaused(false); setHelp(false); setLessonMenu(false); }}><X /></button>}
      {help ? <><span className="cb-modal-emblem"><BookOpen /></span><span className="cb-eyebrow">唤字师手札</span><h2 id="cb-modal-title">让知识成为你的法术</h2><div className="cb-rules"><p><b>01 · 观察意图</b>守关者会预告伤害。蓄力时放心进攻，重击前用结界保护自己。</p><p><b>02 · 选牌答题</b>选一张牌，再回答课内原题。答对施法；答错不施法，反击额外增加 6 点伤害。</p><p><b>03 · 搭配取胜</b>连续答对每次增加 4 点伤害，最多 12 点。雷霆与治疗有冷却，合理搭配五张牌。</p><p><b>04 · 穿越秘境</b>击败三位守关者即获胜，每过一关恢复 24 生命。战斗不会替代课程过关记录。</p></div><button className="cb-primary" onClick={() => setHelp(false)}>我准备好了 <Sparkles size={16} /></button></> : lessonMenu ? <><span className="cb-eyebrow">选择你的知识法典</span><h2 id="cb-modal-title">从哪一课开始冒险？</h2><p>切换课文会开启一场新冒险。</p><div className="cb-lesson-list">{lessons.map(lesson => <Link aria-current={lesson.id === lessonId ? "page" : undefined} key={lesson.id} href={`/card-battle?lesson=${lesson.id}`} onClick={() => setLessonMenu(false)}><span>{String(lesson.position).padStart(2, "0")}</span>{lesson.title}{lesson.id === lessonId && <Check size={16} />}</Link>)}</div></> : paused ? <><span className="cb-modal-emblem"><Pause /></span><span className="cb-eyebrow">秘境正在等你</span><h2 id="cb-modal-title">稍作休息</h2><p>调整呼吸，下一道法术就在你的手中。</p><button className="cb-primary" onClick={() => setPaused(false)}><Play size={17} />继续冒险</button><button className="cb-secondary" onClick={restart}><RotateCcw size={16} />重新开始</button><Link className="cb-secondary" href="/practice">返回练习</Link></> : <>{state.phase === "victory" && <div className="cb-victory-seal" aria-hidden="true"><i /><span>觉</span><small>三境已净 · 字灵长明</small></div>}<span className="cb-modal-emblem">{state.phase === "defeat" ? <Heart /> : <Crown />}</span><span className="cb-eyebrow">{state.phase === "victory" ? "三重秘境 · 全部净化" : state.phase === "defeat" ? "每次尝试，都有收获" : "守关者已被净化"}</span><h2 id="cb-modal-title">{state.phase === "victory" ? "字灵觉醒，秘境重生" : state.phase === "defeat" ? "星火未熄，再试一次" : `${bossNames[state.bossIndex]}已苏醒`}</h2><p>本次答对 {state.correctAnswers} / {state.answeredQuestions} 题，唤醒 {state.correctAnswers} 道法术。</p>{question && result && <div className="cb-end-explanation"><strong>{result.correct ? "最后一道法术生效" : "记住这一题，下次一定行"}</strong><p>{question.explanation}</p></div>}<button className="cb-primary" onClick={state.phase === "boss-defeated" ? next : restart}>{state.phase === "boss-defeated" ? "恢复 24 生命 · 前往下一秘境" : "再来一场"}<ArrowRight size={16} /></button><Link href="/practice" className="cb-secondary">返回练习</Link></>}
    </section></div>}
  </main>;
}
