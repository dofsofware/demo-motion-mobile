import {
  Easing,
  Img,
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

export const Scene13 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;
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

  // ---------- Badge ----------
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

  // ---------- Adapt zone fade in ----------
  const adaptZoneEntrance = () => {
    const start = 0.2 * fps;
    const end = (0.2 + 0.6) * fps;
    if (frame < start) return 0;
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.ease,
    });
    return progress;
  };
  const adaptZoneOpacity = adaptZoneEntrance();

  // ---------- Company cards (slide from left) ----------
  const cardFromLeft = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: isPortrait ? -80 : -120, scale: 0.9, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.55, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.55, 1], [isPortrait ? -80 : -120, 8, 0], clamp);
    const scale = interpolate(progress, [0, 0.55, 1], [0.9, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.55, 1], [6, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };

  const card1 = cardFromLeft(0.3, 0.6);
  const card2 = cardFromLeft(0.55, 0.6);
  const card3 = cardFromLeft(0.8, 0.6);
  const card4 = cardFromLeft(1.05, 0.6);

  // Arrow pulse (continuous)
  const arrowPulse = (delaySec: number) => {
    if (time < delaySec) return { opacity: 0.4, translateX: 0 };
    const wave = pulseValue(time - delaySec, 1.5);
    const opacityArrow = interpolate(wave, [-1, 1], [0.4, 0.9]);
    const translateXArrow = interpolate(wave, [-1, 1], [0, 6]);
    return { opacity: opacityArrow, translateX: translateXArrow };
  };
  const arrow1 = arrowPulse(0.3 + 0.6);
  const arrow2 = arrowPulse(0.55 + 0.6);
  const arrow3 = arrowPulse(0.8 + 0.6);
  const arrow4 = arrowPulse(1.05 + 0.6);

  // ---------- Logo center ----------
  const logoAppear = () => {
    const start = 0.15 * fps;
    const end = (0.15 + 0.7) * fps;
    if (frame < start) return { opacity: 0, scale: 0.4, rotate: -20, blur: 10 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.55, 1], [0, 1, 1], clamp);
    const scale = interpolate(progress, [0, 0.55, 1], [0.4, 1.06, 1], clamp);
    const rotate = interpolate(progress, [0, 0.55, 1], [-20, 2, 0], clamp);
    const blur = interpolate(progress, [0, 0.55, 1], [10, 0, 0], clamp);
    return { opacity: op, scale, rotate, blur };
  };
  const logoWrap = logoAppear();

  const logoGlow = () => {
    if (time < 0.9) return { shadowScale: 16 };
    const wave = pulseValue(time - 0.9, 3);
    const shadowScale = interpolate(wave, [-1, 1], [16, 28]);
    return { shadowScale };
  };
  const glow = logoGlow();

  const fadeUp = () => {
    const start = 0.8 * fps;
    const end = (0.8 + 0.5) * fps;
    if (frame < start) return { opacity: 0, translateY: 16 };
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.ease });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [16, 0]);
    return { opacity: op, translateY };
  };
  const labelAnim = fadeUp();

  const ringRotate1 = (time * 360 / 8) % 360;
  const ringRotate2 = (time * -360 / 14) % 360;

  const connDotAppear = (delaySec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + 0.3) * fps;
    if (frame < start) return { opacity: 0, scale: 0 };
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.ease });
    const op = progress;
    const scale = progress;
    return { opacity: op, scale };
  };
  const dot1Appear = connDotAppear(0.5);
  const dot2Appear = connDotAppear(0.6);
  const dot3Appear = connDotAppear(0.7);
  const dot4Appear = connDotAppear(0.8);

  const connPulse = (startDelaySec: number, durationSec: number) => {
    if (time < startDelaySec) return { shadowScale: 5 };
    const wave = pulseValue(time - startDelaySec, durationSec);
    const shadowScale = interpolate(wave, [-1, 1], [5, 12]);
    return { shadowScale };
  };
  const pulse1 = connPulse(0.8, 2);
  const pulse2 = connPulse(1.0, 2);
  const pulse3 = connPulse(1.2, 2);
  const pulse4 = connPulse(1.4, 2);

  // ---------- Result cards (slide from right) ----------
  const cardFromRight = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: isPortrait ? 80 : 120, scale: 0.9, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.55, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.55, 1], [isPortrait ? 80 : 120, -8, 0], clamp);
    const scale = interpolate(progress, [0, 0.55, 1], [0.9, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.55, 1], [6, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const r1 = cardFromRight(0.5, 0.6);
  const r2 = cardFromRight(0.75, 0.6);
  const r3 = cardFromRight(1.0, 0.6);
  const r4 = cardFromRight(1.25, 0.6);

  const iconPulse = () => {
    const wave = pulseValue(time, 2);
    const shadowScale = interpolate(wave, [-1, 1], [16, 24]);
    const scale = interpolate(wave, [-1, 1], [1, 1.06]);
    return { shadowScale, scale };
  };
  const iconPulseStyle = iconPulse();

  // ---------- Title ----------
  const titleRise = () => {
    const start = 1.35 * fps;
    const end = (1.35 + 0.8) * fps;
    if (frame < start) return { opacity: 0, translateY: isPortrait ? 40 : 70, scale: 0.94, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.55, 1], [0, 1, 1], clamp);
    const translateY = interpolate(progress, [0, 0.55, 1], [isPortrait ? 40 : 70, -6, 0], clamp);
    const scale = interpolate(progress, [0, 0.55, 1], [0.94, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.55, 1], [6, 0, 0], clamp);
    return { opacity: op, translateY, scale, blur };
  };
  const titleAnim = titleRise();

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Layout responsif ----------
  const contentWidth = width * (isPortrait ? 0.92 : 0.9);
  const mainGap = isPortrait ? height * 0.05 : 90;
  const adaptZoneDirection = isPortrait ? "column" : "row";
  const adaptZoneGap = isPortrait ? height * 0.06 : 100;
  const companyCardsAlign = isPortrait ? "center" : "flex-end";
  const resultCardsAlign = isPortrait ? "center" : "flex-start";
  const logoSize = isPortrait ? 200 : 300;
  const logoImageSize = isPortrait ? 140 : 200;
  const ringSize1 = isPortrait ? 280 : 400;
  const ringSize2 = isPortrait ? 360 : 520;
  const cardMinWidth = isPortrait ? "auto" : 580;
  const cardWidth = isPortrait ? "100%" : "auto";
  const cardPadding = isPortrait ? "16px 24px" : "28px 44px";
  const cardGap = isPortrait ? 20 : 30;
  const cardIconSize = isPortrait ? 56 : 80;
  const cardIconFontSize = isPortrait ? 32 : 44;
  const cardTitleFontSize = isPortrait ? 24 : 34;
  const cardSubFontSize = isPortrait ? 18 : 26;
  const arrowOffset = isPortrait ? -40 : -78;
  const arrowFontSize = isPortrait ? 28 : 40;
  const lineOffset = isPortrait ? -60 : -100;
  const lineWidth = isPortrait ? 50 : 80;
  const resultCardMinWidth = isPortrait ? "auto" : 620;
  const resultIconSize = isPortrait ? 50 : 70;
  const resultIconFontSize = isPortrait ? 28 : 36;
  const resultTitleFontSize = isPortrait ? 24 : 34;
  const resultSubFontSize = isPortrait ? 18 : 26;
  const titleFontSize = isPortrait ? 48 : 90;
  const titleLineHeight = isPortrait ? 1.2 : 1.2;
  const badgeFontSize = isPortrait ? 28 : 38;
  const badgePadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 16 : 20;
  const labelFontSize = isPortrait ? 24 : 32;

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
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          width: contentWidth,
          maxWidth: 3400,
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
            FLEXIBILITÉ TOTALE
          </span>
        </div>

        {/* Zone adaptative : company cards + logo + result cards */}
        <div
          style={{
            display: "flex",
            flexDirection: adaptZoneDirection,
            alignItems: "center",
            justifyContent: "center",
            gap: adaptZoneGap,
            opacity: adaptZoneOpacity,
            width: "100%",
          }}
        >
          {/* Colonne gauche : cartes entreprises */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isPortrait ? 24 : 32,
              alignItems: companyCardsAlign,
              width: isPortrait ? "100%" : "auto",
            }}
          >
            {/* Carte 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.18)",
                borderRadius: 24,
                padding: cardPadding,
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)",
                position: "relative",
                minWidth: cardMinWidth,
                width: cardWidth,
                opacity: card1.opacity,
                transform: `translateX(${card1.translateX}px) scale(${card1.scale})`,
                filter: `blur(${card1.blur}px)`,
              }}
            >
              <div
                style={{
                  width: cardIconSize,
                  height: cardIconSize,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: cardIconFontSize,
                  flexShrink: 0,
                  background: "rgba(37,99,235,0.1)",
                }}
              >
                🚢
              </div>
              <div>
                <div style={{ fontSize: cardTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.2 }}>
                  Importateur
                </div>
                <div style={{ fontSize: cardSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Marchandises · Conteneurs
                </div>
              </div>
              {!isPortrait && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      right: arrowOffset,
                      top: "50%",
                      transform: `translateY(-55%) translateX(${arrow1.translateX}px)`,
                      fontSize: arrowFontSize,
                      color: "rgba(37,99,235,0.5)",
                      opacity: arrow1.opacity,
                    }}
                  >
                    ›
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: lineOffset,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: lineWidth,
                      height: 3,
                      background: "linear-gradient(90deg, rgba(37,99,235,0.4), rgba(37,99,235,0.1))",
                      borderRadius: 2,
                    }}
                  />
                </>
              )}
            </div>

            {/* Carte 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.18)",
                borderRadius: 24,
                padding: cardPadding,
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)",
                position: "relative",
                minWidth: cardMinWidth,
                width: cardWidth,
                opacity: card2.opacity,
                transform: `translateX(${card2.translateX}px) scale(${card2.scale})`,
                filter: `blur(${card2.blur}px)`,
              }}
            >
              <div
                style={{
                  width: cardIconSize,
                  height: cardIconSize,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: cardIconFontSize,
                  flexShrink: 0,
                  background: "rgba(34,197,94,0.1)",
                }}
              >
                📦
              </div>
              <div>
                <div style={{ fontSize: cardTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.2 }}>
                  Exportateur
                </div>
                <div style={{ fontSize: cardSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Transit · Groupage
                </div>
              </div>
              {!isPortrait && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      right: arrowOffset,
                      top: "50%",
                      transform: `translateY(-55%) translateX(${arrow2.translateX}px)`,
                      fontSize: arrowFontSize,
                      color: "rgba(37,99,235,0.5)",
                      opacity: arrow2.opacity,
                    }}
                  >
                    ›
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: lineOffset,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: lineWidth,
                      height: 3,
                      background: "linear-gradient(90deg, rgba(37,99,235,0.4), rgba(37,99,235,0.1))",
                      borderRadius: 2,
                    }}
                  />
                </>
              )}
            </div>

            {/* Carte 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.18)",
                borderRadius: 24,
                padding: cardPadding,
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)",
                position: "relative",
                minWidth: cardMinWidth,
                width: cardWidth,
                opacity: card3.opacity,
                transform: `translateX(${card3.translateX}px) scale(${card3.scale})`,
                filter: `blur(${card3.blur}px)`,
              }}
            >
              <div
                style={{
                  width: cardIconSize,
                  height: cardIconSize,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: cardIconFontSize,
                  flexShrink: 0,
                  background: "rgba(245,158,11,0.1)",
                }}
              >
                🚛
              </div>
              <div>
                <div style={{ fontSize: cardTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.2 }}>
                  Commissionnaire
                </div>
                <div style={{ fontSize: cardSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Logistique · Fret
                </div>
              </div>
              {!isPortrait && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      right: arrowOffset,
                      top: "50%",
                      transform: `translateY(-55%) translateX(${arrow3.translateX}px)`,
                      fontSize: arrowFontSize,
                      color: "rgba(37,99,235,0.5)",
                      opacity: arrow3.opacity,
                    }}
                  >
                    ›
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: lineOffset,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: lineWidth,
                      height: 3,
                      background: "linear-gradient(90deg, rgba(37,99,235,0.4), rgba(37,99,235,0.1))",
                      borderRadius: 2,
                    }}
                  />
                </>
              )}
            </div>

            {/* Carte 4 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.18)",
                borderRadius: 24,
                padding: cardPadding,
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.1)",
                position: "relative",
                minWidth: cardMinWidth,
                width: cardWidth,
                opacity: card4.opacity,
                transform: `translateX(${card4.translateX}px) scale(${card4.scale})`,
                filter: `blur(${card4.blur}px)`,
              }}
            >
              <div
                style={{
                  width: cardIconSize,
                  height: cardIconSize,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: cardIconFontSize,
                  flexShrink: 0,
                  background: "rgba(168,85,247,0.1)",
                }}
              >
                🏛️
              </div>
              <div>
                <div style={{ fontSize: cardTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.2 }}>
                  Agence transit
                </div>
                <div style={{ fontSize: cardSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Dédouanement · Conseil
                </div>
              </div>
              {!isPortrait && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      right: arrowOffset,
                      top: "50%",
                      transform: `translateY(-55%) translateX(${arrow4.translateX}px)`,
                      fontSize: arrowFontSize,
                      color: "rgba(37,99,235,0.5)",
                      opacity: arrow4.opacity,
                    }}
                  >
                    ›
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: lineOffset,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: lineWidth,
                      height: 3,
                      background: "linear-gradient(90deg, rgba(37,99,235,0.4), rgba(37,99,235,0.1))",
                      borderRadius: 2,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Logo central avec anneaux */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 24,
              position: "relative",
            }}
          >
            {/* Anneaux rotatifs */}
            <div
              style={{
                position: "absolute",
                width: ringSize1,
                height: ringSize1,
                borderRadius: "50%",
                border: "3px solid rgba(37,99,235,0.15)",
                transform: `translate(-50%, -50%) rotate(${ringRotate1}deg)`,
                top: "50%",
                left: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: ringSize2,
                height: ringSize2,
                borderRadius: "50%",
                border: "2px dashed rgba(37,99,235,0.08)",
                transform: `translate(-50%, -50%) rotate(${ringRotate2}deg)`,
                top: "50%",
                left: "50%",
              }}
            />

            {/* Conteneur logo */}
            <div
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: "50%",
                background: "white",
                border: "4px solid rgba(37,99,235,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 ${glow.shadowScale}px rgba(37,99,235,0.06), 0 20px 50px -10px rgba(37,99,235,0.2)`,
                zIndex: 2,
                position: "relative",
                opacity: logoWrap.opacity,
                transform: `scale(${logoWrap.scale}) rotate(${logoWrap.rotate}deg)`,
                filter: `blur(${logoWrap.blur}px)`,
              }}
            >
              {/* Points de connexion */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: -9,
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#2563EB",
                  boxShadow: `0 0 0 ${pulse1.shadowScale}px rgba(37,99,235,0.2)`,
                  opacity: dot1Appear.opacity,
                  transform: `scale(${dot1Appear.scale})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#2563EB",
                  boxShadow: `0 0 0 ${pulse2.shadowScale}px rgba(37,99,235,0.2)`,
                  opacity: dot2Appear.opacity,
                  transform: `scale(${dot2Appear.scale})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#2563EB",
                  boxShadow: `0 0 0 ${pulse3.shadowScale}px rgba(37,99,235,0.2)`,
                  opacity: dot3Appear.opacity,
                  transform: `scale(${dot3Appear.scale})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: -9,
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#2563EB",
                  boxShadow: `0 0 0 ${pulse4.shadowScale}px rgba(37,99,235,0.2)`,
                  opacity: dot4Appear.opacity,
                  transform: `scale(${dot4Appear.scale})`,
                }}
              />
              <Img
                src={staticFile("logo.png")}
                style={{
                  width: logoImageSize,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Label sous le logo */}
            <div
              style={{
                fontSize: labelFontSize,
                fontWeight: 700,
                color: "#2563EB",
                letterSpacing: 2,
                zIndex: 2,
                position: "relative",
                textAlign: "center",
                lineHeight: 1.3,
                opacity: labelAnim.opacity,
                transform: `translateY(${labelAnim.translateY}px)`,
              }}
            >
              ShipTrack<br />s'adapte à vous
            </div>
          </div>

          {/* Colonne droite : cartes résultats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isPortrait ? 24 : 32,
              alignItems: resultCardsAlign,
              width: isPortrait ? "100%" : "auto",
            }}
          >
            {/* Résultat 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(37,99,235,0.08)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.25)",
                borderRadius: 24,
                padding: cardPadding,
                position: "relative",
                minWidth: resultCardMinWidth,
                width: cardWidth,
                opacity: r1.opacity,
                transform: `translateX(${r1.translateX}px) scale(${r1.scale})`,
                filter: `blur(${r1.blur}px)`,
              }}
            >
              <div
                style={{
                  width: resultIconSize,
                  height: resultIconSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: resultIconFontSize,
                  flexShrink: 0,
                  boxShadow: `0 4px ${iconPulseStyle.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${iconPulseStyle.scale})`,
                }}
              >
                ⚙️
              </div>
              <div>
                <div style={{ fontSize: resultTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.3 }}>
                  Workflows sur mesure
                </div>
                <div style={{ fontSize: resultSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Vos règles, vos étapes
                </div>
              </div>
              {!isPortrait && (
                <div
                  style={{
                    position: "absolute",
                    left: -lineOffset,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: lineWidth,
                    height: 3,
                    background: "linear-gradient(90deg, rgba(37,99,235,0.1), rgba(37,99,235,0.5))",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>

            {/* Résultat 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(37,99,235,0.08)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.25)",
                borderRadius: 24,
                padding: cardPadding,
                position: "relative",
                minWidth: resultCardMinWidth,
                width: cardWidth,
                opacity: r2.opacity,
                transform: `translateX(${r2.translateX}px) scale(${r2.scale})`,
                filter: `blur(${r2.blur}px)`,
              }}
            >
              <div
                style={{
                  width: resultIconSize,
                  height: resultIconSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: resultIconFontSize,
                  flexShrink: 0,
                  boxShadow: `0 4px ${iconPulseStyle.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${iconPulseStyle.scale})`,
                }}
              >
                📊
              </div>
              <div>
                <div style={{ fontSize: resultTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.3 }}>
                  Tableaux de bord dédiés
                </div>
                <div style={{ fontSize: resultSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Visibilité en temps réel
                </div>
              </div>
              {!isPortrait && (
                <div
                  style={{
                    position: "absolute",
                    left: -lineOffset,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: lineWidth,
                    height: 3,
                    background: "linear-gradient(90deg, rgba(37,99,235,0.1), rgba(37,99,235,0.5))",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>

            {/* Résultat 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(37,99,235,0.08)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.25)",
                borderRadius: 24,
                padding: cardPadding,
                position: "relative",
                minWidth: resultCardMinWidth,
                width: cardWidth,
                opacity: r3.opacity,
                transform: `translateX(${r3.translateX}px) scale(${r3.scale})`,
                filter: `blur(${r3.blur}px)`,
              }}
            >
              <div
                style={{
                  width: resultIconSize,
                  height: resultIconSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: resultIconFontSize,
                  flexShrink: 0,
                  boxShadow: `0 4px ${iconPulseStyle.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${iconPulseStyle.scale})`,
                }}
              >
                🔔
              </div>
              <div>
                <div style={{ fontSize: resultTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.3 }}>
                  Alertes personnalisées
                </div>
                <div style={{ fontSize: resultSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Notifications intelligentes
                </div>
              </div>
              {!isPortrait && (
                <div
                  style={{
                    position: "absolute",
                    left: -lineOffset,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: lineWidth,
                    height: 3,
                    background: "linear-gradient(90deg, rgba(37,99,235,0.1), rgba(37,99,235,0.5))",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>

            {/* Résultat 4 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: cardGap,
                background: "rgba(37,99,235,0.08)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(37,99,235,0.25)",
                borderRadius: 24,
                padding: cardPadding,
                position: "relative",
                minWidth: resultCardMinWidth,
                width: cardWidth,
                opacity: r4.opacity,
                transform: `translateX(${r4.translateX}px) scale(${r4.scale})`,
                filter: `blur(${r4.blur}px)`,
              }}
            >
              <div
                style={{
                  width: resultIconSize,
                  height: resultIconSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: resultIconFontSize,
                  flexShrink: 0,
                  boxShadow: `0 4px ${iconPulseStyle.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${iconPulseStyle.scale})`,
                }}
              >
                📋
              </div>
              <div>
                <div style={{ fontSize: resultTitleFontSize, fontWeight: 600, color: "#0F2B6D", lineHeight: 1.3 }}>
                  Documents automatisés
                </div>
                <div style={{ fontSize: resultSubFontSize, fontWeight: 400, color: "#2C3E66", marginTop: 4 }}>
                  Vos modèles, vos formats
                </div>
              </div>
              {!isPortrait && (
                <div
                  style={{
                    position: "absolute",
                    left: -lineOffset,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: lineWidth,
                    height: 3,
                    background: "linear-gradient(90deg, rgba(37,99,235,0.1), rgba(37,99,235,0.5))",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Titre final */}
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
            opacity: titleAnim.opacity,
            transform: `translateY(${titleAnim.translateY}px) scale(${titleAnim.scale})`,
            filter: `blur(${titleAnim.blur}px)`,
          }}
        >
          Chaque entreprise a sa façon de travailler.<br />
          ShipTrack{" "}
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
            s'adapte à vous.
          </span>
        </div>
      </div>
    </div>
  );
};