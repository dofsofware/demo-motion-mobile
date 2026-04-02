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

export const Scene28 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background elements (dark theme, white accents) ----------
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

  const pulseRingWave = pulseValue(time, 6);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.4, 0.7]);

  // ---------- Creative enhancements ----------
  // Rotating ring around logo
  const ringRotate = (time * 360 / 8) % 360; // 8 seconds per rotation
  const ringScale = 1 + Math.sin(time * Math.PI * 2) * 0.03; // gentle pulse

  // Particles around button
  const particleCount = 12;
  const particles = Array.from({ length: particleCount }).map((_, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + time * 2;
    const radius = 180 + Math.sin(time * 3 + i) * 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const opacity = 0.6 + Math.sin(time * 5 + i) * 0.3;
    const size = 6 + Math.sin(time * 4 + i) * 2;
    return { x, y, opacity, size };
  });

  // ---------- Logo entrance (scalePopLogo) ----------
  const logoEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const logoOpacity = interpolate(logoEntrance, [0, 0.5, 1], [0, 1, 1], clamp);
  const logoScale = interpolate(logoEntrance, [0, 0.5, 1], [0.2, 1.05, 1], clamp);
  const logoRotate = interpolate(logoEntrance, [0, 0.5, 1], [-10, 1, 0], clamp);
  const logoBlur = interpolate(logoEntrance, [0, 0.5, 1], [10, 0, 0], clamp);

  // Logo continuous float (3s cycle)
  const logoFloatY = Math.sin((time / 3) * Math.PI * 2) * 4;
  const logoFloatRotate = Math.sin((time / 3) * Math.PI * 2) * 1;

  // ---------- Title entrance (riseGlow) with staggered letters ----------
  const titleEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  });
  const titleOpacity = interpolate(titleEntrance, [0, 0.4, 1], [0, 0.9, 1], clamp);
  const titleTranslateY = interpolate(titleEntrance, [0, 0.4, 1], [100, -12, 0], clamp);
  const titleScale = interpolate(titleEntrance, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntrance, [0, 0.4, 1], [8, 0, 0], clamp);

  // Staggered letter animation for "Demandez votre démo gratuite"
  const letters = "Demandez votre démo gratuite".split("");
  const letterStagger = (index: number, total: number) => {
    const startDelay = 0.2 + index * 0.02;
    const progress = interpolate(frame, [startDelay * fps, (startDelay + 0.3) * fps], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
    const translateY = interpolate(progress, [0, 1], [30, 0]);
    const opacity = progress;
    return { translateY, opacity };
  };

  // ---------- Subtitle entrance (slideUpFade) with wave ----------
  const subtitleEntrance = interpolate(frame, [0, 0.85 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const subtitleOpacity = interpolate(subtitleEntrance, [0, 1], [0, 1], clamp);
  const subtitleTranslateY = interpolate(subtitleEntrance, [0, 1], [70, 0], clamp);
  const subtitleScale = interpolate(subtitleEntrance, [0, 1], [0.95, 1], clamp);
  const subtitleBlur = interpolate(subtitleEntrance, [0, 1], [6, 0], clamp);
  // Wave effect after entrance (continuous)
  const subtitleWave = Math.sin(time * 4) * 2; // slight vertical bounce

  // ---------- CTA button entrance (scalePopButton) with glow pulse ----------
  const buttonEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const buttonOpacity = interpolate(buttonEntrance, [0, 0.5, 1], [0, 1, 1], clamp);
  const buttonScale = interpolate(buttonEntrance, [0, 0.5, 1], [0.85, 1.02, 1], clamp);
  const buttonTranslateY = interpolate(buttonEntrance, [0, 0.5, 1], [40, -4, 0], clamp);
  const buttonBlur = interpolate(buttonEntrance, [0, 0.5, 1], [8, 0, 0], clamp);
  // Glow pulse (continuous after entrance)
  const buttonGlow = pulseValue(time - 0.9, 2);
  const buttonShadow = interpolate(buttonGlow, [-1, 1], [0, 30]);

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
        background: "linear-gradient(135deg, #0A1A3A 0%, #1E3A8A 100%)",
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
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
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
          opacity: 0.25,
          top: "10%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.3), transparent)",
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
          opacity: 0.25,
          bottom: "-20%",
          right: "-15%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15), transparent)",
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
          opacity: 0.25,
          top: "50%",
          left: "70%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.25), transparent)",
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
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
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
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
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
        const bgColor = sparkProgress < 0.3 ? "#ffffff" : "#a0c4ff";
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
            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 60%, transparent 85%)",
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
          gap: 70,
          zIndex: 20,
          maxWidth: 3000,
          width: "85%",
          position: "relative",
          backdropFilter: "blur(2px)",
          padding: "60px 0",
        }}
      >
        {/* Logo with rotating ring */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 280,
              height: 280,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              transform: `translate(-50%, -50%) rotate(${ringRotate}deg) scale(${ringScale})`,
              boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
              opacity: logoOpacity,
              transform: `translateY(${logoFloatY}px) rotate(${logoFloatRotate}deg) scale(${logoScale}) rotate(${logoRotate}deg)`,
              filter: `blur(${logoBlur}px) drop-shadow(0 20px 40px rgba(0,0,0,0.3))`,
            }}
          >
            <img
              src={staticFile("logo.png")}
              style={{
                height: 200,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
              alt="ShipTrack"
            />
          </div>
        </div>

        {/* Title with staggered letters */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1.2,
            textAlign: "center",
            letterSpacing: "-0.02em",
            color: "white",
            textShadow: "0 10px 30px rgba(0,0,0,0.3)",
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          <div>
            {letters.map((char, i) => {
              const { translateY, opacity: charOpacity } = letterStagger(i, letters.length);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: `translateY(${translateY}px)`,
                    opacity: charOpacity,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </div>
          <br />
          <span style={{ opacity: 0.75, fontWeight: 700 }}>dès maintenant.</span>
        </div>

        {/* Subtitle with wave */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 300,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(4px)",
            padding: "12px 40px",
            borderRadius: 80,
            display: "inline-block",
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY + subtitleWave}px) scale(${subtitleScale})`,
            filter: `blur(${subtitleBlur}px)`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          Contrôlez vos opérations. Maîtrisez vos marges et bien plus.
        </div>

        {/* CTA Button with particles */}
        <div style={{ position: "relative" }}>
          {/* Particles around button */}
          {particles.map((part, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: part.size,
                height: part.size,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.6)",
                transform: `translate(calc(-50% + ${part.x}px), calc(-50% + ${part.y}px))`,
                opacity: part.opacity,
                pointerEvents: "none",
                filter: "blur(1px)",
              }}
            />
          ))}
          <div
            style={{
              background: "white",
              borderRadius: 30,
              padding: "40px 120px",
              fontSize: 60,
              fontWeight: 800,
              color: "#1E3A8A",
              cursor: "pointer",
              boxShadow: `0 20px 80px rgba(0,0,0,0.2), 0 0 ${buttonShadow}px rgba(255,255,255,0.6)`,
              letterSpacing: 2,
              backdropFilter: "blur(4px)",
              opacity: buttonOpacity,
              transform: `translateY(${buttonTranslateY}px) scale(${buttonScale})`,
              filter: `blur(${buttonBlur}px)`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            Commencer maintenant →
          </div>
        </div>
      </div>
    </div>
  );
};