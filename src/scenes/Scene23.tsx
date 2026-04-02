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

export const Scene23 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Helper for slideDownPop ----------
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
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

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

  // ---------- Financial sequential animation ----------
  // Target values
  const revenuesTarget = 2_400_000;
  const chargesTarget = 1_680_000;
  const marginTarget = revenuesTarget - chargesTarget; // 720,000
  const marginPercent = (marginTarget / revenuesTarget) * 100; // 30

  // Phases:
  // Phase 0: before 0.7s
  // Phase 1: charges animation from 0.7s to 1.8s (0.7+1.1)
  // Phase 2: revenues animation from 1.8s to 2.9s (1.8+1.1)
  // Phase 3: margin animation from 2.9s to 3.9s (2.9+1.0)
  // After 3.9s, completed.

  let chargesValue = 0;
  let revenuesValue = 0;
  let marginValue = 0;
  let isChargesAnimating = false;
  let isRevenuesAnimating = false;
  let isMarginAnimating = false;
  let isCompleted = false;

  if (time >= 0.7) {
    if (time < 1.8) {
      const progress = (time - 0.7) / 1.1; // 0 to 1
      const eased = 1 - Math.pow(1 - progress, 2); // easeOutQuad
      chargesValue = Math.floor(chargesTarget * eased);
      isChargesAnimating = true;
    } else {
      chargesValue = chargesTarget;
    }
  }

  if (time >= 1.8) {
    if (time < 2.9) {
      const progress = (time - 1.8) / 1.1;
      const eased = 1 - Math.pow(1 - progress, 2);
      revenuesValue = Math.floor(revenuesTarget * eased);
      isRevenuesAnimating = true;
    } else {
      revenuesValue = revenuesTarget;
    }
  }

  if (time >= 2.9) {
    if (time < 3.9) {
      const progress = (time - 2.9) / 1.0;
      const eased = 1 - Math.pow(1 - progress, 2);
      marginValue = Math.floor(marginTarget * eased);
      isMarginAnimating = true;
    } else {
      marginValue = marginTarget;
      isCompleted = true;
    }
  }

  // Flash effects: each row flashes at the moment its animation starts (duration 0.4s)
  const flashDuration = 0.4;
  const chargesFlash = time >= 0.7 && time < 0.7 + flashDuration;
  const revenuesFlash = time >= 1.8 && time < 1.8 + flashDuration;
  const marginFlash = time >= 2.9 && time < 2.9 + flashDuration;

  // Auto badge and calc indicator appear at 0.7s
  const showBadge = time >= 0.7;
  const showIndicator = time >= 0.7;
  const indicatorText = isCompleted ? "Calcul terminé ✓" : "Calcul automatique en cours...";
  const badgeStyle = isCompleted
    ? { background: "rgba(34,197,94,0.2)", borderColor: "#22C55E", color: "#16A34A", content: "✓ Calcul automatique" }
    : { background: "rgba(34,197,94,0.15)", borderColor: "#22C55E", color: "#16A34A", content: "⚡ Calcul auto" };

  // Green pulse dot for indicator
  const dotPulseGreen = pulseValue(time, 1);
  const dotScaleGreen = interpolate(dotPulseGreen, [-1, 1], [1, 1.2]);
  const dotOpacityGreen = interpolate(dotPulseGreen, [-1, 1], [0.5, 0]);

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          width: 1400,
          height: 1400,
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
          gap: 160,
          zIndex: 20,
          padding: "0 240px",
          width: "100%",
          position: "relative",
          backdropFilter: "blur(2px)",
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
              boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
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
                textShadow: "0 2px 5px rgba(37,99,235,0.2)",
              }}
            >
              CHARGES ET MARGES
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              lineHeight: 1.1,
              textAlign: "left",
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 4px 25px rgba(37,99,235,0.2)",
              maxWidth: 2600,
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px) scale(${titleAnim.scale})`,
              filter: `blur(${titleAnim.blur}px)`,
            }}
          >
            Charges enregistrées.<br />
            Marges calculées<br />
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
              automatiquement.
            </span>
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: "0 0 1000px",
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
              borderRadius: 40,
              padding: 60,
              boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: "#2C3E66",
                marginBottom: 40,
                display: "flex",
                alignItems: "center",
                gap: 15,
              }}
            >
              Dossier #2847
              {showBadge && (
                <span
                  style={{
                    fontSize: 24,
                    background: badgeStyle.background,
                    border: `1px solid ${badgeStyle.borderColor}`,
                    borderRadius: 40,
                    padding: "6px 20px",
                    color: badgeStyle.color,
                    fontWeight: 500,
                    letterSpacing: 1,
                    opacity: 1,
                    transition: "opacity 0.3s",
                  }}
                >
                  {badgeStyle.content}
                </span>
              )}
            </div>

            {/* Revenues row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 0",
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                transition: "transform 0.2s, background 0.2s",
                ...(revenuesFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📊 Revenus
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  minWidth: 260,
                  textAlign: "right",
                  color: "#16A34A",
                }}
              >
                {revenuesValue.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Charges row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 0",
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                ...(chargesFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📦 Charges
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  minWidth: 260,
                  textAlign: "right",
                  color: "#DC2626",
                }}
              >
                {chargesValue.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Margin row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 0",
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                ...(marginFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📈 Marge nette
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  minWidth: 260,
                  textAlign: "right",
                  color: "#1D4ED8",
                }}
              >
                {marginValue.toLocaleString("fr-FR")} FCFA ({marginPercent.toFixed(1)}%)
              </span>
            </div>

            {/* Calc indicator */}
            {showIndicator && (
              <div
                style={{
                  position: "absolute",
                  bottom: 30,
                  right: 30,
                  fontSize: 28,
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 30,
                  padding: "8px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backdropFilter: "blur(4px)",
                  opacity: 1,
                  transition: "opacity 0.3s",
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    background: "#22C55E",
                    borderRadius: "50%",
                    display: "inline-block",
                    transform: `scale(${dotScaleGreen})`,
                    opacity: dotOpacityGreen,
                  }}
                />
                {indicatorText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};