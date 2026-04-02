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

export const Scene3 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background elements (same as Scene1) ----------
  const gridOffset = (time / 18) * 140;

  const orb1Progress = pulseValue(time, 22);
  const orb2Progress = pulseValue(time, 26, 3);
  const orb3Progress = pulseValue(time, 18, 1.8);

  const line1Progress = loop(time, 12);
  const line2Progress = loop(time, 14);
  const line1Translate = interpolate(line1Progress, [0, 1], [-30, 40]);
  const line2Translate = interpolate(line2Progress, [0, 1], [40, -50]);
  const line1Opacity = interpolate(line1Progress, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0]);
  const line2Opacity = interpolate(line2Progress, [0, 0.2, 0.8, 1], [0, 0.4, 0.4, 0]);

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
  const badgeProgress = interpolate(frame, [0.5 * fps, 1.25 * fps], [0, 1], {
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

  // ---------- Cards ----------
  // Each card entrance with staggering: card1: start 0.2s, card2: 0.38s, card3: 0.56s
  const cardStartFrames = [0.2 * fps, 0.38 * fps, 0.56 * fps];
  const cardDurations = [0.75 * fps, 0.75 * fps, 0.75 * fps];

  const cardEntranceProgress = (index: number) => {
    const start = cardStartFrames[index];
    const end = start + cardDurations[index];
    return interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  };

  const cardEntranceY = (progress: number) => interpolate(progress, [0, 0.55, 0.8, 1], [120, -10, 4, 0], clamp);
  const cardEntranceScale = (progress: number) => interpolate(progress, [0, 0.55, 0.8, 1], [0.88, 1.02, 0.99, 1], clamp);
  const cardEntranceBlur = (progress: number) => interpolate(progress, [0, 1], [10, 0], clamp);

  // Infinite card animations after entrance: float and glow
  const cardFloatY = (index: number) => {
    const phase = index === 0 ? 0.75 : index === 1 ? 0.93 : 1.11;
    return Math.sin(((time - phase) / 4.5) * Math.PI * 2) * 7;
  };
  const cardFloatRotate = (index: number) => {
    const phase = index === 0 ? 0.75 : index === 1 ? 0.93 : 1.11;
    return Math.sin(((time - phase) / 4.5) * Math.PI * 2) * 0.5;
  };
  const cardGlow = (index: number) => {
    const phase = index === 0 ? 0.75 : index === 1 ? 0.93 : 1.11;
    const glow = pulseValue(time - phase, 3);
    const shadowScale = interpolate(glow, [-1, 1], [0, 0.1]);
    const extraBlur = interpolate(glow, [-1, 1], [0, 40]);
    return {
      boxShadow: `0 30px 60px -20px rgba(37,99,235,0.12), 0 0 0 ${shadowScale * 40}px rgba(37,99,235,${0.08 + shadowScale * 0.04}), inset 0 1px 0 rgba(255,255,255,0.9)`,
    };
  };

  // Logo breathing animation (infinite)
  const logoBreath = () => {
    const breath = pulseValue(time, 3);
    const scale = interpolate(breath, [-1, 1], [1, 1.06]);
    const translateY = interpolate(breath, [-1, 1], [0, -6]);
    const dropShadow = `0 ${12 + breath * 6}px ${24 + breath * 8}px rgba(37,99,235,${0.18 + breath * 0.1})`;
    return { scale, translateY, dropShadow };
  };
  const logoStyle = logoBreath();

  // ---------- Connectors ----------
  const connectorStartFrames = [0.28 * fps, 0.46 * fps];
  const connectorProgress = (index: number) => {
    const start = connectorStartFrames[index];
    return interpolate(frame, [start, start + 0.4 * fps], [0, 1], {
      ...clamp,
      easing: Easing.ease,
    });
  };
  const connectorScaleX = (progress: number) => interpolate(progress, [0, 1], [0, 1], clamp);
  const connectorOpacity = (progress: number) => progress;

  // Dot sliding on connectors (infinite)
  const connectorDotLeft = (index: number) => {
    const phase = index === 0 ? 0.28 : 0.46;
    const t = time - phase;
    const dotProgress = loop(t, 1.8); // duration 1.8s
    const left = interpolate(dotProgress, [0, 0.5, 1], [0, 50, 100]);
    const opacity = interpolate(dotProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);
    return { left: `${left}%`, opacity };
  };

  // ---------- Title ----------
  const titleProgress = interpolate(frame, [0.9 * fps, 1.8 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  });
  const titleY = interpolate(titleProgress, [0, 0.4, 1], [100, -12, 0], clamp);
  const titleScale = interpolate(titleProgress, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleProgress, [0, 1], [8, 0], clamp);
  const titleShine = `${(time * 50) % 200}% 50%`;

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
            "radial-gradient(circle, rgba(37,99,235,0.25), rgba(37,99,235,0))",
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

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 100,
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
            background: "rgba(224, 237, 255, 0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(37, 99, 235, ${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37, 99, 235, 0.2)`,
            opacity: badgeProgress,
            transform: `translateY(${badgeY}px) scale(${badgeScale})`,
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
            Le quotidien
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
          {(() => {
            const prog = cardEntranceProgress(0);
            return (
              <div
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(16px)",
                  border: "2px solid rgba(37,99,235,0.18)",
                  borderRadius: 40,
                  padding: "70px 90px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 40,
                  position: "relative",
                  overflow: "hidden",
                  opacity: prog,
                  transform: `translateY(${cardEntranceY(prog) + cardFloatY(0)}px) scale(${cardEntranceScale(prog)}) rotate(${cardFloatRotate(0)}deg)`,
                  filter: `blur(${cardEntranceBlur(prog)}px)`,
                  ...cardGlow(0),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 30,
                    fontSize: 30,
                    fontWeight: 800,
                    color: "rgba(37,99,235,0.18)",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  01
                </div>
                <img
                  src={staticFile("excel.png")}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "contain",
                    filter: `drop-shadow(0 ${12 + logoBreath().translateY / 2}px ${24 + logoBreath().translateY}px rgba(37,99,235,${0.18 + (logoBreath().scale - 1) * 0.5}))`,
                    transform: `scale(${logoBreath().scale}) translateY(${logoBreath().translateY}px)`,
                    transition: "transform 0.3s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: 46,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0F2B6D, #2563EB)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Excel
                </span>
              </div>
            );
          })()}

          {/* Connector 1 */}
          {(() => {
            const prog = connectorProgress(0);
            const dot = connectorDotLeft(0);
            return (
              <div
                style={{
                  alignSelf: "center",
                  width: 80,
                  height: 3,
                  background:
                    "linear-gradient(90deg, rgba(37,99,235,0.3), rgba(37,99,235,0.7), rgba(37,99,235,0.3))",
                  borderRadius: 4,
                  position: "relative",
                  opacity: connectorOpacity(prog),
                  transform: `scaleX(${connectorScaleX(prog)})`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: dot.left,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    background: "#2563EB",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px #2563EB",
                    opacity: dot.opacity,
                  }}
                />
              </div>
            );
          })()}

          {/* Card 2 */}
          {(() => {
            const prog = cardEntranceProgress(1);
            return (
              <div
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(16px)",
                  border: "2px solid rgba(37,99,235,0.18)",
                  borderRadius: 40,
                  padding: "70px 90px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 40,
                  position: "relative",
                  overflow: "hidden",
                  opacity: prog,
                  transform: `translateY(${cardEntranceY(prog) + cardFloatY(1)}px) scale(${cardEntranceScale(prog)}) rotate(${cardFloatRotate(1)}deg)`,
                  filter: `blur(${cardEntranceBlur(prog)}px)`,
                  ...cardGlow(1),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 30,
                    fontSize: 30,
                    fontWeight: 800,
                    color: "rgba(37,99,235,0.18)",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  02
                </div>
                <img
                  src={staticFile("whatsapp.png")}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "contain",
                    filter: `drop-shadow(0 ${12 + logoBreath().translateY / 2}px ${24 + logoBreath().translateY}px rgba(37,99,235,${0.18 + (logoBreath().scale - 1) * 0.5}))`,
                    transform: `scale(${logoBreath().scale}) translateY(${logoBreath().translateY}px)`,
                  }}
                />
                <span
                  style={{
                    fontSize: 46,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0F2B6D, #2563EB)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  WhatsApp
                </span>
              </div>
            );
          })()}

          {/* Connector 2 */}
          {(() => {
            const prog = connectorProgress(1);
            const dot = connectorDotLeft(1);
            return (
              <div
                style={{
                  alignSelf: "center",
                  width: 80,
                  height: 3,
                  background:
                    "linear-gradient(90deg, rgba(37,99,235,0.3), rgba(37,99,235,0.7), rgba(37,99,235,0.3))",
                  borderRadius: 4,
                  position: "relative",
                  opacity: connectorOpacity(prog),
                  transform: `scaleX(${connectorScaleX(prog)})`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: dot.left,
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    background: "#2563EB",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px #2563EB",
                    opacity: dot.opacity,
                  }}
                />
              </div>
            );
          })()}

          {/* Card 3 */}
          {(() => {
            const prog = cardEntranceProgress(2);
            return (
              <div
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(16px)",
                  border: "2px solid rgba(37,99,235,0.18)",
                  borderRadius: 40,
                  padding: "70px 90px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 40,
                  position: "relative",
                  overflow: "hidden",
                  opacity: prog,
                  transform: `translateY(${cardEntranceY(prog) + cardFloatY(2)}px) scale(${cardEntranceScale(prog)}) rotate(${cardFloatRotate(2)}deg)`,
                  filter: `blur(${cardEntranceBlur(prog)}px)`,
                  ...cardGlow(2),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 30,
                    fontSize: 30,
                    fontWeight: 800,
                    color: "rgba(37,99,235,0.18)",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  03
                </div>
                <img
                  src={staticFile("phone.png")}
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: "contain",
                    filter: `drop-shadow(0 ${12 + logoBreath().translateY / 2}px ${24 + logoBreath().translateY}px rgba(37,99,235,${0.18 + (logoBreath().scale - 1) * 0.5}))`,
                    transform: `scale(${logoBreath().scale}) translateY(${logoBreath().translateY}px)`,
                  }}
                />
                <span
                  style={{
                    fontSize: 46,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0F2B6D, #2563EB)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Appels clients
                </span>
              </div>
            );
          })()}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            lineHeight: 1.18,
            textAlign: "center",
            letterSpacing: "-0.025em",
            background:
              "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
            backgroundSize: "200% auto",
            backgroundPosition: titleShine,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            maxWidth: 2800,
            opacity: titleProgress,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          Entre Excel, WhatsApp et les appels clients…
        </div>
      </div>
    </div>
  );
};