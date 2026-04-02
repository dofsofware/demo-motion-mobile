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

export const Scene7 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  // ---------- Impact flash (covers entire screen, 0.55s duration) ----------
  const flashProgress = interpolate(frame, [0, 0.55 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  // Flash opacity: 0% -> 0.85, 40% -> 0.3, 100% -> 0
  const flashOpacity = interpolate(flashProgress, [0, 0.4, 1], [0.85, 0.3, 0], clamp);
  const flashVisible = flashOpacity > 0;

  // ---------- Shock rings (4 rings, different delays) ----------
  const shockRingScale = (delaySec: number, durationSec = 0.9) => {
    const start = delaySec;
    const end = start + durationSec;
    if (frame < start * fps) return 0;
    const progress = interpolate(frame, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 0.6, 0.36, 1),
    });
    return progress; // scale from 0 to 1
  };
  const shockRingOpacity = (delaySec: number, durationSec = 0.9) => {
    const start = delaySec;
    const end = start + durationSec;
    if (frame < start * fps) return 0;
    const progress = interpolate(frame, [start * fps, end * fps], [0, 1], clamp);
    // opacity: 0.9 at start, 0 at end
    return interpolate(progress, [0, 0.6, 1], [0.9, 0.7, 0], clamp);
  };

  const ring1Scale = shockRingScale(0.05);
  const ring1Opacity = shockRingOpacity(0.05);
  const ring2Scale = shockRingScale(0.18);
  const ring2Opacity = shockRingOpacity(0.18);
  const ring3Scale = shockRingScale(0.32);
  const ring3Opacity = shockRingOpacity(0.32);
  const ring4Scale = shockRingScale(0.48);
  const ring4Opacity = shockRingOpacity(0.48);

  // ---------- Shock lines (12 lines, delay 0.03s, duration 0.6s) ----------
  const lineBlastProgress = () => {
    const start = 0.03;
    const end = start + 0.6;
    if (frame < start * fps) return 0;
    const progress = interpolate(frame, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    return progress;
  };
  const lineProgress = lineBlastProgress();
  const lineScaleX = interpolate(lineProgress, [0, 0.5, 1], [0, 1, 1.2], clamp);
  const lineOpacity = interpolate(lineProgress, [0, 0.5, 1], [0.85, 0.6, 0], clamp);
  const lineWidth = 1000; // px for main lines, 600 for secondary

  // ---------- Badge entrance (delay 0.1s, duration 0.65s) ----------
  const badgeStart = 0.1;
  const badgeEnd = badgeStart + 0.65;
  const badgeEntrance = interpolate(frame, [badgeStart * fps, badgeEnd * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.55, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(
    badgeEntrance,
    [0, 0.55, 0.75, 1],
    [-200, 12, -4, 0],
    clamp
  );
  const badgeScale = interpolate(
    badgeEntrance,
    [0, 0.55, 0.75, 1],
    [0.7, 1.03, 0.98, 1],
    clamp
  );
  const badgeBlur = interpolate(badgeEntrance, [0, 0.55, 1], [8, 0, 0], clamp);

  // Badge infinite glow (starts after 0.8s)
  const badgePulse = pulseValue(time - 0.8, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.4, 0.8]);

  // Dot inside badge (continuous)
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Hand icon (smash entrance, then float + glow) ----------
  const handStart = 0;
  const handEnd = handStart + 0.7;
  const handEntrance = interpolate(frame, [handStart * fps, handEnd * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.12, 0.9, 0.2, 1.15),
  });
  const handOpacity = interpolate(handEntrance, [0, 0.55, 1], [0, 1, 1], clamp);
  const handTranslateY = interpolate(
    handEntrance,
    [0, 0.55, 0.75, 1],
    [-400, 18, -6, 0],
    clamp
  );
  const handScale = interpolate(
    handEntrance,
    [0, 0.55, 0.75, 1],
    [1.4, 0.95, 1.02, 1],
    clamp
  );
  const handRotate = interpolate(
    handEntrance,
    [0, 0.55, 0.75, 1],
    [-8, 1, -0.5, 0],
    clamp
  );
  const handBlur = interpolate(handEntrance, [0, 0.55, 1], [6, 0, 0], clamp);

  // After entrance, float and glow (starts after 0.9s)
  const handFloatY = Math.sin(((time - 0.9) / 3.5) * Math.PI * 2) * 6;
  const handFloatRotate = Math.sin(((time - 0.9) / 3.5) * Math.PI * 2) * 1.5;
  const handGlow = pulseValue(time - 0.9, 2);
  const handGlowShadow = interpolate(handGlow, [-1, 1], [0, 60]);

  // ---------- STOP letters (individual animations) ----------
  const letterStartTimes = [0.05, 0.12, 0.19, 0.26, 0.38]; // S, T, O, P, .
  const letterDurations = [0.5, 0.5, 0.5, 0.5, 0.4];
  // Each letter has its own direction/easing
  const letterProgress = (index: number) => {
    const start = letterStartTimes[index];
    const end = start + letterDurations[index];
    if (frame < start * fps) return 0;
    return interpolate(frame, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  };

  // For each letter, we need specific transform and opacity
  // S: from left
  const sProgress = letterProgress(0);
  const sOpacity = sProgress;
  const sTranslateX = interpolate(sProgress, [0, 0.6, 1], [-280, 10, 0], clamp);
  const sScale = interpolate(sProgress, [0, 0.6, 1], [0.8, 1.02, 1], clamp);
  const sBlur = interpolate(sProgress, [0, 0.6, 1], [8, 0, 0], clamp);

  // T: from top
  const tProgress = letterProgress(1);
  const tOpacity = tProgress;
  const tTranslateY = interpolate(tProgress, [0, 0.6, 1], [-280, 10, 0], clamp);
  const tScale = interpolate(tProgress, [0, 0.6, 1], [0.8, 1.02, 1], clamp);
  const tBlur = interpolate(tProgress, [0, 0.6, 1], [8, 0, 0], clamp);

  // O: from bottom
  const oProgress = letterProgress(2);
  const oOpacity = oProgress;
  const oTranslateY = interpolate(oProgress, [0, 0.6, 1], [280, -10, 0], clamp);
  const oScale = interpolate(oProgress, [0, 0.6, 1], [0.8, 1.02, 1], clamp);
  const oBlur = interpolate(oProgress, [0, 0.6, 1], [8, 0, 0], clamp);

  // P: from right
  const pProgress = letterProgress(3);
  const pOpacity = pProgress;
  const pTranslateX = interpolate(pProgress, [0, 0.6, 1], [280, -10, 0], clamp);
  const pScale = interpolate(pProgress, [0, 0.6, 1], [0.8, 1.02, 1], clamp);
  const pBlur = interpolate(pProgress, [0, 0.6, 1], [8, 0, 0], clamp);

  // Dot: pop (scale + rotate)
  const dotProgress = letterProgress(4);
  const textDotOpacity  = dotProgress;
  const dotScalePop = interpolate(textDotOpacity , [0, 0.6, 1], [0, 1.3, 1], clamp);
  const dotRotate = interpolate(textDotOpacity , [0, 0.6, 1], [180, -5, 0], clamp);

  // Title overall micro‑vibration after letters appear (stopImpact)
  const titleImpactStart = 0.08;
  const titleImpactEnd = titleImpactStart + 0.55;
  const titleImpactProgress = interpolate(
    frame,
    [titleImpactStart * fps, titleImpactEnd * fps],
    [0, 1],
    { ...clamp, easing: Easing.bezier(0.12, 0.8, 0.2, 1.2) }
  );
  const titleScale = interpolate(
    titleImpactProgress,
    [0, 0.15, 0.3, 0.5, 1],
    [1, 1.015, 0.997, 1.005, 1],
    clamp
  );
  const titleTranslateY = interpolate(
    titleImpactProgress,
    [0, 0.15, 0.3, 1],
    [0, -3, 2, 0],
    clamp
  );
  const titleShadow = interpolate(titleImpactProgress, [0, 1], [0, 80], clamp);

  // ---------- Subtitle (rise from bottom, delay 0.55s) ----------
  const subStart = 0.55;
  const subEnd = subStart + 0.7;
  const subEntrance = interpolate(frame, [subStart * fps, subEnd * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const subOpacity = interpolate(subEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const subTranslateY = interpolate(subEntrance, [0, 0.6, 1], [80, -6, 0], clamp);
  const subScale = interpolate(subEntrance, [0, 0.6, 1], [0.95, 1.01, 1], clamp);
  const subBlur = interpolate(subEntrance, [0, 0.6, 1], [6, 0, 0], clamp);

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
          "radial-gradient(circle at 50% 30%, #0F2B6D 0%, #0A1A3A 100%)",
        fontFamily: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      {/* Background elements (grid, orbs, lines, sparks, pulse ring) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
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
              background: "white",
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
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 60%, transparent 85%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulseRingScale})`,
          opacity: pulseRingOpacity,
          zIndex: 0,
        }}
      />

      {/* Flash impact */}
      {flashVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: flashOpacity,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}

      {/* Shockwave container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        {/* Rings */}
        {ring1Scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.6)",
              transform: `translate(-50%, -50%) scale(${ring1Scale})`,
              opacity: ring1Opacity,
            }}
          />
        )}
        {ring2Scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.35)",
              transform: `translate(-50%, -50%) scale(${ring2Scale})`,
              opacity: ring2Opacity,
            }}
          />
        )}
        {ring3Scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 1400,
              height: 1400,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.15)",
              transform: `translate(-50%, -50%) scale(${ring3Scale})`,
              opacity: ring3Opacity,
            }}
          />
        )}
        {ring4Scale > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 2400,
              height: 2400,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.07)",
              transform: `translate(-50%, -50%) scale(${ring4Scale})`,
              opacity: ring4Opacity,
            }}
          />
        )}

        {/* Radial lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: lineWidth,
              height: 3,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)",
              transformOrigin: "left center",
              transform: `rotate(${angle}deg) scaleX(${lineScaleX})`,
              opacity: lineOpacity,
            }}
          />
        ))}
        {[22.5, 67.5, 112.5, 157.5].map((angle, i) => (
          <div
            key={i + 8}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 600,
              height: 3,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)",
              transformOrigin: "left center",
              transform: `rotate(${angle}deg) scaleX(${lineScaleX})`,
              opacity: lineOpacity,
            }}
          />
        ))}
      </div>

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
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(255,255,255,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 15px 30px -10px rgba(0,0,0,0.2), 0 0 0 ${badgeRingSize}px rgba(255,255,255,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "white",
              borderRadius: "50%",
              opacity: dotOpacity,
              boxShadow: `0 0 12px white, 0 0 0 ${dotShadow}px rgba(255,255,255,0.4)`,
              transform: `scale(${dotScale})`,
            }}
          />
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "white",
            }}
          >
            STOP
          </span>
        </div>

        {/* Hand icon */}
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "3px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 150,
            opacity: handOpacity,
            transform: `translateY(${handTranslateY + handFloatY}px) scale(${handScale}) rotate(${handRotate + handFloatRotate}deg)`,
            filter: `blur(${handBlur}px)`,
            boxShadow: `0 20px 40px -10px rgba(0,0,0,0.4), 0 0 ${handGlowShadow}px rgba(255,255,255,0.12)`,
          }}
        >
          ✋
        </div>

        {/* STOP letters */}
        <div
          style={{
            fontSize: 260,
            fontWeight: 800,
            lineHeight: 1,
            textAlign: "center",
            letterSpacing: "-0.04em",
            color: "white",
            textShadow: `0 0 ${titleShadow}px rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.5)`,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            maxWidth: 2800,
            margin: "0 auto",
          }}
        >
          <span
            style={{
              display: "inline-block",
              opacity: sOpacity,
              transform: `translateX(${sTranslateX}px) scale(${sScale})`,
              filter: `blur(${sBlur}px)`,
            }}
          >
            S
          </span>
          <span
            style={{
              display: "inline-block",
              opacity: tOpacity,
              transform: `translateY(${tTranslateY}px) scale(${tScale})`,
              filter: `blur(${tBlur}px)`,
            }}
          >
            T
          </span>
          <span
            style={{
              display: "inline-block",
              opacity: oOpacity,
              transform: `translateY(${oTranslateY}px) scale(${oScale})`,
              filter: `blur(${oBlur}px)`,
            }}
          >
            O
          </span>
          <span
            style={{
              display: "inline-block",
              opacity: pOpacity,
              transform: `translateX(${pTranslateX}px) scale(${pScale})`,
              filter: `blur(${pBlur}px)`,
            }}
          >
            P
          </span>
          <span
            style={{
              display: "inline-block",
              opacity: dotOpacity,
              transform: `scale(${dotScalePop}) rotate(${dotRotate}deg)`,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            .
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 300,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.01em",
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(4px)",
            padding: "12px 40px",
            borderRadius: 80,
            display: "inline-block",
            opacity: subOpacity,
            transform: `translateY(${subTranslateY}px) scale(${subScale})`,
            filter: `blur(${subBlur}px)`,
          }}
        >
          Il est temps de changer.
        </div>
      </div>
    </div>
  );
};