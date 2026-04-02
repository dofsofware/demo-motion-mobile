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

export const Scene16 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background elements (blue theme) ----------
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

  // ---------- Badge (slideDownPop) ----------
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

  // ---------- Title (riseGlow) ----------
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

  // ---------- Files section (slideUpFade) ----------
  const sectionEntrance = () => {
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
  const sectionAnim = sectionEntrance();

  // Card rise
  const cardRise = (delaySec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + 0.6) * fps;
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
  const card1Anim = cardRise(0.7);
  const card2Anim = cardRise(0.9);
  const card3Anim = cardRise(1.1);

  // Delayed card pulse on warning text (pulseRedBg)
  const warningPulse = () => {
    if (time < 1.1 + 0.6) return { shadowScale: 0 }; // after card rises
    const wave = pulseValue(time - 1.7, 1.4);
    const shadow = interpolate(wave, [-1, 1], [0, 12]);
    return { shadowScale: shadow };
  };
  const warningPulseStyle = warningPulse();

  // Success transition for delayed card
  const successTime = 3.3; // seconds after start (card appears at 0.9+0.6=1.5s, so success at 3.3s)
  const isSuccess = time >= successTime;

  // Flash effect (duration 0.6s)
  const flashProgress = () => {
    if (!isSuccess) return 0;
    const start = successTime;
    const end = successTime + 0.6;
    if (time >= end) return 1;
    const progress = (time - start) / 0.6;
    return progress;
  };
  const flashProgressValue = flashProgress();
  const flashOpacity = interpolate(flashProgressValue, [0, 0.3, 1], [0, 0.2, 0], clamp);
  const flashShadow = interpolate(flashProgressValue, [0, 0.3, 1], [0, 20, 0], clamp);

  // Status text and progress bar changes after success
  const delayedStatus = isSuccess ? "✓ Débloqué" : "⚠️ Retard";
  const delayedStatusClass = isSuccess ? "resolved" : "delayed";
  const warningMessage = isSuccess ? null : "🚨 Document manquant – intervention requise";
  const progressFillWidth = isSuccess ? 100 : 45;
  const progressBarColor = isSuccess ? "#22C55E" : "#EF4444";
  const buttonText = isSuccess ? "✅ Dossier débloqué" : "⚡ Intervenir & débloquer";
  const buttonBackground = isSuccess
    ? "linear-gradient(135deg, #22C55E, #15803D)"
    : "linear-gradient(135deg, #F59E0B, #DC2626)";

  // Particles effect: create a set of particles that appear at success time and fade out over 0.6s
  const particles = [];
  if (isSuccess) {
    const start = successTime;
    const end = successTime + 0.6;
    if (time >= start && time <= end) {
      const t = (time - start) / 0.6; // 0 to 1
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const opacity = interpolate(t, [0, 0.7, 1], [0.8, 0.6, 0], clamp);
        const scale = interpolate(t, [0, 0.7, 1], [0, 1.2, 0], clamp);
        particles.push({ tx, ty, opacity, scale, key: i });
      }
    }
  }

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
          width: 1000,
          height: 1000,
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
          gap: 70,
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
            INTERVENTION & DÉBLOCAGE
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 90,
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
          Vous identifiez les dossiers en retard<br />
          et vous{" "}
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
            débloquez
          </span>{" "}
          la situation en un clic.
        </div>

        {/* Files section */}
        <div
          style={{
            width: "100%",
            background: "rgba(224,237,255,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: 48,
            padding: "50px 60px",
            border: "2px solid rgba(37,99,235,0.25)",
            boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
            marginTop: 20,
            opacity: sectionAnim.opacity,
            transform: `translateY(${sectionAnim.translateY}px)`,
            filter: `blur(${sectionAnim.blur}px)`,
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#0F2B6D",
              marginBottom: 40,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            📋 Dossiers critiques
            <span style={{ fontSize: 28, fontWeight: 400, color: "#2C3E66" }}>– alerte temps réel</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 40,
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            {/* Dossier 1 */}
            <div
              style={{
                flex: 1,
                background: "white",
                borderRadius: 32,
                padding: "32px 28px",
                boxShadow: "0 15px 30px -12px rgba(0,0,0,0.1)",
                opacity: card1Anim.opacity,
                transform: `translateY(${card1Anim.translateY}px)`,
                filter: `blur(${card1Anim.blur}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 700, color: "#0F2B6D" }}>Dossier #2847</span>
                <span
                  style={{
                    padding: "6px 20px",
                    borderRadius: 40,
                    fontSize: 26,
                    fontWeight: 600,
                    background: "#F59E0B",
                    color: "white",
                  }}
                >
                  En cours
                </span>
              </div>
              <div style={{ marginBottom: 30 }}>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4, marginBottom: 16 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Shanghai → Dakar
                </div>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> En mer
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 24,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Progression</span>
                  <span>65%</span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: "rgba(37,99,235,0.1)",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "65%",
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #1E3A8A, #2563EB)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dossier 2 (delayed) */}
            <div
              style={{
                flex: 1,
                background: isSuccess ? "white" : "#FFF5F5",
                borderRadius: 32,
                padding: "32px 28px",
                boxShadow: "0 15px 30px -12px rgba(0,0,0,0.1)",
                border: isSuccess ? "none" : "2px solid #EF4444",
                position: "relative",
                overflow: "hidden",
                opacity: card2Anim.opacity,
                transform: `translateY(${card2Anim.translateY}px)`,
                filter: `blur(${card2Anim.blur}px)`,
              }}
            >
              {/* Success flash overlay */}
              {isSuccess && flashOpacity > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(34,197,94,0.2)",
                    boxShadow: `0 0 0 ${flashShadow}px rgba(34,197,94,0.2)`,
                    pointerEvents: "none",
                    zIndex: 10,
                    opacity: flashOpacity,
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 700, color: "#0F2B6D" }}>Dossier #2850</span>
                <span
                  style={{
                    padding: "6px 20px",
                    borderRadius: 40,
                    fontSize: 26,
                    fontWeight: 600,
                    background: delayedStatusClass === "resolved" ? "#22C55E" : "#EF4444",
                    color: "white",
                  }}
                >
                  {delayedStatus}
                </span>
              </div>
              <div style={{ marginBottom: 30 }}>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4, marginBottom: 16 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Le Havre → Abidjan
                </div>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> Dédouanement
                </div>
                {warningMessage && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "#EF4444",
                      color: "white",
                      borderRadius: 40,
                      padding: "8px 20px",
                      fontSize: 24,
                      fontWeight: 600,
                      marginTop: 16,
                      boxShadow: `0 0 0 ${warningPulseStyle.shadowScale}px rgba(239,68,68,0.4)`,
                    }}
                  >
                    {warningMessage}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 24,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Délai écoulé</span>
                  <span>{isSuccess ? "Débloqué" : "+48h"}</span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: "rgba(37,99,235,0.1)",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressFillWidth}%`,
                      borderRadius: 20,
                      background: progressBarColor,
                    }}
                  />
                </div>
              </div>
              <button
                style={{
                  background: buttonBackground,
                  border: "none",
                  borderRadius: 60,
                  padding: "18px 40px",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Sora', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  cursor: "default",
                  marginTop: 24,
                  width: "100%",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px -8px rgba(0,0,0,0.2)",
                  opacity: isSuccess ? 0.7 : 1,
                }}
              >
                {buttonText}
              </button>
            </div>

            {/* Dossier 3 */}
            <div
              style={{
                flex: 1,
                background: "white",
                borderRadius: 32,
                padding: "32px 28px",
                boxShadow: "0 15px 30px -12px rgba(0,0,0,0.1)",
                opacity: card3Anim.opacity,
                transform: `translateY(${card3Anim.translateY}px)`,
                filter: `blur(${card3Anim.blur}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 700, color: "#0F2B6D" }}>Dossier #2852</span>
                <span
                  style={{
                    padding: "6px 20px",
                    borderRadius: 40,
                    fontSize: 26,
                    fontWeight: 600,
                    background: "#F59E0B",
                    color: "white",
                  }}
                >
                  En cours
                </span>
              </div>
              <div style={{ marginBottom: 30 }}>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4, marginBottom: 16 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Marseille → Casablanca
                </div>
                <div style={{ fontSize: 28, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> Transport
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 24,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Progression</span>
                  <span>30%</span>
                </div>
                <div
                  style={{
                    height: 12,
                    background: "rgba(37,99,235,0.1)",
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "30%",
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #1E3A8A, #2563EB)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Particles */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 8,
            height: 8,
            background: "#22C55E",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 100,
            transform: `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) scale(${p.scale})`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};