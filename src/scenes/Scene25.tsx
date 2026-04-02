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

export const Scene25 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Icon entrance (scalePopSpin + float) adaptée ----------
  const iconEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const iconOpacity = interpolate(iconEntrance, [0, 0.5, 1], [0, 1, 1], clamp);
  const iconScale = interpolate(iconEntrance, [0, 0.5, 1], [0.2, 1.08, 1], clamp);
  const iconRotate = interpolate(iconEntrance, [0, 0.5, 1], [-120, 3, 0], clamp);
  const iconBlur = interpolate(iconEntrance, [0, 0.5, 1], [10, 0, 0], clamp);

  const iconFloatY = Math.sin((time / 3) * Math.PI * 2) * (isPortrait ? 2 : 4);
  const iconFloatRotate = Math.sin((time / 3) * Math.PI * 2) * (isPortrait ? 0.5 : 1);

  // ---------- Title (riseGlow + textShine) adapté ----------
  const titleEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  });
  const titleOpacity = interpolate(titleEntrance, [0, 0.4, 1], [0, 0.9, 1], clamp);
  const titleTranslateY = interpolate(titleEntrance, [0, 0.4, 1], [isPortrait ? 50 : 100, -12, 0], clamp);
  const titleScale = interpolate(titleEntrance, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntrance, [0, 0.4, 1], [8, 0, 0], clamp);

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  // ---------- Quality cards (qualityPop with staggered delays, adapté) ----------
  const qualityPop = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    const translateStart = isPortrait ? 30 : 40;
    if (frame < start) return { opacity: 0, scale: 0.6, translateY: translateStart, blur: 8 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.6, 1.02, 1], clamp);
    const translateY = interpolate(progress, [0, 0.6, 1], [translateStart, -8, 0], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [8, 0, 0], clamp);
    return { opacity: op, scale, translateY, blur };
  };

  const card1 = qualityPop(0.3, 0.6);
  const card2 = qualityPop(1.0, 0.6);
  const card3 = qualityPop(1.5, 0.6);

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.85);
  const mainGap = isPortrait ? height * 0.05 : 70;
  const badgeFontSize = isPortrait ? 28 : 38;
  const badgePadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 16 : 20;
  const iconSize = isPortrait ? 200 : 280;
  const iconFontSize = isPortrait ? 90 : 130;
  const iconBorderRadius = isPortrait ? 40 : 50;
  const titleFontSize = isPortrait ? 56 : 100;
  const titleLineHeight = isPortrait ? 1.2 : 1.2;
  const cardsDirection = isPortrait ? "column" : "row";
  const cardsGap = isPortrait ? 30 : 80;
  const cardPadding = isPortrait ? "24px 30px" : "30px 50px";
  const cardBorderRadius = isPortrait ? 40 : 60;
  const cardMinWidth = isPortrait ? "auto" : 280;
  const cardWidth = isPortrait ? "100%" : "auto";
  const cardEmojiSize = isPortrait ? 60 : 80;
  const cardTitleFontSize = isPortrait ? 44 : 58;
  const cardDescFontSize = isPortrait ? 22 : 28;
  const pulseRingSize = isPortrait ? 800 : 1000;

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
          maxWidth: 3000,
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
            FACTURATION
          </span>
        </div>

        {/* Icône 🧾 */}
        <div
          style={{
            width: iconSize,
            height: iconSize,
            background: "rgba(224,237,255,0.7)",
            backdropFilter: "blur(8px)",
            borderRadius: iconBorderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: iconFontSize,
            border: "3px solid rgba(37,99,235,0.4)",
            boxShadow: "0 25px 40px -12px rgba(0,0,0,0.15)",
            opacity: iconOpacity,
            transform: `translateY(${iconFloatY}px) rotate(${iconFloatRotate}deg) scale(${iconScale}) rotate(${iconRotate}deg)`,
            filter: `blur(${iconBlur}px)`,
          }}
        >
          🧾
        </div>

        {/* Titre */}
        <h1
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
            textShadow: "0 4px 25px rgba(37,99,235,0.2)",
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          Côté facturation ?
        </h1>

        {/* 3 qualités (flex direction responsive) */}
        <div
          style={{
            display: "flex",
            flexDirection: cardsDirection,
            justifyContent: "center",
            gap: cardsGap,
            flexWrap: isPortrait ? "nowrap" : "wrap",
            marginTop: 20,
            width: "100%",
          }}
        >
          {/* Simple */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              minWidth: cardMinWidth,
              width: cardWidth,
              border: "2px solid rgba(37,99,235,0.3)",
              boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
              opacity: card1.opacity,
              transform: `scale(${card1.scale}) translateY(${card1.translateY}px)`,
              filter: `blur(${card1.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardEmojiSize }}>✨</div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 800,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Simple
            </div>
            <div style={{ fontSize: cardDescFontSize, color: "#2C3E66", textAlign: "center" }}>
              Quelques clics
            </div>
          </div>

          {/* Rapide */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              minWidth: cardMinWidth,
              width: cardWidth,
              border: "2px solid rgba(37,99,235,0.3)",
              boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
              opacity: card2.opacity,
              transform: `scale(${card2.scale}) translateY(${card2.translateY}px)`,
              filter: `blur(${card2.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardEmojiSize }}>⚡</div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 800,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Rapide
            </div>
            <div style={{ fontSize: cardDescFontSize, color: "#2C3E66", textAlign: "center" }}>
              Génération instantanée
            </div>
          </div>

          {/* Efficace */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPortrait ? 16 : 20,
              minWidth: cardMinWidth,
              width: cardWidth,
              border: "2px solid rgba(37,99,235,0.3)",
              boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
              opacity: card3.opacity,
              transform: `scale(${card3.scale}) translateY(${card3.translateY}px)`,
              filter: `blur(${card3.blur}px)`,
            }}
          >
            <div style={{ fontSize: cardEmojiSize }}>🎯</div>
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 800,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Efficace
            </div>
            <div style={{ fontSize: cardDescFontSize, color: "#2C3E66", textAlign: "center" }}>
              Taux de recouvrement +28%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};