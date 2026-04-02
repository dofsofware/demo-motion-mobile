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

export const Scene6 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background (same as Scene1, blue theme) ----------
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

  // ---------- Column entrances (same as Scene4 but left/right swapped) ----------
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

  // ---------- Badge continuous animations ----------
  const badgePulse = pulseValue(time, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- SVG continuous animations ----------
  // Float animation (3s cycle)
  const svgFloatY = Math.sin((time / 3) * Math.PI * 2) * 4;
  const svgRotate = Math.sin((time / 3) * Math.PI * 2) * 1;

  // Bar heights:
  // Rect 1 (index 0): duration 2s, heights 18 → 24 → 18
  const bar1Progress = pulseValue(time, 2);
  const bar1Height = interpolate(bar1Progress, [-1, 1], [18, 24]);
  // Rect 2 (index 1): duration 2.2s, heights 28 → 32 → 28
  const bar2Progress = pulseValue(time, 2.2);
  const bar2Height = interpolate(bar2Progress, [-1, 1], [28, 32]);
  // Rect 3 (index 2): duration 2.5s, heights 38 → 42 → 38
  const bar3Progress = pulseValue(time, 2.5);
  const bar3Height = interpolate(bar3Progress, [-1, 1], [38, 42]);
  // Rect 4 (index 3): duration 1.8s, heights 23 → 28 → 23
  const bar4Progress = pulseValue(time, 1.8);
  const bar4Height = interpolate(bar4Progress, [-1, 1], [23, 28]);

  // Line dashoffset animation: 1s cycle, values 0 → 16 → 0
  const lineDashOffset = loop(time, 1) * 16;
  const dashOffset = interpolate(lineDashOffset, [0, 0.5, 1], [0, 16, 0]);

  // ---------- Title continuous animations ----------
  // Text shine: 4s cycle, background-position 0% → 200%
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  // Word "marges" pulse: 2.2s cycle
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
            "radial-gradient(circle, rgba(37,99,235,0.2), rgba(37,99,235,0))",
          transform: `translate(${orb1Progress * 40}px, ${orb1Progress * 64
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
          transform: `translate(${orb2Progress * -45}px, ${orb2Progress * -72
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
          transform: `translate(${orb3Progress * 25}px, ${orb3Progress * 40
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

      {/* Pulse ring */}
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

      {/* Main content: two columns, image left, text right */}
      {/* Main content: two columns */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",   // ← était "stretch", change en "center"
          gap: 80,
          zIndex: 20,
          width: "90%",
          maxWidth: 3400,
          height: "90%",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Left column: image */}
        <div
          style={{
            flex: 1.1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",          // ← force la hauteur
            minHeight: 0,            // ← empêche le débordement flex
            opacity: imageOpacity,
            transform: `translateX(${imageTranslateX}px)`,
            filter: `blur(${imageBlur}px)`,
          }}
        >
          <img
            src={staticFile("marge.png")}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
              border: "none",
              borderRadius: 0,
              boxShadow: "none",
              background: "none",
            }}
            alt="Maîtrise des marges ShipTrack"
          />
        </div>

        {/* Right column: text content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 40,
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
              gap: 28,
              background: "rgba(224,237,255,0.75)",
              backdropFilter: "blur(12px)",
              border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
              borderRadius: 120,
              padding: "20px 70px",
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
              PROBLÈME 3/3
            </span>
          </div>

          {/* SVG Icon with animated bars and dash line */}
          <svg
            width="260"
            height="260"
            viewBox="0 0 100 100"
            style={{
              overflow: "visible",
              filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))",
              transform: `translateY(${svgFloatY}px) rotate(${svgRotate}deg)`,
            }}
          >
            <defs>
              <linearGradient id="ringGrad06" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glowSvg06" x="-20%" y="-20%" width="140%" height="140%">
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
              fill="rgba(219,234,254,0.6)"
              stroke="url(#ringGrad06)"
              strokeWidth="3.5"
              filter="url(#glowSvg06)"
            />
            <text
              x="50"
              y="62"
              textAnchor="middle"
              fontSize="48"
              fill="#1E3A8A"
              fontFamily="Sora, sans-serif"
              fontWeight="800"
              stroke="#2563EB"
              strokeWidth="1"
            >
              €
            </text>
            <rect
              x="28"
              y={70 - (bar1Height - 18)} // baseline y=70, height=18 initially, top moves up as height increases
              width="8"
              height={bar1Height}
              fill="#EF4444"
              opacity="0.7"
              rx="2"
            />
            <rect
              x="40"
              y={60 - (bar2Height - 28)}
              width="8"
              height={bar2Height}
              fill="#F59E0B"
              opacity="0.7"
              rx="2"
            />
            <rect
              x="52"
              y={50 - (bar3Height - 38)}
              width="8"
              height={bar3Height}
              fill="#22C55E"
              opacity="0.7"
              rx="2"
            />
            <rect
              x="64"
              y={65 - (bar4Height - 23)}
              width="8"
              height={bar4Height}
              fill="#EF4444"
              opacity="0.7"
              rx="2"
            />
            <line
              x1="28"
              y1="88"
              x2="72"
              y2="88"
              stroke="#DC2626"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeDashoffset={dashOffset}
            />
          </svg>

          {/* Title */}
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
            }}
          >
            <div>Vous ne maîtrisez pas</div>
            <div>
              vos{" "}
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
                marges
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};