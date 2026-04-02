import {
  Easing,
  interpolate,
  staticFile,
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

export const Scene5 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  // Crossfade
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

  // ---------- Background (red theme) ----------
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

  // ---------- Badge entrance (slideFromRight) ----------
  const badgeEntrance = interpolate(frame, [0, 0.75 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateX = interpolate(
    badgeEntrance,
    [0, 0.6, 0.8, 1],
    [300, -18, 6, 0],
    clamp
  );
  const badgeScale = interpolate(
    badgeEntrance,
    [0, 0.6, 0.8, 1],
    [0.92, 1.01, 0.995, 1],
    clamp
  );
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [10, 0, 0], clamp);

  // Badge infinite glow pulse (starts after entrance, delay 0.75s)
  const badgePulse = pulseValue(time - 0.75, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- SVG entrance (slideFromRight, delay 0.15s) ----------
  const svgEntrance = interpolate(frame, [0.15 * fps, (0.15 + 0.82) * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const svgOpacity = interpolate(svgEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const svgTranslateX = interpolate(
    svgEntrance,
    [0, 0.6, 0.8, 1],
    [300, -18, 6, 0],
    clamp
  );
  const svgScale = interpolate(
    svgEntrance,
    [0, 0.6, 0.8, 1],
    [0.92, 1.01, 0.995, 1],
    clamp
  );
  const svgBlur = interpolate(svgEntrance, [0, 0.6, 1], [10, 0, 0], clamp);

  // SVG floating animation (starts after entrance, delay 1s)
  const svgFloatY = Math.sin(((time - 1) / 3) * Math.PI * 2) * 4;
  const svgRotate = Math.sin(((time - 1) / 3) * Math.PI * 2) * 1;

  // SVG line animation (stroke‑dashoffset cycles 0 → 16 → 0 in 1s)
  const lineDashOffset = loop(time, 1) * 16;
  const dashOffset = interpolate(lineDashOffset, [0, 0.5, 1], [0, 16, 0]);

  // ---------- Title entrance (slideFromRight, delay 0.28s) ----------
  const titleEntrance = interpolate(frame, [0.28 * fps, (0.28 + 0.9) * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const titleOpacity = interpolate(titleEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const titleTranslateX = interpolate(
    titleEntrance,
    [0, 0.6, 0.8, 1],
    [300, -18, 6, 0],
    clamp
  );
  const titleScale = interpolate(
    titleEntrance,
    [0, 0.6, 0.8, 1],
    [0.92, 1.01, 0.995, 1],
    clamp
  );
  const titleBlur = interpolate(titleEntrance, [0, 0.6, 1], [10, 0, 0], clamp);

  // Title text shine (4s cycle, background position 0% → 200%)
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  // Word "retards" pulse (2.2s cycle)
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

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
      }}
    >
      {/* Grid */}
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

      {/* Orbs */}
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
            "radial-gradient(circle, rgba(220,38,38,0.2), rgba(220,38,38,0))",
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
            "radial-gradient(circle, rgba(220,38,38,0.25), rgba(220,38,38,0))",
          transform: `translate(${orb3Progress * 25}px, ${
            orb3Progress * 40
          }px) scale(${1 + orb3Progress * 0.05})`,
        }}
      />

      {/* Floating lines */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(220,38,38,0.3), transparent)",
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
            "linear-gradient(90deg, transparent, rgba(220,38,38,0.3), transparent)",
          top: "70%",
          left: "-40%",
          transform: `translateX(${line2Translate}%) rotate(-5deg)`,
          opacity: line2Opacity,
          zIndex: 1,
        }}
      />

      {/* Sparks */}
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

      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,38,38,0.08) 0%, rgba(220,38,38,0.02) 60%, transparent 85%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulseRingScale})`,
          opacity: pulseRingOpacity,
          zIndex: 0,
        }}
      />

      {/* Main content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
          zIndex: 20,
          maxWidth: 3000,
          width: "85%",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          padding: "60px 0",
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
            border: `2px solid rgba(220,38,38,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(220,38,38,0.2)`,
            opacity: badgeOpacity,
            transform: `translateX(${badgeTranslateX}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "#DC2626",
              borderRadius: "50%",
              opacity: dotOpacity,
              boxShadow: `0 0 12px #DC2626, 0 0 0 ${dotShadow}px rgba(220,38,38,0.4)`,
              transform: `scale(${dotScale})`,
            }}
          />
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #991B1B, #DC2626)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            PROBLÈME 2/3
          </span>
        </div>

        {/* SVG Icon */}
        <svg
          width="260"
          height="260"
          viewBox="0 0 100 100"
          style={{
            overflow: "visible",
            filter: `blur(${svgBlur}px) drop-shadow(0 10px 15px rgba(0,0,0,0.1))`,
            opacity: svgOpacity,
            transform: `translateX(${svgTranslateX}px) translateY(${svgFloatY}px) scale(${svgScale}) rotate(${svgRotate}deg)`,
          }}
        >
          <defs>
            <linearGradient id="ringGrad05" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <filter id="glowSvg05" x="-20%" y="-20%" width="140%" height="140%">
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
            fill="rgba(254,226,226,0.6)"
            stroke="url(#ringGrad05)"
            strokeWidth="3.5"
            filter="url(#glowSvg05)"
          />
          <polygon
            points="50,20 80,75 20,75"
            fill="rgba(220,38,38,0.2)"
            stroke="#DC2626"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <rect x="47" y="40" width="6" height="28" fill="#DC2626" rx="2" />
          <circle cx="50" cy="72" r="4" fill="#DC2626" />
          <line
            x1="30"
            y1="85"
            x2="70"
            y2="85"
            stroke="#DC2626"
            strokeWidth="3"
            strokeDasharray="5 3"
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 1.15,
            textAlign: "center",
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(130deg, #0F2B6D 0%, #991B1B 35%, #DC2626 65%, #4A0404 100%)",
            backgroundSize: "200% auto",
            backgroundPosition: titleShine,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleOpacity,
            transform: `translateX(${titleTranslateX}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          <div>Vous subissez</div>
          <div>
            des{" "}
            <span
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #EF4444, #B91C1C)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: 900,
                transform: `scale(${wordScale})`,
                textShadow: `0 0 ${wordGlow}px rgba(220,38,38,0.6)`,
              }}
            >
              retards
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};