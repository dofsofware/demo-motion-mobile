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

export const Scene14 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Helper slideDownPop (badge) avec valeurs adaptées ----------
  const slideDownPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? -40 : -80, scale: 0.85, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.34, 1.3, 0.55, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [isPortrait ? -40 : -80, 8, 0], clamp);
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

  // ---------- Title (riseGlow) avec valeurs adaptées ----------
  const riseGlow = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? 50 : 100, scale: 0.92, blur: 8 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
    });
    const op = interpolate(progress, [0, 0.4, 1], [0, 0.9, 1], clamp);
    const translateY = interpolate(progress, [0, 0.4, 1], [isPortrait ? 50 : 100, -12, 0], clamp);
    const scale = interpolate(progress, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.4, 1], [8, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const titleAnim = riseGlow(0, 0.9);
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Subtitle (slideUpFade) adapté ----------
  const slideUpFade = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? 40 : 70, scale: 0.95, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [isPortrait ? 40 : 70, 0]);
    const scale = interpolate(progress, [0, 1], [0.95, 1]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, scale, blur };
  };
  const subtitleAnim = slideUpFade(0, 0.85);

  // ---------- Right panel (slideRightPop) adapté ----------
  const slideRightPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: isPortrait ? 40 : 80, scale: 0.95, blur: 10 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [isPortrait ? 40 : 80, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.95, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [10, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const panelAnim = slideRightPop(0, 0.9);

  // ---------- Step cards entry (staggered, adapté) ----------
  const stepCardEntry = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: isPortrait ? 50 : 100, scale: 0.88, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1.2),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [isPortrait ? 50 : 100, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.88, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [12, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const step1Anim = stepCardEntry(0.1, 0.6);
  const step2Anim = stepCardEntry(0.35, 0.6);
  const step3Anim = stepCardEntry(0.6, 0.6);

  // Icon pulse (2.2s cycle)
  const iconPulseStyle = () => {
    const wave = pulseValue(time, 2.2);
    const scale = interpolate(wave, [-1, 1], [1, 1.05]);
    const shadowScale = interpolate(wave, [-1, 1], [24, 32]);
    return { scale, shadowScale };
  };
  const iconPulseVal = iconPulseStyle();

  // Progress bar widths (mêmes délais)
  const progressBarWidth = (delaySec: number, targetWidth: number, durationSec: number = 1) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return 0;
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    return targetWidth * progress;
  };
  const width1 = progressBarWidth(0.1, 70);
  const width2 = progressBarWidth(0.35, 90);
  const width3 = progressBarWidth(0.6, 50);

  // Shimmer effect
  const shimmerProgress = loop(time, 1.5);
  const shimmerTranslateX = interpolate(shimmerProgress, [0, 1], [-100, 200]);

  // Counter animations
  const counterValue = (delaySec: number, target: number, durationSec: number = 1) => {
    const start = (delaySec + 0.2) * fps;
    const end = (delaySec + 0.2 + durationSec) * fps;
    if (frame < start) return 0;
    if (frame >= end) return target;
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.linear });
    return Math.floor(target * progress);
  };
  const counter1 = counterValue(0.1, 48);
  const counter2 = counterValue(0.35, 24);
  const counter3 = counterValue(0.6, 12);

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.92);
  const mainGap = isPortrait ? height * 0.06 : 180;
  const leftColumnGap = isPortrait ? height * 0.04 : 60;
  const columnsDirection = isPortrait ? "column" : "row";
  const leftColumnTextAlign = isPortrait ? "center" : "left";
  const leftColumnItemsAlign = isPortrait ? "center" : "flex-start";
  const badgeWidth = isPortrait ? "auto" : "fit-content";
  const badgePadding = isPortrait ? "12px 32px" : "18px 56px";
  const badgeFontSize = isPortrait ? 24 : 34;
  const badgeGap = isPortrait ? 18 : 28;
  const badgeDotSize = isPortrait ? 14 : 20;
  const titleFontSize = isPortrait ? 52 : 100;
  const titleLineHeight = isPortrait ? 1.2 : 1.1;
  const subtitleFontSize = isPortrait ? 28 : 48;
  const panelWidth = isPortrait ? "100%" : "1100px";
  const panelPadding = isPortrait ? 30 : 60;
  const panelBorderRadius = isPortrait ? 32 : 48;
  const stepCardsGap = isPortrait ? 32 : 48;
  const stepCardPadding = isPortrait ? "24px 28px" : "36px 44px";
  const stepCardBorderRadius = isPortrait ? 28 : 40;
  const stepIconSize = isPortrait ? 64 : 88;
  const stepIconFontSize = isPortrait ? 36 : 48;
  const stepTitleFontSize = isPortrait ? 36 : 48;
  const stepDescFontSize = isPortrait ? 20 : 28;
  const stepDescPaddingLeft = isPortrait ? 80 : 112;
  const stepInfoPadding = isPortrait ? "20px 24px" : "28px 32px";
  const stepInfoBorderRadius = isPortrait => isPortrait ? 20 : 28;
  const labelFontSize = isPortrait ? 20 : 28;
  const counterFontSize = isPortrait ? 40 : 52;
  const progressHeight = isPortrait ? 12 : 18;

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
          width: isPortrait ? 760 : 1200,
          height: isPortrait ? 760 : 1200,
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
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: columnsDirection,
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          width: contentWidth,
          maxWidth: 3200,
        }}
      >
        {/* Colonne gauche (texte) */}
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
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
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
              DÉLAIS CONFIGURABLES
            </span>
          </div>

          {/* Titre */}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: titleLineHeight,
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px) scale(${titleAnim.scale})`,
              filter: `blur(${titleAnim.blur}px)`,
            }}
          >
            Maîtrisez vos{" "}
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
              délais
            </span>
            <br />
            étape par étape.
          </div>

          {/* Sous-titre */}
          <div
            style={{
              fontSize: subtitleFontSize,
              fontWeight: 300,
              color: "#2C3E66",
              lineHeight: 1.2,
              opacity: subtitleAnim.opacity,
              transform: `translateY(${subtitleAnim.translateY}px) scale(${subtitleAnim.scale})`,
              filter: `blur(${subtitleAnim.blur}px)`,
            }}
          >
            Objectifs clairs · Suivi en temps réel · Alerte dépassement
          </div>
        </div>

        {/* Colonne droite : cartes étapes */}
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
              display: "flex",
              flexDirection: "column",
              gap: stepCardsGap,
            }}
          >
            {/* Étape 1 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: stepCardBorderRadius,
                padding: stepCardPadding,
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step1Anim.opacity,
                transform: `translateX(${step1Anim.translateX}px) scale(${step1Anim.scale})`,
                filter: `blur(${step1Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: isPortrait ? 16 : 24, marginBottom: isPortrait ? 16 : 24 }}>
                <div
                  style={{
                    width: stepIconSize,
                    height: stepIconSize,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: isPortrait ? 20 : 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: stepIconFontSize,
                    boxShadow: `0 ${iconPulseVal.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseVal.scale})`,
                  }}
                >
                  📋
                </div>
                <div style={{ fontSize: stepTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>Dédouanement</div>
              </div>
              <div
                style={{
                  fontSize: stepDescFontSize,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: isPortrait ? 20 : 32,
                  paddingLeft: stepDescPaddingLeft,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Formalités douanières et déblocage des marchandises. Tous les documents, taxes et contrôles.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: isPortrait ? 20 : 28,
                  padding: stepInfoPadding,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: isPortrait ? "20px 0 0 20px" : "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: labelFontSize, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: counterFontSize, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: isPortrait ? 60 : 80, textAlign: "right" }}>{counter1}</span>
                    <span style={{ fontSize: labelFontSize, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: progressHeight,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width1}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #1E3A8A, #3B82F6)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 2 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: stepCardBorderRadius,
                padding: stepCardPadding,
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step2Anim.opacity,
                transform: `translateX(${step2Anim.translateX}px) scale(${step2Anim.scale})`,
                filter: `blur(${step2Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: isPortrait ? 16 : 24, marginBottom: isPortrait ? 16 : 24 }}>
                <div
                  style={{
                    width: stepIconSize,
                    height: stepIconSize,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: isPortrait ? 20 : 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: stepIconFontSize,
                    boxShadow: `0 ${iconPulseVal.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseVal.scale})`,
                  }}
                >
                  🚛
                </div>
                <div style={{ fontSize: stepTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>Transport</div>
              </div>
              <div
                style={{
                  fontSize: stepDescFontSize,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: isPortrait ? 20 : 32,
                  paddingLeft: stepDescPaddingLeft,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Acheminement physique du point A au point B. Suivi GPS, alertes de progression.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: isPortrait ? 20 : 28,
                  padding: stepInfoPadding,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: isPortrait ? "20px 0 0 20px" : "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: labelFontSize, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: counterFontSize, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: isPortrait ? 60 : 80, textAlign: "right" }}>{counter2}</span>
                    <span style={{ fontSize: labelFontSize, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: progressHeight,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width2}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #15803D, #22C55E)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: stepCardBorderRadius,
                padding: stepCardPadding,
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.1)",
                opacity: step3Anim.opacity,
                transform: `translateX(${step3Anim.translateX}px) scale(${step3Anim.scale})`,
                filter: `blur(${step3Anim.blur}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: isPortrait ? 16 : 24, marginBottom: isPortrait ? 16 : 24 }}>
                <div
                  style={{
                    width: stepIconSize,
                    height: stepIconSize,
                    background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                    borderRadius: isPortrait ? 20 : 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: stepIconFontSize,
                    boxShadow: `0 ${iconPulseVal.shadowScale}px 24px rgba(37,99,235,0.3)`,
                    transform: `scale(${iconPulseVal.scale})`,
                  }}
                >
                  🏠
                </div>
                <div style={{ fontSize: stepTitleFontSize, fontWeight: 700, color: "#0F2B6D" }}>Livraison</div>
              </div>
              <div
                style={{
                  fontSize: stepDescFontSize,
                  lineHeight: 1.3,
                  color: "#2C3E66",
                  marginBottom: isPortrait ? 20 : 32,
                  paddingLeft: stepDescPaddingLeft,
                  borderLeft: "3px solid rgba(37,99,235,0.3)",
                }}
              >
                Remise au client final, preuve de livraison et satisfaction.
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.05)",
                  borderRadius: isPortrait ? 20 : 28,
                  padding: stepInfoPadding,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 8,
                    height: "100%",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                    borderRadius: isPortrait ? "20px 0 0 20px" : "28px 0 0 28px",
                  }}
                />
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: labelFontSize, fontWeight: 600, color: "#0F2B6D", letterSpacing: 1 }}>📅 Délai objectif</span>
                  <div style={{ fontSize: counterFontSize, fontWeight: 800, color: "#2563EB", lineHeight: 1, display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ minWidth: isPortrait ? 60 : 80, textAlign: "right" }}>{counter3}</span>
                    <span style={{ fontSize: labelFontSize, fontWeight: 500, color: "#2C3E66" }}> heures</span>
                  </div>
                </div>
                <div
                  style={{
                    height: progressHeight,
                    background: "rgba(30,58,138,0.15)",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 20,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${width3}%`,
                      borderRadius: 20,
                      background: "linear-gradient(90deg, #C2410C, #F97316)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)",
                        transform: `translateX(${shimmerTranslateX}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};