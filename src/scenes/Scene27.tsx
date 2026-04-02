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

export const Scene27 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Subheading (slideDownPop, delay 0.3s, adapté) ----------
  const subheadingStart = 0.3;
  const subheadingDuration = 0.8;
  const subheadingEntrance = interpolate(
    frame,
    [subheadingStart * fps, (subheadingStart + subheadingDuration) * fps],
    [0, 1],
    {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    }
  );
  const subheadingOpacity = interpolate(
    subheadingEntrance,
    [0, 0.6, 1],
    [0, 1, 1],
    clamp
  );
  const subheadingTranslateY = interpolate(
    subheadingEntrance,
    [0, 0.6, 1],
    [isPortrait ? -40 : -80, 8, 0],
    clamp
  );
  const subheadingScale = interpolate(
    subheadingEntrance,
    [0, 0.6, 1],
    [0.85, 1.02, 1],
    clamp
  );
  const subheadingBlur = interpolate(subheadingEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  // ---------- Card entrances (cardRise, adapté) ----------
  const cardRise = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    const translateStart = isPortrait ? 30 : 50;
    if (frame < start) return { opacity: 0, translateY: translateStart, scale: 0.92, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [translateStart, 0]);
    const scale = interpolate(progress, [0, 1], [0.92, 1]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, scale, blur };
  };

  const card1Entrance = cardRise(0.5, 0.8);
  const card2Entrance = cardRise(0.8, 0.8);
  const card3Entrance = cardRise(2.1, 0.8);
  const card4Entrance = cardRise(2.4, 0.8);

  // ---------- Internal card animations (inchangées) ----------
  const linearProgress = (startSec: number, durationSec: number) => {
    if (time < startSec) return 0;
    if (time >= startSec + durationSec) return 1;
    return (time - startSec) / durationSec;
  };

  const errorStart = 0.7;
  const errorDuration = 1.305;
  const errorProgress = linearProgress(errorStart, errorDuration);
  const errorPercent = Math.floor(87 * errorProgress);
  const errorFillWidth = errorPercent;

  const delayStart = 1.0;
  const delayDuration = 1.08;
  const delayProgress = linearProgress(delayStart, delayDuration);
  const delayPercent = Math.floor(72 * delayProgress);
  const delayFillWidth = delayPercent;

  const controlStart = 2.3;
  const controlDuration = 1.41;
  const controlProgress = linearProgress(controlStart, controlDuration);
  const controlPercent = Math.floor(94 * controlProgress);
  const controlAngle = (controlPercent / 100) * 360;

  const profitStart = 2.6;
  const profitDuration = 1.2;
  const profitProgress = linearProgress(profitStart, profitDuration);
  const profitAmount = Math.floor(2450000 * profitProgress);
  const profitFillWidth = profitProgress * 100;

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.9);
  const mainGap = isPortrait ? height * 0.05 : 80;
  const badgeFontSize = isPortrait ? 28 : 38;
  const badgePadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 16 : 20;
  const subheadingFontSize = isPortrait ? 48 : 90;
  const cardsDirection = isPortrait ? "column" : "row";
  const cardsGap = isPortrait ? 30 : 60;
  const cardWidth = isPortrait ? "100%" : 500;
  const cardPadding = isPortrait ? "30px 30px" : "50px 60px";
  const cardBorderRadius = isPortrait ? 40 : 50;
  const cardIconSize = isPortrait ? 70 : 100;
  const cardTitleFontSize = isPortrait ? 38 : 48;
  const cardValueFontSize = isPortrait ? 50 : 64;
  const cardDescFontSize = isPortrait ? 20 : 24;
  const progressBarHeight = isPortrait ? 12 : 16;
  const gaugeSize = isPortrait ? 90 : 120;
  const gaugeFontSize = isPortrait ? 22 : 28;
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

      {/* Contenu principal centré */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          maxWidth: 3400,
          width: contentWidth,
          position: "relative",
          backdropFilter: "blur(2px)",
          padding: isPortrait ? "30px 0" : "60px 0",
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
              textShadow: "0 2px 5px rgba(37,99,235,0.2)",
            }}
          >
            RÉSULTATS
          </span>
        </div>

        {/* Sous-titre */}
        <h2
          style={{
            fontSize: subheadingFontSize,
            fontWeight: 800,
            color: "#0F2B6D",
            textAlign: "center",
            maxWidth: 2800,
            lineHeight: 1.2,
            opacity: subheadingOpacity,
            transform: `translateY(${subheadingTranslateY}px) scale(${subheadingScale})`,
            filter: `blur(${subheadingBlur}px)`,
          }}
        >
          Les résultats parlent d'eux-mêmes :
        </h2>

        {/* Conteneur des cartes (flex direction responsive) */}
        <div
          style={{
            display: "flex",
            flexDirection: cardsDirection,
            gap: cardsGap,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Carte 1: Moins d'erreurs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              width: cardWidth,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              background: "rgba(254,226,226,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(220,38,38,0.4)",
              opacity: card1Entrance.opacity,
              transform: `translateY(${card1Entrance.translateY}px) scale(${card1Entrance.scale})`,
              filter: `blur(${card1Entrance.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardIconSize, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))" }}>
              📉
            </div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.01em",
                background: "linear-gradient(135deg, #991B1B, #DC2626)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Moins d'erreurs
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: isPortrait ? 6 : 10,
                minHeight: isPortrait ? 100 : 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isPortrait ? 8 : 12,
              }}
            >
              <div style={{ fontSize: cardValueFontSize, fontWeight: 800, lineHeight: 1 }}>
                {errorPercent}%
              </div>
              <div
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: 30,
                  height: progressBarHeight,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${errorFillWidth}%`,
                    borderRadius: 30,
                    background: "#DC2626",
                  }}
                />
              </div>
              <div style={{ fontSize: cardDescFontSize }}>taux d'erreur réduit</div>
            </div>
          </div>

          {/* Carte 2: Moins de retards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              width: cardWidth,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              background: "rgba(254,226,226,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(220,38,38,0.4)",
              opacity: card2Entrance.opacity,
              transform: `translateY(${card2Entrance.translateY}px) scale(${card2Entrance.scale})`,
              filter: `blur(${card2Entrance.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardIconSize, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))" }}>
              ⏱️
            </div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.01em",
                background: "linear-gradient(135deg, #991B1B, #DC2626)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Moins de retards
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: isPortrait ? 6 : 10,
                minHeight: isPortrait ? 100 : 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isPortrait ? 8 : 12,
              }}
            >
              <div style={{ fontSize: cardValueFontSize, fontWeight: 800, lineHeight: 1 }}>
                {delayPercent}%
              </div>
              <div
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: 30,
                  height: progressBarHeight,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${delayFillWidth}%`,
                    borderRadius: 30,
                    background: "#F59E0B",
                  }}
                />
              </div>
              <div style={{ fontSize: cardDescFontSize }}>retards évités</div>
            </div>
          </div>

          {/* Carte 3: Plus de contrôle (gauge) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              width: cardWidth,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              background: "rgba(220,252,231,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(34,197,94,0.4)",
              opacity: card3Entrance.opacity,
              transform: `translateY(${card3Entrance.translateY}px) scale(${card3Entrance.scale})`,
              filter: `blur(${card3Entrance.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardIconSize, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))" }}>
              🎛️
            </div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.01em",
                background: "linear-gradient(135deg, #15803D, #22C55E)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Plus de contrôle
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: isPortrait ? 6 : 10,
                minHeight: isPortrait ? 100 : 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isPortrait ? 8 : 12,
              }}
            >
              <div
                style={{
                  width: gaugeSize,
                  height: gaugeSize,
                  borderRadius: "50%",
                  background: `conic-gradient(#22C55E 0deg ${controlAngle}deg, #e0e0e0 ${controlAngle}deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: gaugeFontSize,
                  fontWeight: "bold",
                  color: "#0F2B6D",
                  marginBottom: isPortrait ? 6 : 10,
                }}
              >
                {controlPercent}%
              </div>
              <div style={{ fontSize: cardDescFontSize }}>visibilité totale</div>
            </div>
          </div>

          {/* Carte 4: Plus de profit */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              width: cardWidth,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              background: "rgba(220,252,231,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(34,197,94,0.4)",
              opacity: card4Entrance.opacity,
              transform: `translateY(${card4Entrance.translateY}px) scale(${card4Entrance.scale})`,
              filter: `blur(${card4Entrance.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardIconSize, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))" }}>
              💰
            </div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.01em",
                background: "linear-gradient(135deg, #15803D, #22C55E)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Plus de profit
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: isPortrait ? 6 : 10,
                minHeight: isPortrait ? 100 : 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isPortrait ? 8 : 12,
              }}
            >
              <div style={{ fontSize: cardValueFontSize, fontWeight: 800, lineHeight: 1 }}>
                {profitAmount.toLocaleString("fr-FR")} FCFA
              </div>
              <div
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: 30,
                  height: progressBarHeight,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${profitFillWidth}%`,
                    borderRadius: 30,
                    background: "#22C55E",
                  }}
                />
              </div>
              <div style={{ fontSize: cardDescFontSize }}>marge supplémentaire</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};