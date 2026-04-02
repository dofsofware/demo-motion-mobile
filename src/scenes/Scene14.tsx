import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type P = { inFrame: number; outFrame: number; crossfadeFrames: number };

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const loop = (time: number, duration: number) => {
  if (duration <= 0) return 0;
  return (time % duration) / duration;
};

const pulseValue = (time: number, duration: number, phase = 0) =>
  Math.sin(((time + phase) / duration) * Math.PI * 2);

export const Scene14 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  // Crossfade logic
  const tIn = Math.max(0, Math.min(1, frame / crossfadeFrames));
  const tOut = Math.max(0, Math.min(1, (duration - frame) / crossfadeFrames));
  const opacity = Math.min(tIn, tOut);
  const push = interpolate(frame, [0, crossfadeFrames], [8, 0], clamp);
  const outZoom = interpolate(
    frame,
    [duration - crossfadeFrames, duration],
    [1, 1.06],
    clamp
  );

  // ---------- Background elements (same as Scene1) ----------
  const gridOffset = (time / 18) * 140;

  const orb1Progress = pulseValue(time, 22);
  const orb2Progress = pulseValue(time, 26, 3);
  const orb3Progress = pulseValue(time, 18, 1.8);

  const line1Progress = loop(time, 12);
  const line2Progress = loop(time, 14);
  const line1Translate = interpolate(line1Progress, [0, 1], [-30, 40]);
  const line2Translate = interpolate(line2Progress, [0, 1], [40, -50]);
  const line1Opacity = interpolate(
    line1Progress,
    [0, 0.2, 0.8, 1],
    [0, 0.5, 0.5, 0]
  );
  const line2Opacity = interpolate(
    line2Progress,
    [0, 0.2, 0.8, 1],
    [0, 0.4, 0.4, 0]
  );

  const sparks = [
    { top: "20%", left: "15%", size: 10, delay: 0 },
    { top: "65%", left: "85%", size: 6, delay: 0.7 },
    { top: "80%", left: "30%", size: 8, delay: 1.2 },
    { top: "40%", left: "72%", size: 6, delay: 0.3 },
    { top: "15%", left: "88%", size: 6, delay: 1.8 },
  ];

  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  // ---------- Helper for slideDownPop (badge) ----------
  const slideDownPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: -80, scale: 0.85, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.34, 1.3, 0.55, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [-80, 8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [12, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const badgeAnim = slideDownPop(0, 0.7);

  // Badge continuous glow (starts after 0.7s)
  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge (1.6s cycle)
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Title (riseGlow) ----------
  const riseGlow = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: 100, scale: 0.92, blur: 8 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
    });
    const op = interpolate(progress, [0, 0.4, 1], [0, 0.9, 1], clamp);
    const translateY = interpolate(progress, [0, 0.4, 1], [100, -12, 0], clamp);
    const scale = interpolate(progress, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.4, 1], [8, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const titleAnim = riseGlow(0, 0.9);
  // Title text shine (4s cycle)
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  // Word "délais" pulse (2.2s cycle)
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Subtitle (slideUpFade) ----------
  const slideUpFade = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: 70, scale: 0.95, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [70, 0]);
    const scale = interpolate(progress, [0, 1], [0.95, 1]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, scale, blur };
  };
  const subtitleAnim = slideUpFade(0, 0.85);

  // ---------- Right panel (slideRightPop) ----------
  const slideRightPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: 80, scale: 0.95, blur: 10 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [80, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.95, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [10, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const panelAnim = slideRightPop(0, 0.9);

  // ---------- Step cards (stepCardEntry with staggered delays) ----------
  const stepCardEntry = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: 100, scale: 0.88, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.2),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [100, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.88, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [12, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const step1Anim = stepCardEntry(0.1, 0.6);
  const step2Anim = stepCardEntry(0.35, 0.6);
  const step3Anim = stepCardEntry(0.6, 0.6);

  // Icon pulse (2.2s cycle)
  const iconPulse = () => {
    const wave = pulseValue(time, 2.2);
    const scale = interpolate(wave, [-1, 1], [1, 1.05]);
    const shadowScale = interpolate(wave, [-1, 1], [24, 32]);
    return { scale, shadowScale };
  };
  const iconPulseStyle = iconPulse();

  // Progress bar widths: target widths (70%, 90%, 50%) and animation over 1s after card appears
  const progressBarWidth = (delaySec: number, targetWidth: number, durationSec: number = 1) => {
    const start = (delaySec + 0) * fps; // starts when card entrance starts? Actually card entrance ends at delaySec+0.6, but we want to start after card is visible. We'll start at the same time as card entrance starts (delaySec).
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return 0;
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    return targetWidth * progress;
  };
  const width1 = progressBarWidth(0.1, 70);
  const width2 = progressBarWidth(0.35, 90);
  const width3 = progressBarWidth(0.6, 50);

  // Shimmer effect: infinite loop over 1.5s
  const shimmerProgress = loop(time, 1.5);
  const shimmerTranslateX = interpolate(shimmerProgress, [0, 1], [-100, 200]);

  // Counter animations: count from 0 to target over 1s, with a start delay (after card appears)
  const counterValue = (delaySec: number, target: number, durationSec: number = 1) => {
    const start = (delaySec + 0.2) * fps; // slight delay after card appears, matching JS timeout
    const end = (delaySec + 0.2 + durationSec) * fps;
    if (frame < start) return 0;
    if (frame >= end) return target;
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.linear });
    return Math.floor(target * progress);
  };
  const counter1 = counterValue(0.1, 48);
  const counter2 = counterValue(0.35, 24);
  const counter3 = counterValue(0.6, 12);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity,
        transform: `translateY(${push}px) scale(${outZoom})`,
        background:
          "radial-gradient(circle at 50% 30%, #F0F5FF 0%, #F5F9FF 100%)",
        fontFamily: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(30, 58, 138, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.045) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          backgroundPosition: `${gridOffset}px ${gridOffset}px`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.4,
          top: "10%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.2), rgba(37,99,235,0))",
          transform: `translate(${orb1Progress * 40}px, ${
            orb1Progress * 64
          }px) scale(${1 + orb1Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.4,
          bottom: "-20%",
          right: "-15%",
          background:
            "radial-gradient(circle, rgba(15,43,109,0.18), rgba(15,43,109,0))",
          transform: `translate(${orb2Progress * -45}px, ${
            orb2Progress * -72
          }px) scale(${1 + orb2Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          filter: "blur(70px)",
          opacity: 0.4,
          top: "50%",
          left: "70%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.25), rgba(37,99,235,0))",
          transform: `translate(${orb3Progress * 25}px, ${
            orb3Progress * 40
          }px) scale(${1 + orb3Progress * 0.05})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "200%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
          top: "35%",
          left: "-50%",
          transform: `translateX(${line1Translate}%) rotate(8deg)`,
          opacity: line1Opacity,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "180%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
          top: "70%",
          left: "-40%",
          transform: `translateX(${line2Translate}%) rotate(-5deg)`,
          opacity: line2Opacity,
          zIndex: 1,
        }}
      />

      {sparks.map((spark, i) => {
        const sparkProgress = loop(time + spark.delay, 3);
        const sparkOpacity = interpolate(
          sparkProgress,
          [0, 0.3, 0.7, 1],
          [0, 0.7, 0.4, 0]
        );
        const sparkScale = interpolate(
          sparkProgress,
          [0, 0.3, 0.7, 1],
          [0, 1.2, 0.8, 0]
        );
        const bgColor = sparkProgress < 0.3 ? "#60A5FA" : "#3B82F6";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: spark.top,
              left: spark.left,
              width: spark.size,
              height: spark.size,
              borderRadius: "50%",
              background: bgColor,
              opacity: sparkOpacity,
              transform: `scale(${sparkScale})`,
              filter: "blur(1px)",
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.02) 60%, transparent 85%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulseRingScale})`,
          opacity: pulseRingOpacity,
          zIndex: 0,
        }}
      />

      {/* Main content: two columns */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 180,
          zIndex: 20,
          padding: "0 280px",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Left column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 60,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 28,
              background: "rgba(224,237,255,0.75)",
              backdropFilter: "blur(12px)",
              border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
              borderRadius: 120,
              padding: "18px 56px",
              width: "fit-content",
              opacity: badgeAnim.opacity,
              transform: `translateY(${badgeAnim.translateY}px) scale(${badgeAnim.scale})`,
              filter: `blur(${badgeAnim.blur}px)`,
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                background: "#2563EB",
                borderRadius: "50%",
                opacity: dotOpacity,
                boxShadow: `0 0 12px #2563EB, 0 0 0 ${dotShadow}px rgba(37,99,235,0.4)`,
                transform: `scale(${dotScale})`,
              }}
            />
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              DÉLAIS CONFIGURABLES
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 1.1,
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px) scale(${titleAnim.scale})`,
              filter: `blur(${titleAnim.blur}px)`,
            }}
          >
            Maîtrisez vos{" "}
            <span
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: 900,
                transform: `scale(${wordScale})`,
                textShadow: `0 0 ${wordGlow}px rgba(37,99,235,0.6)`,
              }}
            >
              délais
            </span>
            <br />
            étape par étape.
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              color: "#2C3E66",
              lineHeight: 1.2,
              opacity: subtitleAnim.opacity,
              transform: `translateY(${subtitleAnim.translateY}px) scale(${subtitleAnim.scale})`,
              filter: `blur(${subtitleAnim.blur}px)`,
            }}
          >
            Objectifs clairs · Suivi en temps réel · Alerte dépassement
          </div>
        </div>

        {/* Right column: steps container */}
        <div
          style={{
            flex: "0 0 1100px",
            opacity: panelAnim.opacity,
            transform: `translateX(${panelAnim.translateX}px) scale(${panelAnim.scale})`,
            filter: `blur(${panelAnim.blur}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 48,
              padding: 60,
              boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 48,
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 40,
                padding: "36px 44px",
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step1Anim.opacity,
                transform: `translateX(${step1Anim.translateX}px) scale(${step1Anim.scale})`,
                filter: `blur(${step1Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    boxShadow: `0 ${iconPulseStyle.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseStyle.scale})`,
                  }}
                >
                  📋
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, color: "#0F2B6D" }}>Dédouanement</div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: 32,
                  paddingLeft: 112,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Formalités douanières et déblocage des marchandises. Tous les documents, taxes et contrôles.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: 28,
                  padding: "28px 32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: 80, textAlign: "right" }}>{counter1}</span>
                    <span style={{ fontSize: 28, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: 18,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width1}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #1E3A8A, #3B82F6)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 40,
                padding: "36px 44px",
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step2Anim.opacity,
                transform: `translateX(${step2Anim.translateX}px) scale(${step2Anim.scale})`,
                filter: `blur(${step2Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    boxShadow: `0 ${iconPulseStyle.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseStyle.scale})`,
                  }}
                >
                  🚛
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, color: "#0F2B6D" }}>Transport</div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: 32,
                  paddingLeft: 112,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Acheminement physique du point A au point B. Suivi GPS, alertes de progression.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: 28,
                  padding: "28px 32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: 80, textAlign: "right" }}>{counter2}</span>
                    <span style={{ fontSize: 28, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: 18,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width2}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #15803D, #22C55E)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 40,
                padding: "36px 44px",
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step3Anim.opacity,
                transform: `translateX(${step3Anim.translateX}px) scale(${step3Anim.scale})`,
                filter: `blur(${step3Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    boxShadow: `0 ${iconPulseStyle.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseStyle.scale})`,
                  }}
                >
                  🏠
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, color: "#0F2B6D" }}>Livraison</div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: 32,
                  paddingLeft: 112,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Remise au client final, preuve de livraison et satisfaction.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: 28,
                  padding: "28px 32px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: 80, textAlign: "right" }}>{counter3}</span>
                    <span style={{ fontSize: 28, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: 18,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width3}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #C2410C, #F97316)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};