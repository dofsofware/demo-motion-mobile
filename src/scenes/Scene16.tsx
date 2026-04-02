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
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;
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
    [1, 1.05],
    clamp
  );

  // ---------- Background elements responsives ----------
  const gridSize = isPortrait ? 96 : 140;
  const gridOffset = (time / 18) * gridSize;

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
    { top: "20%", left: "15%", size: isPortrait ? 8 : 10, delay: 0 },
    { top: "65%", left: "85%", size: isPortrait ? 5 : 6, delay: 0.7 },
    { top: "80%", left: "30%", size: isPortrait ? 6 : 8, delay: 1.2 },
    { top: "40%", left: "72%", size: isPortrait ? 5 : 6, delay: 0.3 },
    { top: "15%", left: "88%", size: isPortrait ? 5 : 6, delay: 1.8 },
  ];

  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  // ---------- Badge (slideDownPop adapté) ----------
  const badgeEntrance = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.3, 0.55, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(badgeEntrance, [0, 0.6, 1], [isPortrait ? -40 : -80, 8, 0], clamp);
  const badgeScale = interpolate(badgeEntrance, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, isPortrait ? 8 : 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacityVal = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Title (riseGlow adapté) ----------
  const titleEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  });
  const titleOpacity = interpolate(titleEntrance, [0, 0.4, 1], [0, 0.9, 1], clamp);
  const titleTranslateY = interpolate(titleEntrance, [0, 0.4, 1], [isPortrait ? 50 : 100, -12, 0], clamp);
  const titleScale = interpolate(titleEntrance, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntrance, [0, 0.4, 1], [8, 0, 0], clamp);

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Files section (slideUpFade adapté) ----------
  const sectionEntrance = () => {
    const start = 0.5 * fps;
    const end = (0.5 + 0.8) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? 40 : 80, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [isPortrait ? 40 : 80, 0]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, blur };
  };
  const sectionAnim = sectionEntrance();

  // Card rise (adapté)
  const cardRise = (delaySec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + 0.6) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? 30 : 40, blur: 4 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [isPortrait ? 30 : 40, 0]);
    const blur = interpolate(progress, [0, 1], [4, 0]);
    return { opacity: op, translateY, blur };
  };
  const card1Anim = cardRise(0.7);
  const card2Anim = cardRise(0.9);
  const card3Anim = cardRise(1.1);

  // Warning pulse (identique)
  const warningPulse = () => {
    if (time < 1.1 + 0.6) return { shadowScale: 0 };
    const wave = pulseValue(time - 1.7, 1.4);
    const shadow = interpolate(wave, [-1, 1], [0, 12]);
    return { shadowScale: shadow };
  };
  const warningPulseStyle = warningPulse();

  // Success transition (identique)
  const successTime = 3.3;
  const isSuccess = time >= successTime;

  const flashProgressValue = (() => {
    if (!isSuccess) return 0;
    const start = successTime;
    const end = successTime + 0.6;
    if (time >= end) return 1;
    return (time - start) / 0.6;
  })();
  const flashOpacity = interpolate(flashProgressValue, [0, 0.3, 1], [0, 0.2, 0], clamp);
  const flashShadow = interpolate(flashProgressValue, [0, 0.3, 1], [0, 20, 0], clamp);

  const delayedStatus = isSuccess ? "✓ Débloqué" : "⚠️ Retard";
  const delayedStatusClass = isSuccess ? "resolved" : "delayed";
  const warningMessage = isSuccess ? null : "🚨 Document manquant – intervention requise";
  const progressFillWidth = isSuccess ? 100 : 45;
  const progressBarColor = isSuccess ? "#22C55E" : "#EF4444";
  const buttonText = isSuccess ? "✅ Dossier débloqué" : "⚡ Intervenir & débloquer";
  const buttonBackground = isSuccess
    ? "linear-gradient(135deg, #22C55E, #15803D)"
    : "linear-gradient(135deg, #F59E0B, #DC2626)";

  // Particles (identiques)
  const particles = [];
  if (isSuccess) {
    const start = successTime;
    const end = successTime + 0.6;
    if (time >= start && time <= end) {
      const t = (time - start) / 0.6;
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

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.85);
  const mainGap = isPortrait ? height * 0.05 : 70;
  const badgeFontSize = isPortrait ? 28 : 38;
  const badgePadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 16 : 20;
  const titleFontSize = isPortrait ? 52 : 90;
  const titleLineHeight = isPortrait ? 1.2 : 1.2;
  const sectionPadding = isPortrait ? "30px 24px" : "50px 60px";
  const sectionBorderRadius = isPortrait ? 32 : 48;
  const sectionTitleFontSize = isPortrait ? 32 : 44;
  const sectionSubFontSize = isPortrait ? 20 : 28;
  const cardsDirection = isPortrait ? "column" : "row";
  const cardsGap = isPortrait ? 30 : 40;
  const cardPadding = isPortrait ? "24px 20px" : "32px 28px";
  const cardBorderRadius = isPortrait ? 24 : 32;
  const cardTitleFontSize = isPortrait ? 28 : 34;
  const cardStatusFontSize = isPortrait ? 20 : 26;
  const cardStatusPadding = isPortrait ? "4px 14px" : "6px 20px";
  const cardTextFontSize = isPortrait ? 22 : 28;
  const cardProgressFontSize = isPortrait ? 18 : 24;
  const buttonFontSize = isPortrait ? 24 : 30;
  const buttonPadding = isPortrait ? "14px 24px" : "18px 40px";
  const buttonGap = isPortrait ? 12 : 18;

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
      {/* Grille dynamique */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(30, 58, 138, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.045) 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${gridOffset}px ${gridOffset}px`,
          pointerEvents: "none",
        }}
      />

      {/* Orbes flottants */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 480 : 800,
          height: isPortrait ? 480 : 800,
          borderRadius: "50%",
          filter: `blur(${isPortrait ? 70 : 90}px)`,
          opacity: 0.42,
          top: isPortrait ? "4%" : "10%",
          left: isPortrait ? "-12%" : "-10%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.2), rgba(37,99,235,0))",
          transform: `translate(${orb1Progress * 40}px, ${orb1Progress * 64}px) scale(${1 + orb1Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 720 : 1100,
          height: isPortrait ? 720 : 1100,
          borderRadius: "50%",
          filter: `blur(${isPortrait ? 70 : 90}px)`,
          opacity: 0.36,
          bottom: isPortrait ? "-10%" : "-20%",
          right: isPortrait ? "-20%" : "-15%",
          background:
            "radial-gradient(circle, rgba(15,43,109,0.18), rgba(15,43,109,0))",
          transform: `translate(${orb2Progress * -45}px, ${orb2Progress * -72}px) scale(${1 + orb2Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 360 : 500,
          height: isPortrait ? 360 : 500,
          borderRadius: "50%",
          filter: `blur(${isPortrait ? 55 : 70}px)`,
          opacity: 0.38,
          top: "48%",
          left: isPortrait ? "58%" : "70%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.25), rgba(37,99,235,0))",
          transform: `translate(${orb3Progress * 25}px, ${orb3Progress * 40}px) scale(${1 + orb3Progress * 0.05})`,
        }}
      />

      {/* Lignes flottantes */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
          top: isPortrait ? "28%" : "35%",
          left: "-50%",
          transform: `translateX(${line1Translate}%) rotate(${isPortrait ? 5 : 8}deg)`,
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
          top: isPortrait ? "68%" : "70%",
          left: "-40%",
          transform: `translateX(${line2Translate}%) rotate(${isPortrait ? -3 : -5}deg)`,
          opacity: line2Opacity,
          zIndex: 1,
        }}
      />

      {/* Étincelles */}
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

      {/* Anneau pulsant central */}
      <div
        style={{
          position: "absolute",
          width: isPortrait ? 760 : 1000,
          height: isPortrait ? 760 : 1000,
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

      {/* Contenu principal centré */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          maxWidth: 3000,
          width: contentWidth,
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
            gap: badgeGap,
            background: "rgba(224,237,255,0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: badgePadding,
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
          }}
        >
          <div
            style={{
              width: badgeDotSize,
              height: badgeDotSize,
              background: "#2563EB",
              borderRadius: "50%",
              opacity: dotOpacityVal,
              boxShadow: `0 0 12px #2563EB, 0 0 0 ${dotShadow}px rgba(37,99,235,0.4)`,
              transform: `scale(${dotScale})`,
            }}
          />
          <span
            style={{
              fontSize: badgeFontSize,
              fontWeight: 700,
              letterSpacing: isPortrait ? 4 : 6,
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

        {/* Titre */}
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 800,
            lineHeight: titleLineHeight,
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

        {/* Section des dossiers */}
        <div
          style={{
            width: "100%",
            background: "rgba(224,237,255,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: sectionBorderRadius,
            padding: sectionPadding,
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
              fontSize: sectionTitleFontSize,
              fontWeight: 700,
              color: "#0F2B6D",
              marginBottom: isPortrait ? 24 : 40,
              display: "flex",
              alignItems: "center",
              gap: isPortrait ? 12 : 20,
              flexWrap: "wrap",
            }}
          >
            📋 Dossiers critiques
            <span style={{ fontSize: sectionSubFontSize, fontWeight: 400, color: "#2C3E66" }}>
              – alerte temps réel
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: cardsDirection,
              gap: cardsGap,
              justifyContent: "space-between",
            }}
          >
            {/* Dossier 1 */}
            <div
              style={{
                flex: 1,
                background: "white",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
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
                  marginBottom: isPortrait ? 16 : 24,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: cardTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>
                  Dossier #2847
                </span>
                <span
                  style={{
                    padding: cardStatusPadding,
                    borderRadius: 40,
                    fontSize: cardStatusFontSize,
                    fontWeight: 600,
                    background: "#F59E0B",
                    color: "white",
                  }}
                >
                  En cours
                </span>
              </div>
              <div style={{ marginBottom: isPortrait ? 20 : 30 }}>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4, marginBottom: 12 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Shanghai → Dakar
                </div>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> En mer
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: cardProgressFontSize,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Progression</span>
                  <span>65%</span>
                </div>
                <div
                  style={{
                    height: isPortrait ? 8 : 12,
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

            {/* Dossier 2 (avec délai) */}
            <div
              style={{
                flex: 1,
                background: isSuccess ? "white" : "#FFF5F5",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
                boxShadow: "0 15px 30px -12px rgba(0,0,0,0.1)",
                border: isSuccess ? "none" : "2px solid #EF4444",
                position: "relative",
                overflow: "hidden",
                opacity: card2Anim.opacity,
                transform: `translateY(${card2Anim.translateY}px)`,
                filter: `blur(${card2Anim.blur}px)`,
              }}
            >
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
                  marginBottom: isPortrait ? 16 : 24,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: cardTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>
                  Dossier #2850
                </span>
                <span
                  style={{
                    padding: cardStatusPadding,
                    borderRadius: 40,
                    fontSize: cardStatusFontSize,
                    fontWeight: 600,
                    background: delayedStatusClass === "resolved" ? "#22C55E" : "#EF4444",
                    color: "white",
                  }}
                >
                  {delayedStatus}
                </span>
              </div>
              <div style={{ marginBottom: isPortrait ? 20 : 30 }}>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4, marginBottom: 12 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Le Havre → Abidjan
                </div>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> Dédouanement
                </div>
                {warningMessage && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "#EF4444",
                      color: "white",
                      borderRadius: 40,
                      padding: isPortrait ? "6px 16px" : "8px 20px",
                      fontSize: cardStatusFontSize,
                      fontWeight: 600,
                      marginTop: 12,
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
                    fontSize: cardProgressFontSize,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Délai écoulé</span>
                  <span>{isSuccess ? "Débloqué" : "+48h"}</span>
                </div>
                <div
                  style={{
                    height: isPortrait ? 8 : 12,
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
                  padding: buttonPadding,
                  fontSize: buttonFontSize,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Sora', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: buttonGap,
                  cursor: "default",
                  marginTop: isPortrait ? 20 : 24,
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
                borderRadius: cardBorderRadius,
                padding: cardPadding,
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
                  marginBottom: isPortrait ? 16 : 24,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: cardTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>
                  Dossier #2852
                </span>
                <span
                  style={{
                    padding: cardStatusPadding,
                    borderRadius: 40,
                    fontSize: cardStatusFontSize,
                    fontWeight: 600,
                    background: "#F59E0B",
                    color: "white",
                  }}
                >
                  En cours
                </span>
              </div>
              <div style={{ marginBottom: isPortrait ? 20 : 30 }}>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4, marginBottom: 12 }}>
                  <strong style={{ color: "#0F2B6D" }}>Transit :</strong> Marseille → Casablanca
                </div>
                <div style={{ fontSize: cardTextFontSize, color: "#2C3E66", lineHeight: 1.4 }}>
                  <strong style={{ color: "#0F2B6D" }}>Étape :</strong> Transport
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: cardProgressFontSize,
                    color: "#2C3E66",
                    marginBottom: 12,
                  }}
                >
                  <span>Progression</span>
                  <span>30%</span>
                </div>
                <div
                  style={{
                    height: isPortrait ? 8 : 12,
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

      {/* Particules de succès */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: isPortrait ? 6 : 8,
            height: isPortrait ? 6 : 8,
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