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

export const Scene11 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  // Crossfade (same as other scenes)
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

  // ---------- Background elements (identical to previous scenes) ----------
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

  // ---------- Badge ----------
  // Entrance: slideDownPop (0.7s, cubic-bezier(0.34,1.3,0.55,1))
  const badgeEntrance = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.3, 0.55, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(badgeEntrance, [0, 0.6, 1], [-80, 8, 0], clamp);
  const badgeScale = interpolate(badgeEntrance, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  // Badge continuous glow (starts after 0.7s)
  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge (1.6s cycle)
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Card animations ----------
  // Helper for entrance progress
  const cardEntrance = (
    startSec: number,
    durationSec: number,
    easing: (x: number) => number
  ) => {
    const start = startSec * fps;
    const end = (startSec + durationSec) * fps;
    if (frame < start) return 0;
    return interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing,
    });
  };

  // Card 1 entrance (0.1s start, 0.8s duration)
  const card1Progress = cardEntrance(0.1, 0.8, Easing.bezier(0.22, 1, 0.36, 1));
  const card1Opacity = interpolate(card1Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card1TranslateX = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [-350, 20, -8, 0],
    clamp
  );
  const card1Scale = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [0.85, 1.03, 0.99, 1],
    clamp
  );
  const card1Rotate = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [-4, 0.5, 0, 0],
    clamp
  );
  const card1Blur = interpolate(card1Progress, [0, 0.55, 1], [12, 0, 0], clamp);

  // Card 2 entrance (0.9s start, 0.85s duration)
  const card2Progress = cardEntrance(0.9, 0.85, Easing.bezier(0.22, 1, 0.36, 1));
  const card2Opacity = interpolate(card2Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card2TranslateY = interpolate(
    card2Progress,
    [0, 0.55, 0.75, 1],
    [280, -18, 6, 0],
    clamp
  );
  const card2Scale = interpolate(
    card2Progress,
    [0, 0.55, 0.75, 1],
    [0.88, 1.03, 0.99, 1],
    clamp
  );
  const card2Blur = interpolate(card2Progress, [0, 0.55, 1], [10, 0, 0], clamp);

  // Card 3 entrance (1.2s start, 0.8s duration)
  const card3Progress = cardEntrance(1.2, 0.8, Easing.bezier(0.22, 1, 0.36, 1));
  const card3Opacity = interpolate(card3Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card3TranslateX = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [350, -20, 8, 0],
    clamp
  );
  const card3Scale = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [0.85, 1.03, 0.99, 1],
    clamp
  );
  const card3Rotate = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [4, -0.5, 0, 0],
    clamp
  );
  const card3Blur = interpolate(card3Progress, [0, 0.55, 1], [12, 0, 0], clamp);

  // Floating after entrance (start delays: card1 0.9s, card2 1.75s, card3 2.0s)
  const cardFloat = (startDelay: number, amplitudeY: number, amplitudeRotate: number) => {
    if (time < startDelay) return { y: 0, rotate: 0 };
    const t = (time - startDelay) / 5; // 5s cycle
    const wave = Math.sin(t * Math.PI * 2);
    return { y: wave * amplitudeY, rotate: wave * amplitudeRotate };
  };
  const float1 = cardFloat(0.9, 12, 0.4);
  const float2 = cardFloat(1.75, 16, -0.4);
  const float3 = cardFloat(2.0, 10, 0.6);

  // Card glow (3s cycle, starting after entrance delay)
  const cardGlow = (startDelay: number) => {
    if (time < startDelay) return { shadowScale: 0, extraBlur: 0 };
    const glow = pulseValue(time - startDelay, 3);
    const shadowScale = interpolate(glow, [-1, 1], [0, 30]);
    const extraBlur = interpolate(glow, [-1, 1], [0, 30]);
    return { shadowScale, extraBlur };
  };
  const glow1 = cardGlow(0.9);
  const glow2 = cardGlow(1.75);
  const glow3 = cardGlow(2.0);

  // Logo breathing (3.5s cycle, continuous)
  const breath = pulseValue(time, 3.5);
  const logoScale = interpolate(breath, [-1, 1], [1, 1.07]);
  const logoTranslateY = interpolate(breath, [-1, 1], [0, -6]);
  const logoDropShadow = interpolate(breath, [-1, 1], [18, 28]);

  // Divider pulse (2s cycle, with different delays)
  const dividerPulse = (delay: number) => {
    if (time < delay) return { width: 70, opacity: 0.6 };
    const wave = pulseValue(time - delay, 2);
    const width = interpolate(wave, [-1, 1], [70, 100]);
    const opacityDiv = interpolate(wave, [-1, 1], [0.6, 1]);
    return { width, opacity: opacityDiv };
  };
  const divider1 = dividerPulse(0);
  const divider2 = dividerPulse(0.5);
  const divider3 = dividerPulse(1);

  // Card badges (slide up, delays: 0.65s, 1.45s, 1.75s)
  const badgeSlideUp = (startDelay: number) => {
    const start = startDelay * fps;
    const end = (startDelay + 0.4) * fps;
    if (frame < start) return { opacity: 0, translateY: 20 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const opacityBadge = progress;
    const translateY = interpolate(progress, [0, 1], [20, 0]);
    return { opacity: opacityBadge, translateY };
  };
  const badge1 = badgeSlideUp(0.65);
  const badge2 = badgeSlideUp(1.45);
  const badge3 = badgeSlideUp(1.75);

  // ---------- Title ----------
  const titleEntranceProgress = cardEntrance(1.5, 0.9, Easing.bezier(0.2, 0.9, 0.3, 1.2));
  const titleOpacity = interpolate(titleEntranceProgress, [0, 0.45, 1], [0, 1, 1], clamp);
  const titleTranslateY = interpolate(titleEntranceProgress, [0, 0.45, 1], [90, -10, 0], clamp);
  const titleScale = interpolate(titleEntranceProgress, [0, 0.45, 1], [0.93, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntranceProgress, [0, 0.45, 1], [8, 0, 0], clamp);

  // Title text shine (4s cycle)
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  // Word "claire" pulse (2.2s cycle)
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

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 90,
          zIndex: 20,
          maxWidth: 3200,
          width: "88%",
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
            background: "rgba(224,237,255,0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
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
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            CLARTÉ & TRAÇABILITÉ
          </span>
        </div>

        {/* Cards container */}
        <div
          style={{
            display: "flex",
            gap: 80,
            alignItems: "stretch",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.5)",
              borderRadius: 40,
              padding: "60px 80px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              minWidth: 400,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow1.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card1Opacity,
              transform: `translateX(${card1TranslateX + float1.y * 0}px) translateY(${float1.y}px) scale(${card1Scale}) rotate(${card1Rotate + float1.rotate}deg)`,
              filter: `blur(${card1Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              01
            </div>
            <img
              src={staticFile("claire.png")}
              style={{
                width: 180,
                height: 180,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                }
              }}
            />
            <div
              style={{
                width: divider1.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider1.opacity,
              }}
            />
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Claire
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge1.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                padding: "10px 34px",
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge1.opacity,
              }}
            >
              CLAIRE
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.2)",
              borderRadius: 40,
              padding: "60px 80px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              minWidth: 400,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow2.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card2Opacity,
              transform: `translateY(${card2TranslateY + float2.y}px) scale(${card2Scale})`,
              filter: `blur(${card2Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              02
            </div>
            <img
              src={staticFile("structuree.png")}
              style={{
                width: 180,
                height: 180,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                }
              }}
            />
            <div
              style={{
                width: divider2.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider2.opacity,
              }}
            />
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Structurée
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge2.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                padding: "10px 34px",
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge2.opacity,
              }}
            >
              STRUCTURÉE
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.2)",
              borderRadius: 40,
              padding: "60px 80px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              minWidth: 400,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow3.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card3Opacity,
              transform: `translateX(${card3TranslateX + float3.y * 0}px) translateY(${float3.y}px) scale(${card3Scale}) rotate(${card3Rotate + float3.rotate}deg)`,
              filter: `blur(${card3Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              03
            </div>
            <img
              src={staticFile("tracee.png")}
              style={{
                width: 180,
                height: 180,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                }
              }}
            />
            <div
              style={{
                width: divider3.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider3.opacity,
              }}
            />
            <div
              style={{
                fontSize: 50,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Tracée
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge3.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                padding: "10px 34px",
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge3.opacity,
              }}
            >
              TRACÉE
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
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
          Chaque étape est{" "}
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
            claire
          </span>
          ,<br />
          structurée et tracée.
        </div>
      </div>
    </div>
  );
};