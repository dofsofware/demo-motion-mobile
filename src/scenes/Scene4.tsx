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

export const Scene4 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  // Crossfade logic (same as previous scenes)
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

  // ---------- Image entrance (slideInLeftPro) ----------
  // Duration: 0.95s, easing: cubic-bezier(0.2, 1.1, 0.35, 1)
  // Keyframes: 0%: opacity 0, translateX(-380px), blur(18px)
  //           40%: opacity 0.7, translateX(12px), blur(2px)
  //           70%: translateX(-5px)
  //           100%: opacity 1, translateX(0), blur(0)
  const imageEntrance = interpolate(frame, [0, 0.95 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.1, 0.35, 1),
  });
  const imageOpacity = interpolate(imageEntrance, [0, 0.4, 1], [0, 0.7, 1], clamp);
  const imageTranslateX = interpolate(
    imageEntrance,
    [0, 0.4, 0.7, 1],
    [-380, 12, -5, 0],
    clamp
  );
  const imageBlur = interpolate(imageEntrance, [0, 0.4, 1], [18, 2, 0], clamp);

  // ---------- Text column entrance (slideInRightPro) ----------
  // Same timings but mirrored: start translateX(380px)
  const textEntrance = interpolate(frame, [0, 0.95 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.1, 0.35, 1),
  });
  const textOpacity = interpolate(textEntrance, [0, 0.4, 1], [0, 0.7, 1], clamp);
  const textTranslateX = interpolate(
    textEntrance,
    [0, 0.4, 0.7, 1],
    [380, -12, 5, 0],
    clamp
  );
  const textBlur = interpolate(textEntrance, [0, 0.4, 1], [18, 2, 0], clamp);

  // ---------- Badge ----------
  // Badge itself only has entrance (no infinite animations except the dot)
  // The badge container has no animation in HTML besides its entrance via slideInRightPro,
  // but we already handle that via textEntrance. However, the badge is inside the text column,
  // so its entrance is already handled by textEntrance. We'll apply that transform to the
  // entire text column, not individually to badge. So we just render badge with no extra
  // entrance animation (already animated via parent). But we still need the dot pulse infinite.
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.25]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Title ----------
  // Title has infinite textShineFlow (background position move) and a word "manquez" with pulseGlowWord.
  const titleShine = `${(time * 50) % 250}% 50%`; // 3.5s cycle? Actually 3.5s: 100% over 3.5s? We'll use 3.5s duration for full cycle.
  // The original animation is 3.5s linear infinite, moving from 0% to 200% (or 250%? but it's 0%→200%).
  // We'll use a cycle of 3.5s: (time / 3.5) * 200
  const shinePosition = ((time % 3.5) / 3.5) * 200;
  const titleBackgroundPosition = `${shinePosition}% 50%`;

  // Word "manquez" pulse: duration 2.2s, scale 1→1.02, text-shadow from 0 to 14px.
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordShadow = interpolate(wordPulse, [-1, 1], [0, 14]);

  // ---------- Sub-description ----------
  // No animations, static text.

  // ---------- Stats chip ----------
  // Dot accent (two dots) have pulseGlow: duration 2s, opacity 0.5→1, box-shadow from 0 to 5px.
  const glowPulse = pulseValue(time, 2);
  const dotAccentOpacity = interpolate(glowPulse, [-1, 1], [0.5, 1]);
  const dotAccentShadow = interpolate(glowPulse, [-1, 1], [0, 5]);
  const statsText = "-47% d’efficacité opérationnelle";

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
      {/* Background elements (grid, orbs, lines, sparks, pulse ring) */}
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
          position: "relative",
          zIndex: 20,
          width: "90%",
          maxWidth: 3200,
          display: "flex",
          alignItems: "stretch",
          gap: 80,
          padding: "60px 40px",
          margin: "0 auto",
          height: "100%", // Ensure full height for image column to stretch
        }}
      >
        {/* Left column: image */}
        <div
          style={{
            flex: 1.1,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            opacity: imageOpacity,
            transform: `translateX(${imageTranslateX}px)`,
            filter: `blur(${imageBlur}px)`,
          }}
        >
          <img
            src={staticFile("visibility.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              background: "none",
              border: "none",
              borderRadius: 0,
              boxShadow: "none",
            }}
            alt="Visibilité maritime - ShipTrack"
          />
        </div>

        {/* Right column: text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 32,
            opacity: textOpacity,
            transform: `translateX(${textTranslateX}px)`,
            filter: `blur(${textBlur}px)`,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 20,
              background: "rgba(224, 237, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(37, 99, 235, 0.6)",
              borderRadius: 100,
              padding: "14px 42px",
              width: "fit-content",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                background: "#2563EB",
                borderRadius: "50%",
                opacity: dotOpacity,
                boxShadow: `0 0 8px #2563EB, 0 0 0 ${dotShadow}px rgba(37,99,235,0.35)`,
                transform: `scale(${dotScale})`,
              }}
            />
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              PROBLÈME 1/3
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #1E3A8A 25%, #2563EB 55%, #3B82F6 85%, #0F2B6D 100%)",
              backgroundSize: "250% auto",
              backgroundPosition: titleBackgroundPosition,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 18,
            }}
          >
            Vous{" "}
            <span
              style={{
                display: "inline-block",
                transform: `scale(${wordScale})`,
                textShadow: `0 0 ${wordShadow}px rgba(37,99,235,0.7)`,
              }}
            >
              manquez
            </span>
            <br />
            de visibilité
          </div>

          {/* Sub-description */}
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: "85%",
              letterSpacing: "-0.2px",
              borderLeft: "5px solid #2563EB",
              paddingLeft: 28,
              background: "linear-gradient(120deg, #2C3E66, #4B6A9B)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 600,
            }}
          >
            Données opaques, flotte invisible.
            <br />
            Aucun suivi temps réel sur vos actifs.
          </div>

          {/* Stats chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: "#2563EB",
                borderRadius: "50%",
                opacity: dotAccentOpacity,
                boxShadow: `0 0 0 ${dotAccentShadow}px rgba(37,99,235,0.2)`,
              }}
            />
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "#1E3A8A",
                letterSpacing: "0.5px",
                background: "rgba(37, 99, 235, 0.1)",
                padding: "8px 20px",
                borderRadius: 60,
                backdropFilter: "blur(4px)",
              }}
            >
              {statsText}
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                background: "#EF4444",
                borderRadius: "50%",
                opacity: dotAccentOpacity,
                boxShadow: `0 0 0 ${dotAccentShadow}px rgba(239,68,68,0.2)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};