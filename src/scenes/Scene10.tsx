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

export const Scene10 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Helper for slideFromLeft (badge, title, subtitle) ----------
  const slideFromLeft = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const opacity = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(
      progress,
      [0, 0.6, 0.8, 1],
      [-260, 14, -4, 0],
      clamp
    );
    const scale = interpolate(progress, [0, 0.6, 0.8, 1], [0.92, 1.01, 0.998, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [8, 0, 0], clamp);
    return { opacity, translateX, scale, blur };
  };

  // ---------- Badge entrance + continuous glow ----------
  const badgeEntrance = slideFromLeft(0, 0.75);
  // Badge continuous glow (starts after 0.75s)
  const badgePulse = pulseValue(time - 0.75, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge (continuous, 1.6s cycle)
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Title entrance + continuous shine + word pulse ----------
  const titleEntrance = slideFromLeft(0.15, 0.85);
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Subtitle entrance ----------
  const subtitleEntrance = slideFromLeft(0.28, 0.85);

  // ---------- Right panel slideFromRight ----------
  const slideFromRight = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const opacity = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(
      progress,
      [0, 0.6, 0.8, 1],
      [260, -14, 4, 0],
      clamp
    );
    const scale = interpolate(progress, [0, 0.6, 0.8, 1], [0.92, 1.01, 0.998, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [8, 0, 0], clamp);
    return { opacity, translateX, scale, blur };
  };
  const panelEntrance = slideFromRight(0.1, 0.9);

  // Status dots continuous pulse (2s cycle with different phases)
  const dotPulsePhase = (phaseSec: number) => {
    const p = pulseValue(time + phaseSec, 2);
    const shadowScale = interpolate(p, [-1, 1], [8, 20]);
    const scale = interpolate(p, [-1, 1], [1, 1.15]);
    return { shadowScale, scale };
  };
  const dotGreen = dotPulsePhase(0);
  const dotOrange = dotPulsePhase(0.6);
  const dotBlue = dotPulsePhase(1.2);

  // ---------- Tracker section slideUp ----------
  const slideUp = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const opacity = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [80, -6, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.96, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [6, 0, 0], clamp);
    return { opacity, translateY, scale, blur };
  };
  const trackerEntrance = slideUp(0.35, 0.85);

  // Progress fill: width from 0% to 72% over 2s, delay 0.6s
  const progressStart = 0.6;
  const progressDuration = 2;
  let progressFillWidth = 0;
  if (frame >= progressStart * fps) {
    const progress = interpolate(
      frame,
      [progressStart * fps, (progressStart + progressDuration) * fps],
      [0, 1],
      { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) }
    );
    progressFillWidth = interpolate(progress, [0, 1], [0, 72]);
  }

  // Steps: staggered pop animations
  const stepPop = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    if (frame < startFrame) return { opacity: 0, transform: "translateY(30px) scale(0.88)" };
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const opacity = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [30, -4, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.88, 1.03, 1], clamp);
    return { opacity, transform: `translateY(${translateY}px) scale(${scale})` };
  };

  const step1Pop = stepPop(0.7, 0.5);
  const step2Pop = stepPop(0.95, 0.5);
  const step3Pop = stepPop(1.2, 0.5);
  const step4Pop = stepPop(1.45, 0.5);
  const step5Pop = stepPop(1.7, 0.5);

  // Continuous animations for step icons
  const iconGlow = (duration: number, scaleFactor: number = 1.06) => {
    const wave = pulseValue(time, duration);
    const shadowScale = interpolate(wave, [-1, 1], [6, 12]);
    const scale = interpolate(wave, [-1, 1], [1, scaleFactor]);
    return { shadowScale, scale };
  };
  const iconDoneGlow = iconGlow(2.5); // iconGlowBlue: box-shadow scale 6->12, no scale change
  const iconActiveGlow = iconGlow(1.4, 1.06); // iconGlowActive: scale + shadow
  const iconWarnGlow = iconGlow(1.4, 1.06); // same as active but with warn color
  const activeBadgePing = pulseValue(time, 1.4);
  const badgePingShadow = interpolate(activeBadgePing, [-1, 1], [0, 8]);

  // For step 4 (warn) we also have warn badge ping
  const warnBadgePing = pulseValue(time, 1.4);
  const warnBadgePingShadow = interpolate(warnBadgePing, [-1, 1], [0, 8]);

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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

      {/* Main content (top section) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 180,
          zIndex: 20,
          padding: "0 280px",
          width: "100%",
          position: "relative",
          flex: "0 0 auto",
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
              opacity: badgeEntrance.opacity,
              transform: `translateX(${badgeEntrance.translateX}px) scale(${badgeEntrance.scale})`,
              filter: `blur(${badgeEntrance.blur}px)`,
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
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
              }}
            >
              TEMPS RÉEL
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 1.1,
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: titleEntrance.opacity,
              transform: `translateX(${titleEntrance.translateX}px) scale(${titleEntrance.scale})`,
              filter: `blur(${titleEntrance.blur}px)`,
            }}
          >
            Suivez tous vos dossiers<br />
            en{" "}
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
              temps réel
            </span>
            .
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              color: "#2C3E66",
              lineHeight: 1.2,
              opacity: subtitleEntrance.opacity,
              transform: `translateX(${subtitleEntrance.translateX}px) scale(${subtitleEntrance.scale})`,
              filter: `blur(${subtitleEntrance.blur}px)`,
            }}
          >
            Accès instantané · Vue globale · Zéro angle mort
          </div>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: "0 0 900px",
            background: "rgba(224,237,255,0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: 40,
            padding: 60,
            border: "2px solid rgba(37,99,235,0.3)",
            boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
            opacity: panelEntrance.opacity,
            transform: `translateX(${panelEntrance.translateX}px) scale(${panelEntrance.scale})`,
            filter: `blur(${panelEntrance.blur}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "40px 0",
              borderBottom: "2px solid rgba(30,58,138,0.1)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#22C55E",
                boxShadow: `0 0 8px #22C55E, 0 0 0 ${dotGreen.shadowScale}px rgba(255,255,255,0.2)`,
                transform: `scale(${dotGreen.scale})`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#0F2B6D", marginBottom: 8 }}>
                Dossier #2847
              </div>
              <div style={{ fontSize: 32, color: "#2C3E66" }}>Arrivée Dakar – En transit</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "40px 0",
              borderBottom: "2px solid rgba(30,58,138,0.1)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#F59E0B",
                boxShadow: `0 0 8px #F59E0B, 0 0 0 ${dotOrange.shadowScale}px rgba(255,255,255,0.2)`,
                transform: `scale(${dotOrange.scale})`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#0F2B6D", marginBottom: 8 }}>
                Dossier #2846
              </div>
              <div style={{ fontSize: 32, color: "#2C3E66" }}>Dédouanement – En attente</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#1D4ED8",
                boxShadow: `0 0 8px #1D4ED8, 0 0 0 ${dotBlue.shadowScale}px rgba(255,255,255,0.2)`,
                transform: `scale(${dotBlue.scale})`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#0F2B6D", marginBottom: 8 }}>
                Dossier #2845
              </div>
              <div style={{ fontSize: 32, color: "#2C3E66" }}>Livraison – Confirmée</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracker section */}
      <div
        style={{
          zIndex: 20,
          width: "100%",
          padding: "0 280px",
          flex: "0 0 auto",
          marginTop: 80,
          opacity: trackerEntrance.opacity,
          transform: `translateY(${trackerEntrance.translateY}px) scale(${trackerEntrance.scale})`,
          filter: `blur(${trackerEntrance.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: "#2C3E66",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          Suivi · Dossier #2847 — Shanghai → Dakar
        </div>

        <div
          style={{
            background: "rgba(224,237,255,0.65)",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(37,99,235,0.2)",
            borderRadius: 30,
            padding: "50px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Progress rail */}
          <div
            style={{
              position: "relative",
              height: 8,
              background: "rgba(37,99,235,0.12)",
              borderRadius: 8,
              marginBottom: 50,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progressFillWidth}%`,
                background: "linear-gradient(90deg, #1E3A8A, #2563EB, #60A5FA)",
                borderRadius: 8,
                boxShadow: "0 0 12px rgba(37,99,235,0.5)",
              }}
            />
          </div>

          {/* Steps */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                flex: 1,
                position: "relative",
                opacity: step1Pop.opacity,
                transform: step1Pop.transform,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -59,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#1D4ED8",
                  boxShadow: "0 0 0 5px rgba(29,78,216,0.2)",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  background: "#1D4ED8",
                  color: "white",
                  boxShadow: `0 0 0 ${iconDoneGlow.shadowScale}px rgba(29,78,216,0.15), 0 8px 20px rgba(29,78,216,0.3)`,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
                Embarquement
              </div>
              <div style={{ fontSize: 24, color: "#2C3E66", textAlign: "center" }}>
                Shanghai<br />14 mars
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                flex: 1,
                position: "relative",
                opacity: step2Pop.opacity,
                transform: step2Pop.transform,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -59,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#1D4ED8",
                  boxShadow: "0 0 0 5px rgba(29,78,216,0.2)",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  background: "#1D4ED8",
                  color: "white",
                  boxShadow: `0 0 0 ${iconDoneGlow.shadowScale}px rgba(29,78,216,0.15), 0 8px 20px rgba(29,78,216,0.3)`,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
                Départ navire
              </div>
              <div style={{ fontSize: 24, color: "#2C3E66", textAlign: "center" }}>
                Port Shanghai<br />15 mars
              </div>
            </div>

            {/* Step 3 (active) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                flex: 1,
                position: "relative",
                opacity: step3Pop.opacity,
                transform: step3Pop.transform,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -59,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#2563EB",
                  boxShadow: "0 0 0 5px rgba(37,99,235,0.2)",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  background: "#2563EB",
                  color: "white",
                  transform: `scale(${iconActiveGlow.scale})`,
                  boxShadow: `0 0 0 ${iconActiveGlow.shadowScale}px rgba(37,99,235,0.2), 0 8px 24px rgba(37,99,235,0.35)`,
                }}
              >
                ⟳
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
                En mer
              </div>
              <div style={{ fontSize: 24, color: "#2C3E66", textAlign: "center" }}>
                Océan Indien<br />28 mars
              </div>
              <div
                style={{
                  background: "#2563EB",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 3,
                  padding: "6px 20px",
                  borderRadius: 40,
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 0 ${badgePingShadow}px rgba(37,99,235,0.4)`,
                }}
              >
                EN COURS
              </div>
            </div>

            {/* Step 4 (warn) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                flex: 1,
                position: "relative",
                opacity: step4Pop.opacity,
                transform: step4Pop.transform,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -59,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  boxShadow: "0 0 0 5px rgba(245,158,11,0.2)",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  background: "#F59E0B",
                  color: "white",
                  transform: `scale(${iconWarnGlow.scale})`,
                  boxShadow: `0 0 0 ${iconWarnGlow.shadowScale}px rgba(245,158,11,0.2), 0 8px 24px rgba(245,158,11,0.35)`,
                }}
              >
                !
              </div>
              <div style={{ fontSize: 30, fontWeight: 600, color: "#0F2B6D", textAlign: "center" }}>
                Dédouanement
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "#B45309",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                Dakar<br />Doc manquant
              </div>
              <div
                style={{
                  background: "#F59E0B",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 3,
                  padding: "6px 20px",
                  borderRadius: 40,
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 0 ${warnBadgePingShadow}px rgba(245,158,11,0.4)`,
                }}
              >
                ALERTE
              </div>
            </div>

            {/* Step 5 (pending) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                flex: 1,
                position: "relative",
                opacity: step5Pop.opacity,
                transform: step5Pop.transform,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -59,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(37,99,235,0.2)",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  background: "rgba(224,237,255,0.9)",
                  color: "rgba(37,99,235,0.4)",
                  border: "2px dashed rgba(37,99,235,0.25)",
                }}
              >
                ○
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "rgba(37,99,235,0.35)",
                  textAlign: "center",
                }}
              >
                Livraison
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(44,62,102,0.35)",
                  textAlign: "center",
                }}
              >
                Client final<br />En attente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};