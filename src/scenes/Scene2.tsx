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

export const Scene2 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  // Crossfade logic (same as Scene1)
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

  // ---------- Grid (shift) ----------
  const gridOffset = (time / 18) * 140;

  // ---------- Orbs (floating) ----------
  const orb1Progress = pulseValue(time, 22);
  const orb2Progress = pulseValue(time, 26, 3);
  const orb3Progress = pulseValue(time, 18, 1.8);

  // ---------- Floating lines ----------
  const line1Progress = loop(time, 12);
  const line2Progress = loop(time, 14);
  const line1Translate = interpolate(line1Progress, [0, 1], [-30, 40]);
  const line2Translate = interpolate(line2Progress, [0, 1], [40, -50]);
  const line1Opacity = interpolate(line1Progress, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0]);
  const line2Opacity = interpolate(line2Progress, [0, 0.2, 0.8, 1], [0, 0.4, 0.4, 0]);

  // ---------- Sparks ----------
  const sparks = [
    { top: "20%", left: "15%", size: 10, delay: 0 },
    { top: "65%", left: "85%", size: 6, delay: 0.7 },
    { top: "80%", left: "30%", size: 8, delay: 1.2 },
    { top: "40%", left: "72%", size: 6, delay: 0.3 },
    { top: "15%", left: "88%", size: 6, delay: 1.8 },
  ];

  // ---------- Pulse ring (central) ----------
  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  // ---------- Badge "Le coût caché" ----------
  const badgeProgress = interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.3)),
  });
  const badgeY = interpolate(badgeProgress, [0, 0.6, 1], [-80, 8, 0], clamp);
  const badgeScale = interpolate(badgeProgress, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeProgress, [0, 1], [12, 0], clamp);

  const badgePulse = pulseValue(time, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Money emoji ----------
  const emojiProgress = interpolate(frame, [0.7 * fps, 1.6 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const emojiScale = interpolate(emojiProgress, [0, 0.5, 1], [0.2, 1.08, 1], clamp);
  const emojiRotate = interpolate(emojiProgress, [0, 0.5, 1], [-120, 3, 0], clamp);
  const emojiBlur = interpolate(emojiProgress, [0, 1], [10, 0], clamp);
  const emojiFloatY = Math.sin(((time - 1.6) / 3) * Math.PI * 2) * 4;

  // ---------- Title ----------
  const titleProgress = interpolate(frame, [0.9 * fps, 1.8 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(titleProgress, [0, 0.4, 1], [100, -12, 0], clamp);
  const titleScale = interpolate(titleProgress, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleProgress, [0, 1], [8, 0], clamp);
  const titleShine = `${(time * 50) % 200}% 50%`;

  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Tagline ----------
  const taglineProgress = interpolate(frame, [1.1 * fps, 1.95 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [70, 0], clamp);
  const taglineScale = interpolate(taglineProgress, [0, 1], [0.95, 1], clamp);
  const taglineBlur = interpolate(taglineProgress, [0, 1], [6, 0], clamp);

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
          transform: `translate(${orb1Progress * 40}px, ${orb1Progress * 64}px) scale(${1 + orb1Progress * 0.05})`,
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
          transform: `translate(${orb2Progress * -45}px, ${orb2Progress * -72}px) scale(${1 + orb2Progress * 0.05})`,
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
          transform: `translate(${orb3Progress * 25}px, ${orb3Progress * 40}px) scale(${1 + orb3Progress * 0.05})`,
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
        const bgColor =
          sparkProgress < 0.3 ? "#F87171" : "#EF4444";
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
            "radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.02) 60%, transparent 85%)",
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
          backdropFilter: "blur(2px)",
          padding: "60px 0",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 28,
            background: "rgba(255, 237, 237, 0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(220, 38, 38, ${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(220, 38, 38, 0.2)`,
            opacity: badgeProgress,
            transform: `translateY(${badgeY}px) scale(${badgeScale})`,
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
              textShadow: "0 2px 5px rgba(220,38,38,0.2)",
            }}
          >
            LE COÛT CACHÉ
          </span>
        </div>

        {/* Money emoji */}
        <div
          style={{
            width: 280,
            height: 280,
            background: "rgba(255, 237, 237, 0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 130,
            border: "3px solid rgba(220, 38, 38, 0.4)",
            boxShadow: "0 25px 40px -12px rgba(0,0,0,0.2)",
            transform: `translateY(${emojiFloatY}px) scale(${emojiScale}) rotate(${emojiRotate}deg)`,
            filter: `blur(${emojiBlur}px) drop-shadow(0 5px 15px rgba(220,38,38,0.3))`,
            opacity: emojiProgress,
          }}
        >
          💸
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 128,
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
            textShadow: "0 4px 25px rgba(220,38,38,0.2)",
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleProgress,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          <div>
            Et surtout… vous perdez de l'{" "}
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
              argent
            </span>
          </div>
          <div>sans vraiment savoir où ?</div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 500,
            color: "#2C3E66",
            letterSpacing: "-0.01em",
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(4px)",
            padding: "12px 40px",
            borderRadius: 80,
            display: "inline-block",
            fontFamily: "'Sora', monospace",
            opacity: taglineProgress,
            transform: `translateY(${taglineY}px) scale(${taglineScale})`,
            filter: `blur(${taglineBlur}px)`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
          }}
        >
          Pertes invisibles · Marges non maîtrisées
        </div>
      </div>
    </div>
  );
};