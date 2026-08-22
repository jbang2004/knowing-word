"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  Eye,
  Layers3,
  PenLine,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import styles from "./literacy-lab.module.css";

type FamilyItem = {
  glyph: string;
  pinyin: string;
  word: string;
  lesson: string;
  semantic: string;
  semanticHint: string;
  image: string;
  tone: "coral" | "jade" | "saffron";
};

const familyItems: FamilyItem[] = [
  {
    glyph: "捡",
    pinyin: "jiǎn",
    word: "捡起",
    lesson: "第 3 课 · 桂花雨",
    semantic: "扌",
    semanticHint: "和手的动作有关",
    image: "/illustrations/mnemonics-v2/g5-u6361.webp",
    tone: "coral",
  },
  {
    glyph: "睑",
    pinyin: "jiǎn",
    word: "眼睑",
    lesson: "第 4 课 · 珍珠鸟",
    semantic: "目",
    semanticHint: "和眼睛有关",
    image: "/illustrations/mnemonics-v2/g5-u7751.webp",
    tone: "jade",
  },
  {
    glyph: "俭",
    pinyin: "jiǎn",
    word: "节俭",
    lesson: "第 11 课 · 牛郎织女（二）",
    semantic: "亻",
    semanticHint: "和人的行为有关",
    image: "/illustrations/mnemonics-v2/g5-u4fed.webp",
    tone: "saffron",
  },
];

const fadeStages = [
  { label: "图字同现", short: "看图认形" },
  { label: "图片淡化", short: "只找部件" },
  { label: "只看汉字", short: "摆脱图片" },
  { label: "无图回忆", short: "主动提取" },
] as const;

