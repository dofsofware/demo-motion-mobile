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

export const Scene15 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background elements (red theme) ----------
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

  // ---------- Badge (slideDownPop + continuous glow) ----------
  const badgeEntrance = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.3, 0.55, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(badgeEntrance, [0, 0.6, 1], [-80, 8, 0], clamp);
  const badgeScale = interpolate(badgeEntrance, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- SVG bell (scalePopSpin + ringBell + rotating/pulsing circles) ----------
  const svgEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const svgOpacity = interpolate(svgEntrance, [0, 0.5, 1], [0, 1, 1], clamp);
  const svgScale = interpolate(svgEntrance, [0, 0.5, 1], [0.2, 1.08, 1], clamp);
  const svgRotate = interpolate(svgEntrance, [0, 0.5, 1], [-120, 3, 0], clamp);
  const svgBlur = interpolate(svgEntrance, [0, 0.5, 1], [10, 0, 0], clamp);

  // ringBell: starts at 1.8s, 1.2s cycle, oscillates between -8 and 12 deg
  const ringBell = () => {
    if (time < 1.8) return 0;
    const wave = pulseValue(time - 1.8, 1.2);
    // map -1 to -8, 1 to 12
    const angle = interpolate(wave, [-1, 1], [-8, 12]);
    return angle;
  };
  const bellRotate = ringBell();

  // Rotating dash circle (6s)
  const dashRotate = (time * 360 / 6) % 360;

  // Pulsing circle: r from 30 to 45, opacity 0.6 to 0, 2s cycle
  const pulseCircleWave = pulseValue(time, 2);
  const pulseCircleR = interpolate(pulseCircleWave, [-1, 1], [30, 45]);
  const pulseCircleOpacity = interpolate(pulseCircleWave, [-1, 1], [0.6, 0]);

  // ---------- Title (riseGlow + textShine + word pulse) ----------
  const titleEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  });
  const titleOpacity = interpolate(titleEntrance, [0, 0.4, 1], [0, 0.9, 1], clamp);
  const titleTranslateY = interpolate(titleEntrance, [0, 0.4, 1], [100, -12, 0], clamp);
  const titleScale = interpolate(titleEntrance, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntrance, [0, 0.4, 1], [8, 0, 0], clamp);

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Timeline section (slideUpFade) ----------
  const timelineEntrance = () => {
    const start = 0.5 * fps;
    const end = (0.5 + 0.8) * fps;
    if (frame < start) return { opacity: 0, translateY: 80, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [80, 0]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, blur };
  };
  const timelineAnim = timelineEntrance();

  // Steps entrance (stepRise) with delays
  const stepRise = (delaySec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + 0.5) * fps;
    if (frame < start) return { opacity: 0, translateY: 40, blur: 4 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [40, 0]);
    const blur = interpolate(progress, [0, 1], [4, 0]);
    return { opacity: op, translateY, blur };
  };

  const step1 = stepRise(0.6);
  const step2 = stepRise(0.75);
  const step3 = stepRise(0.9);
  const step4 = stepRise(1.05);

  // Delayed step (step 3) additional animations
  const shakeWarning = () => {
    // Shake starts at 1.2s, duration 0.5s
    const start = 1.2;
    const end = 1.7;
    if (time < start) return 0;
    if (time >= end) return 0;
    const progress = (time - start) / 0.5;
    // emulate shake: translateX oscillates
    const intensity = interpolate(progress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -8, 8, -4, 4, 0], {
      ...clamp,
      easing: Easing.ease,
    });
    return intensity;
  };
  const shakeX = shakeWarning();

  // pulseRed (infinite, starts at 1.8s)
  const pulseRedWave = pulseValue(time - 1.8, 1.2);
  const pulseRedShadow = interpolate(pulseRedWave, [-1, 1], [0, 16]);
  const pulseRedScale = interpolate(pulseRedWave, [-1, 1], [1, 1.05]); // for icon

  // delay-badge fadeSlideUp (starts at 1.2s)
  const delayBadge = () => {
    const start = 1.2 * fps;
    const end = (1.2 + 0.4) * fps;
    if (frame < start) return { opacity: 0, translateY: 15 };
    if (frame >= end) return { opacity: 1, translateY: 0 };
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.ease });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [15, 0]);
    return { opacity: op, translateY };
  };
  const badgeDelay = delayBadge();

  // ---------- Alert card (slideAlert) ----------
  const alertEntrance = () => {
    const start = 1.4 * fps;
    const end = (1.4 + 0.6) * fps;
    if (frame < start) return { opacity: 0, translateX: 150, scale: 0.9, blur: 8 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.2),
    });
    const op = interpolate(progress, [0, 0.7, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.7, 1], [150, -10, 0], clamp);
    const scale = interpolate(progress, [0, 0.7, 1], [0.9, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.7, 1], [8, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const alertAnim = alertEntrance();

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
          "radial-gradient(circle at 50% 30%, #FFF5F5 0%, #F5F9FF 100%)",
        fontFamily: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        display: "flex",
        flexDirection: "column",
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
            "radial-gradient(circle, rgba(239,68,68,0.2), rgba(239,68,68,0))",
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
            "radial-gradient(circle, rgba(239,68,68,0.25), rgba(239,68,68,0))",
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
            "linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent)",
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
            "linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent)",
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
        const bgColor = sparkProgress < 0.3 ? "#F87171" : "#EF4444";
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
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 60%, transparent 85%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulseRingScale})`,
          opacity: pulseRingOpacity,
          zIndex: 0,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          zIndex: 20,
          maxWidth: 3000,
          width: "85%",
          position: "relative",
          backdropFilter: "blur(2px)",
          padding: "40px 0",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 28,
            background: "rgba(255,237,237,0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(239,68,68,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(239,68,68,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "#EF4444",
              borderRadius: "50%",
              opacity: dotOpacity,
              boxShadow: `0 0 12px #EF4444, 0 0 0 ${dotShadow}px rgba(239,68,68,0.4)`,
              transform: `scale(${dotScale})`,
            }}
          />
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #991B1B, #EF4444)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ALERTES AUTOMATIQUES
          </span>
        </div>

        {/* SVG Bell */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 100 100"
          style={{
            overflow: "visible",
            opacity: svgOpacity,
            transform: `scale(${svgScale}) rotate(${svgRotate + bellRotate}deg)`,
            filter: `blur(${svgBlur}px)`,
          }}
        >
          <defs>
            <linearGradient id="ringGrad15" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="glowSvg15" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="rgba(254,226,226,0.7)"
            stroke="url(#ringGrad15)"
            strokeWidth="3"
            filter="url(#glowSvg15)"
          />
          <path
            d="M30 60 L30 55 Q30 35 50 35 Q70 35 70 55 L70 60"
            fill="none"
            stroke="#EF4444"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M35 60 L65 60" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="67" r="4" fill="#EF4444" />
          <rect x="48" y="44" width="4" height="14" fill="#EF4444" rx="1" />
          <circle cx="50" cy="62" r="2" fill="#EF4444" />
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="6 5"
            opacity="0.6"
            transform={`rotate(${dashRotate} 50 50)`}
          />
          <circle
            cx="50"
            cy="50"
            r={pulseCircleR}
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.5"
            opacity={pulseCircleOpacity}
          />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(130deg, #0F2B6D 0%, #991B1B 35%, #EF4444 65%, #4A0404 100%)",
            backgroundSize: "200% auto",
            backgroundPosition: titleShine,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          En cas de retard ?<br />
          ShipTrack vous{" "}
          <span
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #EF4444, #B91C1C)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 900,
              transform: `scale(${wordScale})`,
              textShadow: `0 0 ${wordGlow}px rgba(239,68,68,0.6)`,
            }}
          >
            alerte
          </span>
          <br />
          automatiquement.
        </div>
      </div>

      {/* Timeline section */}
      <div
        style={{
          width: "85%",
          background: "rgba(224,237,255,0.5)",
          backdropFilter: "blur(12px)",
          borderRadius: 48,
          padding: "50px 60px",
          border: "2px solid rgba(239,68,68,0.25)",
          boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
          marginTop: 20,
          opacity: timelineAnim.opacity,
          transform: `translateY(${timelineAnim.translateY}px)`,
          filter: `blur(${timelineAnim.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: "#0F2B6D",
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          📦 Suivi dossier #2850 · Shanghai → Dakar
          <span style={{ fontSize: 28, fontWeight: 400, color: "#2C3E66" }}>(mise à jour temps réel)</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
            gap: 20,
          }}
        >
          {/* connector line */}
          <div
            style={{
              position: "absolute",
              top: 45,
              left: 0,
              right: 0,
              height: 4,
              background: "rgba(37, 99, 235, 0.2)",
              borderRadius: 4,
              zIndex: 0,
            }}
          />

          {/* Step 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              position: "relative",
              zIndex: 2,
              opacity: step1.opacity,
              transform: `translateY(${step1.translateY}px)`,
              filter: `blur(${step1.blur}px)`,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                border: "2px solid rgba(37,99,235,0.2)",
              }}
            >
              🚢
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
              Embarquement
            </div>
            <div style={{ fontSize: 24, color: "#2C3E66", fontWeight: 400 }}>14 mars · 08:00</div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              position: "relative",
              zIndex: 2,
              opacity: step2.opacity,
              transform: `translateY(${step2.translateY}px)`,
              filter: `blur(${step2.blur}px)`,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                border: "2px solid rgba(37,99,235,0.2)",
              }}
            >
              🌊
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
              En mer
            </div>
            <div style={{ fontSize: 24, color: "#2C3E66", fontWeight: 400 }}>15–26 mars</div>
          </div>

          {/* Step 3 (delayed) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              position: "relative",
              zIndex: 2,
              opacity: step3.opacity,
              transform: `translateY(${step3.translateY}px) translateX(${shakeX}px)`,
              filter: `blur(${step3.blur}px)`,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: "#FFEDED",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                border: "2px solid #EF4444",
                boxShadow: `0 0 0 ${pulseRedShadow}px rgba(239,68,68,0.4)`,
                transform: `scale(${pulseRedScale})`,
              }}
            >
              ⚠️
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#DC2626", textAlign: "center" }}>
              Dédouanement
            </div>
            <div style={{ fontSize: 24, color: "#DC2626", fontWeight: 500 }}>
              Délai prévu : 28 mars → retard
            </div>
            <div
              style={{
                background: "#EF4444",
                color: "white",
                padding: "6px 20px",
                borderRadius: 40,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 2,
                marginTop: 8,
                opacity: badgeDelay.opacity,
                transform: `translateY(${badgeDelay.translateY}px)`,
              }}
            >
              RETARD
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              position: "relative",
              zIndex: 2,
              opacity: step4.opacity,
              transform: `translateY(${step4.translateY}px)`,
              filter: `blur(${step4.blur}px)`,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                border: "2px solid rgba(37,99,235,0.2)",
              }}
            >
              🏠
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
              Livraison
            </div>
            <div style={{ fontSize: 24, color: "#2C3E66", fontWeight: 400 }}>Prévue le 30 mars</div>
          </div>
        </div>
      </div>

      {/* Alert card */}
      <div
        style={{
          position: "fixed",
          top: 120,
          right: 80,
          width: 680,
          background: "rgba(255,255,255,0.95)",
          borderLeft: "12px solid #EF4444",
          borderRadius: 32,
          padding: "32px 40px",
          boxShadow: "0 30px 50px -20px rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
          zIndex: 30,
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          opacity: alertAnim.opacity,
          transform: `translateX(${alertAnim.translateX}px) scale(${alertAnim.scale})`,
          filter: `blur(${alertAnim.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            background: "#FFEDED",
            width: 70,
            height: 70,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🔔
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>
            Alerte retard · Dédouanement
          </div>
          <div style={{ fontSize: 26, color: "#2C3E66", lineHeight: 1.3 }}>
            Dossier #2850 : documents manquants – action requise avant 18h.
          </div>
          <div style={{ fontSize: 20, color: "#9CA3AF", marginTop: 12 }}>Reçu il y a 2 minutes</div>
          {/* Button is present but non‑interactive in Remotion */}
          <div
            style={{
              background: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: 48,
              padding: "12px 28px",
              fontSize: 24,
              fontWeight: 600,
              marginTop: 12,
              display: "inline-block",
              cursor: "pointer",
            }}
          >
            Voir les détails
          </div>
        </div>
      </div>
    </div>
  );
};