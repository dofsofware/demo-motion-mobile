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

export const Scene23 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Helper slideDownPop (adapté) ----------
  const slideDownPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    const translateStart = isPortrait ? -40 : -80;
    if (frame < start) return { opacity: 0, translateY: translateStart, scale: 0.85, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.34, 1.3, 0.55, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [translateStart, 8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [12, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const badgeAnim = slideDownPop(0, 0.7);

  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, isPortrait ? 8 : 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacityVal = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Title (riseGlow adapté) ----------
  const riseGlow = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    const translateStart = isPortrait ? 50 : 100;
    if (frame < start) return { opacity: 0, translateY: translateStart, scale: 0.92, blur: 8 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
    });
    const op = interpolate(progress, [0, 0.4, 1], [0, 0.9, 1], clamp);
    const translateY = interpolate(progress, [0, 0.4, 1], [translateStart, -12, 0], clamp);
    const scale = interpolate(progress, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.4, 1], [8, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const titleAnim = riseGlow(0, 0.9);

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Right panel (slideRightPop adapté) ----------
  const slideRightPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    const translateStart = isPortrait ? 40 : 80;
    if (frame < start) return { opacity: 0, translateX: translateStart, scale: 0.95, blur: 10 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [translateStart, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.95, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [10, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const panelAnim = slideRightPop(0, 0.9);

  // ---------- Financial sequential animation (inchangée) ----------
  const revenuesTarget = 2_400_000;
  const chargesTarget = 1_680_000;
  const marginTarget = revenuesTarget - chargesTarget;
  const marginPercent = (marginTarget / revenuesTarget) * 100;

  let chargesValue = 0;
  let revenuesValue = 0;
  let marginValue = 0;
  let isChargesAnimating = false;
  let isRevenuesAnimating = false;
  let isMarginAnimating = false;
  let isCompleted = false;

  if (time >= 0.7) {
    if (time < 1.8) {
      const progress = (time - 0.7) / 1.1;
      const eased = 1 - Math.pow(1 - progress, 2);
      chargesValue = Math.floor(chargesTarget * eased);
      isChargesAnimating = true;
    } else {
      chargesValue = chargesTarget;
    }
  }

  if (time >= 1.8) {
    if (time < 2.9) {
      const progress = (time - 1.8) / 1.1;
      const eased = 1 - Math.pow(1 - progress, 2);
      revenuesValue = Math.floor(revenuesTarget * eased);
      isRevenuesAnimating = true;
    } else {
      revenuesValue = revenuesTarget;
    }
  }

  if (time >= 2.9) {
    if (time < 3.9) {
      const progress = (time - 2.9) / 1.0;
      const eased = 1 - Math.pow(1 - progress, 2);
      marginValue = Math.floor(marginTarget * eased);
      isMarginAnimating = true;
    } else {
      marginValue = marginTarget;
      isCompleted = true;
    }
  }

  const flashDuration = 0.4;
  const chargesFlash = time >= 0.7 && time < 0.7 + flashDuration;
  const revenuesFlash = time >= 1.8 && time < 1.8 + flashDuration;
  const marginFlash = time >= 2.9 && time < 2.9 + flashDuration;

  const showBadge = time >= 0.7;
  const showIndicator = time >= 0.7;
  const indicatorText = isCompleted ? "Calcul terminé ✓" : "Calcul automatique en cours...";
  const badgeStyle = isCompleted
    ? { background: "rgba(34,197,94,0.2)", borderColor: "#22C55E", color: "#16A34A", content: "✓ Calcul automatique" }
    : { background: "rgba(34,197,94,0.15)", borderColor: "#22C55E", color: "#16A34A", content: "⚡ Calcul auto" };

  const dotPulseGreen = pulseValue(time, 1);
  const dotScaleGreen = interpolate(dotPulseGreen, [-1, 1], [1, 1.2]);
  const dotOpacityGreen = interpolate(dotPulseGreen, [-1, 1], [0.5, 0]);

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.92);
  const columnsDirection = isPortrait ? "column" : "row";
  const mainGap = isPortrait ? height * 0.06 : 160;
  const leftColumnGap = isPortrait ? height * 0.04 : 60;
  const leftColumnTextAlign = isPortrait ? "center" : "left";
  const leftColumnItemsAlign = isPortrait ? "center" : "flex-start";
  const badgeWidth = isPortrait ? "auto" : "fit-content";
  const badgePadding = isPortrait ? "12px 32px" : "18px 56px";
  const badgeFontSize = isPortrait ? 26 : 34;
  const badgeGap = isPortrait ? 18 : 28;
  const badgeDotSize = isPortrait ? 14 : 20;
  const titleFontSize = isPortrait ? 52 : 90;
  const titleLineHeight = isPortrait ? 1.2 : 1.1;
  const panelWidth = isPortrait ? "100%" : "1000px";
  const panelPadding = isPortrait ? 30 : 60;
  const panelBorderRadius = isPortrait ? 30 : 40;
  const dossierTitleFontSize = isPortrait ? 30 : 38;
  const badgeSpanFontSize = isPortrait ? 18 : 24;
  const rowFontSize = isPortrait ? 32 : 40;
  const valueFontSize = isPortrait ? 36 : 44;
  const rowPadding = isPortrait ? "20px 0" : "30px 0";
  const indicatorFontSize = isPortrait ? 20 : 28;
  const indicatorPadding = isPortrait ? "6px 16px" : "8px 20px";
  const indicatorDotSize = isPortrait ? 10 : 12;
  const pulseRingSize = isPortrait ? 1000 : 1400;

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
          width: pulseRingSize,
          height: pulseRingSize,
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

      {/* Contenu principal : deux colonnes responsives */}
      <div
        style={{
          display: "flex",
          flexDirection: columnsDirection,
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          width: contentWidth,
          position: "relative",
          backdropFilter: "blur(2px)",
        }}
      >
        {/* Colonne gauche */}
        <div
          style={{
            flex: isPortrait ? "0 0 auto" : 1,
            display: "flex",
            flexDirection: "column",
            gap: leftColumnGap,
            width: "100%",
            textAlign: leftColumnTextAlign,
            alignItems: leftColumnItemsAlign,
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
              width: badgeWidth,
              opacity: badgeAnim.opacity,
              transform: `translateY(${badgeAnim.translateY}px) scale(${badgeAnim.scale})`,
              filter: `blur(${badgeAnim.blur}px)`,
              boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
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
                textShadow: "0 2px 5px rgba(37,99,235,0.2)",
              }}
            >
              CHARGES ET MARGES
            </span>
          </div>

          {/* Titre */}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: titleLineHeight,
              textAlign: leftColumnTextAlign,
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 4px 25px rgba(37,99,235,0.2)",
              maxWidth: 2600,
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px) scale(${titleAnim.scale})`,
              filter: `blur(${titleAnim.blur}px)`,
            }}
          >
            Charges enregistrées.<br />
            Marges calculées<br />
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
              automatiquement.
            </span>
          </div>
        </div>

        {/* Colonne droite : panneau financier */}
        <div
          style={{
            flex: isPortrait ? "0 0 auto" : "0 0 auto",
            width: panelWidth,
            opacity: panelAnim.opacity,
            transform: `translateX(${panelAnim.translateX}px) scale(${panelAnim.scale})`,
            filter: `blur(${panelAnim.blur}px)`,
          }}
        >
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: panelBorderRadius,
              padding: panelPadding,
              boxShadow: "0 25px 45px -12px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: dossierTitleFontSize,
                fontWeight: 600,
                color: "#2C3E66",
                marginBottom: isPortrait ? 24 : 40,
                display: "flex",
                alignItems: "center",
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              Dossier #2847
              {showBadge && (
                <span
                  style={{
                    fontSize: badgeSpanFontSize,
                    background: badgeStyle.background,
                    border: `1px solid ${badgeStyle.borderColor}`,
                    borderRadius: 40,
                    padding: "4px 16px",
                    color: badgeStyle.color,
                    fontWeight: 500,
                    letterSpacing: 1,
                  }}
                >
                  {badgeStyle.content}
                </span>
              )}
            </div>

            {/* Ligne Revenus */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: rowPadding,
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                ...(revenuesFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: rowFontSize,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📊 Revenus
              </span>
              <span
                style={{
                  fontSize: valueFontSize,
                  fontWeight: 700,
                  minWidth: isPortrait ? 180 : 260,
                  textAlign: "right",
                  color: "#16A34A",
                }}
              >
                {revenuesValue.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Ligne Charges */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: rowPadding,
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                ...(chargesFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: rowFontSize,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📦 Charges
              </span>
              <span
                style={{
                  fontSize: valueFontSize,
                  fontWeight: 700,
                  minWidth: isPortrait ? 180 : 260,
                  textAlign: "right",
                  color: "#DC2626",
                }}
              >
                {chargesValue.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Ligne Marge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: rowPadding,
                borderBottom: "2px solid rgba(30,58,138,0.1)",
                borderRadius: 20,
                ...(marginFlash
                  ? {
                      background: "rgba(37,99,235,0.2)",
                      transform: "scale(1.02)",
                      transition: "all 0.4s ease-out",
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontSize: rowFontSize,
                  color: "#0F2B6D",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                📈 Marge nette
              </span>
              <span
                style={{
                  fontSize: valueFontSize,
                  fontWeight: 700,
                  minWidth: isPortrait ? 180 : 260,
                  textAlign: "right",
                  color: "#1D4ED8",
                }}
              >
                {marginValue.toLocaleString("fr-FR")} FCFA ({marginPercent.toFixed(1)}%)
              </span>
            </div>

            {/* Indicateur calcul automatique */}
            {showIndicator && (
              <div
                style={{
                  position: "absolute",
                  bottom: isPortrait ? 20 : 30,
                  right: isPortrait ? 20 : 30,
                  fontSize: indicatorFontSize,
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: 30,
                  padding: indicatorPadding,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span
                  style={{
                    width: indicatorDotSize,
                    height: indicatorDotSize,
                    background: "#22C55E",
                    borderRadius: "50%",
                    display: "inline-block",
                    transform: `scale(${dotScaleGreen})`,
                    opacity: dotOpacityGreen,
                  }}
                />
                {indicatorText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};