export default function LiteracyLabPage() {
  const [activeFamily, setActiveFamily] = useState(0);
  const [familyAnswer, setFamilyAnswer] = useState<string | null>(null);
  const [fadeStage, setFadeStage] = useState(0);
  const [dictationRevealed, setDictationRevealed] = useState(false);

  const active = familyItems[activeFamily];

  function speakWord() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("口哨。吹响口哨。");
    utterance.lang = "zh-CN";
    utterance.rate = 0.72;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span>知</span>
          <div><strong>KNOWING WORD</strong><small>识字方法实验室</small></div>
        </Link>
        <div className={styles.labFlag}><Sparkles aria-hidden="true" /> 实验样板 · 不计入学习进度</div>
        <Link href="/" className={styles.back}><ArrowLeft aria-hidden="true" /> 返回正式课程</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><BookOpenText aria-hidden="true" /> 统编五上 · 识字方法小样</div>
          <h1>图片是桥，<br /><em>不是答案。</em></h1>
          <p>同一批课内字，按构字特点选择不同学习方法；图片逐步淡出，最后回到认读、组字和书写。</p>
          <div className={styles.heroActions}>
            <a href="#family" className={styles.primaryButton}>查看样板 <ArrowRight aria-hidden="true" /></a>
            <span><i>4</i> 个观察步骤</span>
            <span><i>3</i> 种教学样板</span>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroOrbit} />
          <div className={styles.heroCardA}><small>表义</small><strong>扌</strong></div>
          <div className={styles.heroEquation}>+</div>
          <div className={styles.heroCardB}><small>表音</small><strong>佥</strong></div>
          <div className={styles.heroArrow}>→</div>
          <div className={styles.heroResult}><strong>捡</strong><small>jiǎn</small></div>
          <p>先看部件分工<br />再用图片加深记忆</p>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label="实验样板目录">
        <a href="#family"><span>01</span><strong>形声字族</strong><small>从一个声旁迁移</small></a>
        <a href="#fade"><span>02</span><strong>提示衰减</strong><small>图片逐步退出</small></a>
        <a href="#recall"><span>03</span><strong>主动提取</strong><small>无图听词写字</small></a>
      </nav>

      <section className={styles.sampleSection} id="family">
        <div className={styles.sectionHeading}>
          <div><span>样板 01 · 形声字</span><h2>学会一个声旁，带走一组字</h2></div>
          <p>形旁帮助猜意义类别，声旁帮助猜读音。先建立共同规律，再回到每个课文词语。</p>
        </div>

        <div className={styles.familyBoard}>
          <aside className={styles.phoneticCore}>
            <span className={styles.verifiedTag}><Check aria-hidden="true" /> 构字关系已标明</span>
            <small>共同声旁</small>
            <strong>佥</strong>
            <b>提示读音 jiǎn</b>
            <p>右边保持不变，左边换成不同的表义部件，字义类别随之改变。</p>
            <div className={styles.soundWave}><i /><i /><i /><i /><i /></div>
          </aside>

          <div className={styles.familyContent}>
            <div className={styles.familyTabs} role="tablist" aria-label="佥字族例字">
              {familyItems.map((item, index) => (
                <button
                  key={item.glyph}
                  className={activeFamily === index ? styles.activeFamilyTab : ""}
                  onClick={() => setActiveFamily(index)}
                  role="tab"
                  aria-selected={activeFamily === index}
                >
                  <strong>{item.glyph}</strong><span>{item.word}</span><small>{item.lesson}</small>
                </button>
              ))}
            </div>

            <article className={styles.familyDetail}>
              <div className={styles.familyImage}>
                <Image src={active.image} alt={`${active.word}的结构助记图`} fill sizes="(max-width: 760px) 86vw, 360px" />
                <span>可选记忆桥梁</span>
              </div>
              <div className={styles.familyExplanation}>
                <div className={styles.wordMeta}><span>{active.lesson}</span><b>{active.pinyin}</b></div>
                <h3>{active.glyph}<small>{active.word}</small></h3>
                <div className={styles.componentEquation}>
                  <span className={styles.semanticPart}>{active.semantic}<small>表义</small></span>
                  <i>+</i>
                  <span className={styles.phoneticPart}>佥<small>表音</small></span>
                  <i>→</i>
                  <strong>{active.glyph}</strong>
                </div>
                <p><b>{active.semantic}</b>：{active.semanticHint}；<b>佥</b>：提示读音 jiǎn。</p>
                <div className={styles.memoryLabel}><Layers3 aria-hidden="true" /><span><strong>构形助记</strong><small>图片帮助看见部件位置，不是汉字的历史来源。</small></span></div>
              </div>
            </article>

            <div className={styles.miniQuiz}>
              <div><span>马上试一试</span><strong>“眼皮”的“睑”，左边应该换成哪个部件？</strong></div>
              <div className={styles.quizOptions}>
                {["扌", "目", "亻"].map((option) => {
                  const correct = option === "目";
                  const answered = familyAnswer !== null;
                  const className = answered && correct
                    ? styles.correctOption
                    : answered && familyAnswer === option
                      ? styles.wrongOption
                      : "";
                  return <button className={className} key={option} onClick={() => setFamilyAnswer(option)}>{option}{answered && correct ? <Check aria-hidden="true" /> : null}</button>;
                })}
              </div>
              <small>{familyAnswer === null ? "先想意义类别，再选部件。" : familyAnswer === "目" ? "答对了：目和眼睛有关。" : "再想一想：眼睑是眼睛的一部分。"}</small>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.sampleSection} ${styles.fadeSection}`} id="fade">
        <div className={styles.sectionHeading}>
          <div><span>样板 02 · 复杂字</span><h2>只讲可靠结构，不勉强编字源</h2></div>
          <p>“亩”在这里采用部件路线图：记住上下站位和规范字形，不把“亠”包装成虚假的表义故事。</p>
        </div>

        <div className={styles.fadeBoard}>
          <div className={styles.stageRail}>
            {fadeStages.map((stage, index) => (
              <button key={stage.label} className={fadeStage === index ? styles.activeStage : ""} onClick={() => setFadeStage(index)}>
                <span>0{index + 1}</span><div><strong>{stage.label}</strong><small>{stage.short}</small></div>
              </button>
            ))}
          </div>

          <div className={styles.fadeDemo}>
            <div className={styles.demoLabel}><span>结构助记</span><small>不是字源解释</small></div>
            {fadeStage <= 1 && (
              <div className={`${styles.muImage} ${fadeStage === 1 ? styles.isFaded : ""}`}>
                <Image src="/illustrations/mnemonics-v2/g5-u4ea9.webp" alt="亩字的田地结构助记图" fill sizes="(max-width: 760px) 86vw, 520px" />
              </div>
            )}
            {fadeStage === 0 && <div className={styles.muGlyph}><strong>亩</strong><span>mǔ · 半亩</span></div>}
            {fadeStage === 1 && (
              <div className={styles.partOverlay}>
                <span className={styles.topPart}><b>亠</b><small>在上方</small></span>
                <span className={styles.bottomPart}><b>田</b><small>在下方</small></span>
              </div>
            )}
            {fadeStage === 2 && (
              <div className={styles.glyphOnly}>
                <Eye aria-hidden="true" /><strong>亩</strong><span>先看整体，再默想：亠在上，田在下。</span>
              </div>
            )}
            {fadeStage === 3 && (
              <div className={styles.recallOnly}>
                <span>图片和答案都已隐藏</span>
                <p>课文词语：半 <i>□</i> 地</p>
                <div className={styles.blankGrid}><i /><i /></div>
                <button onClick={() => setFadeStage(2)}>写完后核对 <ArrowRight aria-hidden="true" /></button>
              </div>
            )}
          </div>

          <aside className={styles.fadeNotes}>
            <span>本步学习目标</span>
            <h3>{fadeStages[fadeStage].label}</h3>
            <p>{fadeStage === 0
              ? "图片与规范汉字同时出现，先建立意义、读音和字形的连接。"
              : fadeStage === 1
                ? "图片退到背景，只留下上下部件的站位提示。"
                : fadeStage === 2
                  ? "撤掉图片，确认孩子认得规范汉字，而不是只认那幅画。"
                  : "给词语留空，让孩子从语境主动提取并写出目标字。"}</p>
            <div className={styles.truthBox}><Check aria-hidden="true" /><span><strong>信息边界</strong><small>“亠＋田”是现代字形拆分；本样板不把它说成真实造字过程。</small></span></div>
          </aside>
        </div>
      </section>

      <section className={`${styles.sampleSection} ${styles.recallSection}`} id="recall">
        <div className={styles.sectionHeading}>
          <div><span>样板 03 · 提取练习</span><h2>最后一关，不再让图片替孩子作答</h2></div>
          <p>第一次可以描写，随后切换为空白田字格；按词语听写，并安排隔日和隔周复习。</p>
        </div>

        <div className={styles.recallBoard}>
          <article className={styles.dictationCard}>
            <div className={styles.dictationHeader}>
              <div><span>听词写字</span><strong>第 1 课 · 白鹭</strong></div>
              <button onClick={speakWord}><Volume2 aria-hidden="true" /> 播放词语</button>
            </div>
            <div className={styles.dictationPrompt}>
              <p>“他吹了一声口哨。”</p>
              <span>请写出“口哨”的“哨”</span>
            </div>
            <div className={styles.writingArea}>
              <div className={styles.tianGrid}>
                <i /><i />
                {dictationRevealed && <strong>哨</strong>}
              </div>
              <div className={styles.writeActions}>
                <span><PenLine aria-hidden="true" /> {dictationRevealed ? "对照部件和位置自行检查" : "空白田字格 · 没有描红答案"}</span>
                <button onClick={() => setDictationRevealed((value) => !value)}>{dictationRevealed ? "重新默写" : "写完，显示答案"}</button>
              </div>
            </div>
            {dictationRevealed && (
              <div className={styles.answerBreakdown}>
                <span><b>口</b><small>表义：和口、声音有关</small></span>
                <i>+</i>
                <span><b>肖</b><small>表音：提示 shào</small></span>
                <i>→</i><strong>哨</strong>
              </div>
            )}
          </article>

          <aside className={styles.reviewCard}>
            <span className={styles.reviewKicker}>记住一次，不等于真正掌握</span>
            <h3>让“哨”在正确的时间回来</h3>
            <ol>
              <li className={styles.reviewDone}><span><Check aria-hidden="true" /></span><div><strong>现在</strong><small>看结构，完成第一次无图书写</small></div></li>
              <li><span>1</span><div><strong>明天</strong><small>听“口哨”，在空格中写字</small></div></li>
              <li><span>3</span><div><strong>3 天后</strong><small>和“梢、悄”放在一起辨认</small></div></li>
              <li><span>7</span><div><strong>7 天后</strong><small>回到课文句子中再次听写</small></div></li>
            </ol>
            <div className={styles.skillProgress}>
              <div><span>认读</span><i><b style={{ width: "84%" }} /></i></div>
              <div><span>构字</span><i><b style={{ width: "62%" }} /></i></div>
              <div><span>书写</span><i><b style={{ width: "36%" }} /></i></div>
            </div>
          </aside>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><span>知</span><p><strong>实验结论</strong><small>教材定顺序 · 权威资料定解释 · 图片只做记忆桥梁</small></p></div>
        <Link href="/"><ArrowLeft aria-hidden="true" /> 返回正式课程</Link>
      </footer>
    </main>
  );
}
