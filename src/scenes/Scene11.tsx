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

export const Scene11 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Cards animations (entrées adaptées au portrait) ----------
  const cardEntrance = (
    startSec: number,
    durationSec: number,
    easing: (x: number) => number
  ) => {
    const start = startSec * fps;
    const end = (startSec + durationSec) * fps;
    if (frame < start) return 0;
    return interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing,
    });
  };

  // Card 1 (vient de gauche)
  const card1Progress = cardEntrance(0.1, 0.8, Easing.bezier(0.22, 1, 0.36, 1));
  const card1Opacity = interpolate(card1Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card1TranslateX = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [isPortrait ? -180 : -350, 20, -8, 0],
    clamp
  );
  const card1Scale = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [0.85, 1.03, 0.99, 1],
    clamp
  );
  const card1Rotate = interpolate(
    card1Progress,
    [0, 0.55, 0.75, 1],
    [isPortrait ? -2 : -4, 0.5, 0, 0],
    clamp
  );
  const card1Blur = interpolate(card1Progress, [0, 0.55, 1], [12, 0, 0], clamp);

  // Card 2 (vient du bas)
  const card2Progress = cardEntrance(0.9, 0.85, Easing.bezier(0.22, 1, 0.36, 1));
  const card2Opacity = interpolate(card2Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card2TranslateY = interpolate(
    card2Progress,
    [0, 0.55, 0.75, 1],
    [isPortrait ? 150 : 280, -18, 6, 0],
    clamp
  );
  const card2Scale = interpolate(
    card2Progress,
    [0, 0.55, 0.75, 1],
    [0.88, 1.03, 0.99, 1],
    clamp
  );
  const card2Blur = interpolate(card2Progress, [0, 0.55, 1], [10, 0, 0], clamp);

  // Card 3 (vient de droite)
  const card3Progress = cardEntrance(1.2, 0.8, Easing.bezier(0.22, 1, 0.36, 1));
  const card3Opacity = interpolate(card3Progress, [0, 0.55, 1], [0, 1, 1], clamp);
  const card3TranslateX = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [isPortrait ? 180 : 350, -20, 8, 0],
    clamp
  );
  const card3Scale = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [0.85, 1.03, 0.99, 1],
    clamp
  );
  const card3Rotate = interpolate(
    card3Progress,
    [0, 0.55, 0.75, 1],
    [isPortrait ? 2 : 4, -0.5, 0, 0],
    clamp
  );
  const card3Blur = interpolate(card3Progress, [0, 0.55, 1], [12, 0, 0], clamp);

  // Flottement après entrée (amplitudes réduites en portrait)
  const cardFloat = (startDelay: number, amplitudeY: number, amplitudeRotate: number) => {
    if (time < startDelay) return { y: 0, rotate: 0 };
    const t = (time - startDelay) / 5;
    const wave = Math.sin(t * Math.PI * 2);
    return { y: wave * (isPortrait ? amplitudeY * 0.6 : amplitudeY), rotate: wave * (isPortrait ? amplitudeRotate * 0.5 : amplitudeRotate) };
  };
  const float1 = cardFloat(0.9, 12, 0.4);
  const float2 = cardFloat(1.75, 16, -0.4);
  const float3 = cardFloat(2.0, 10, 0.6);

  // Glow des cartes
  const cardGlow = (startDelay: number) => {
    if (time < startDelay) return { shadowScale: 0, extraBlur: 0 };
    const glow = pulseValue(time - startDelay, 3);
    const shadowScale = interpolate(glow, [-1, 1], [0, isPortrait ? 20 : 30]);
    const extraBlur = interpolate(glow, [-1, 1], [0, isPortrait ? 20 : 30]);
    return { shadowScale, extraBlur };
  };
  const glow1 = cardGlow(0.9);
  const glow2 = cardGlow(1.75);
  const glow3 = cardGlow(2.0);

  // Logo breathing
  const breath = pulseValue(time, 3.5);
  const logoScale = interpolate(breath, [-1, 1], [1, 1.07]);
  const logoTranslateY = interpolate(breath, [-1, 1], [0, -6]);
  const logoDropShadow = interpolate(breath, [-1, 1], [18, 28]);

  // Divider pulse
  const dividerPulse = (delay: number) => {
    if (time < delay) return { width: isPortrait ? 50 : 70, opacity: 0.6 };
    const wave = pulseValue(time - delay, 2);
    const width = interpolate(wave, [-1, 1], [isPortrait ? 50 : 70, isPortrait ? 80 : 100]);
    const opacityDiv = interpolate(wave, [-1, 1], [0.6, 1]);
    return { width, opacity: opacityDiv };
  };
  const divider1 = dividerPulse(0);
  const divider2 = dividerPulse(0.5);
  const divider3 = dividerPulse(1);

  // Badges sous chaque carte (slide up)
  const badgeSlideUp = (startDelay: number) => {
    const start = startDelay * fps;
    const end = (startDelay + 0.4) * fps;
    if (frame < start) return { opacity: 0, translateY: 20 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    return { opacity: progress, translateY: interpolate(progress, [0, 1], [20, 0]) };
  };
  const badge1 = badgeSlideUp(0.65);
  const badge2 = badgeSlideUp(1.45);
  const badge3 = badgeSlideUp(1.75);

  // ---------- Title ----------
  const titleEntranceProgress = cardEntrance(1.5, 0.9, Easing.bezier(0.2, 0.9, 0.3, 1.2));
  const titleOpacity = interpolate(titleEntranceProgress, [0, 0.45, 1], [0, 1, 1], clamp);
  const titleTranslateY = interpolate(titleEntranceProgress, [0, 0.45, 1], [isPortrait ? 50 : 90, -10, 0], clamp);
  const titleScale = interpolate(titleEntranceProgress, [0, 0.45, 1], [0.93, 1.01, 1], clamp);
  const titleBlur = interpolate(titleEntranceProgress, [0, 0.45, 1], [8, 0, 0], clamp);

  const titleShine = `${((time % 4) / 4) * 200}% 50%`;

  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // Layout responsif
  const contentWidth = width * (isPortrait ? 0.88 : 0.88);
  const cardsGap = isPortrait ? height * 0.03 : 80;
  const cardsDirection = isPortrait ? "column" : "row";
  const cardWidth = isPortrait ? "100%" : "auto";
  const cardMinWidth = isPortrait ? "auto" : 400;
  const cardPadding = isPortrait ? "40px 30px" : "60px 80px";
  const cardBorderRadius = isPortrait ? 30 : 40;
  const cardGap = isPortrait ? 24 : 32;
  const logoSize = isPortrait ? 140 : 180;
  const cardTitleFontSize = isPortrait ? 38 : 50;
  const badgeFontSizeCard = isPortrait ? 18 : 22;
  const badgePaddingCard = isPortrait ? "8px 24px" : "10px 34px";
  const titleFontSize = isPortrait ? 56 : 110;
  const titleLineHeight = isPortrait ? 1.2 : 1.2;
  const badgeMainFontSize = isPortrait ? 28 : 38;
  const badgeMainPadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeMainGap = isPortrait ? 20 : 28;
  const badgeMainDotSize = isPortrait ? 16 : 20;
  const mainGap = isPortrait ? height * 0.05 : 90;

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: mainGap,
          zIndex: 20,
          width: contentWidth,
          maxWidth: 3200,
        }}
      >
        {/* Badge principal */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: badgeMainGap,
            background: "rgba(224,237,255,0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: badgeMainPadding,
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
            filter: `blur(${badgeBlur}px)`,
          }}
        >
          <div
            style={{
              width: badgeMainDotSize,
              height: badgeMainDotSize,
              background: "#2563EB",
              borderRadius: "50%",
              opacity: dotOpacityVal,
              boxShadow: `0 0 12px #2563EB, 0 0 0 ${dotShadow}px rgba(37,99,235,0.4)`,
              transform: `scale(${dotScale})`,
            }}
          />
          <span
            style={{
              fontSize: badgeMainFontSize,
              fontWeight: 700,
              letterSpacing: isPortrait ? 4 : 6,
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            CLARTÉ & TRAÇABILITÉ
          </span>
        </div>

        {/* Container des 3 cartes (flex direction responsive) */}
        <div
          style={{
            display: "flex",
            flexDirection: cardsDirection,
            gap: cardsGap,
            alignItems: "stretch",
            width: "100%",
          }}
        >
          {/* Carte 1 - Claire */}
          <div
            style={{
              flex: 1,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.5)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: cardGap,
              width: cardWidth,
              minWidth: cardMinWidth,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow1.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card1Opacity,
              transform: `translateX(${card1TranslateX + float1.y * 0}px) translateY(${float1.y}px) scale(${card1Scale}) rotate(${card1Rotate + float1.rotate}deg)`,
              filter: `blur(${card1Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: isPortrait ? 24 : 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              01
            </div>
            <Img
              src={staticFile("claire.png")}
              style={{
                width: logoSize,
                height: logoSize,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
            />
            <div
              style={{
                width: divider1.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider1.opacity,
              }}
            />
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Claire
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge1.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: badgeFontSizeCard,
                fontWeight: 700,
                letterSpacing: 3,
                padding: badgePaddingCard,
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge1.opacity,
              }}
            >
              CLAIRE
            </div>
          </div>

          {/* Carte 2 - Structurée */}
          <div
            style={{
              flex: 1,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.2)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: cardGap,
              width: cardWidth,
              minWidth: cardMinWidth,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow2.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card2Opacity,
              transform: `translateY(${card2TranslateY + float2.y}px) scale(${card2Scale})`,
              filter: `blur(${card2Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: isPortrait ? 24 : 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              02
            </div>
            <Img
              src={staticFile("structuree.png")}
              style={{
                width: logoSize,
                height: logoSize,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
            />
            <div
              style={{
                width: divider2.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider2.opacity,
              }}
            />
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Structurée
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge2.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: badgeFontSizeCard,
                fontWeight: 700,
                letterSpacing: 3,
                padding: badgePaddingCard,
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge2.opacity,
              }}
            >
              STRUCTURÉE
            </div>
          </div>

          {/* Carte 3 - Tracée */}
          <div
            style={{
              flex: 1,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.2)",
              borderRadius: cardBorderRadius,
              padding: cardPadding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: cardGap,
              width: cardWidth,
              minWidth: cardMinWidth,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 30px -10px rgba(0,0,0,0.1), 0 0 ${glow3.shadowScale}px rgba(37,99,235,0.08)`,
              opacity: card3Opacity,
              transform: `translateX(${card3TranslateX + float3.y * 0}px) translateY(${float3.y}px) scale(${card3Scale}) rotate(${card3Rotate + float3.rotate}deg)`,
              filter: `blur(${card3Blur}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 22,
                right: 32,
                fontSize: isPortrait ? 24 : 32,
                fontWeight: 800,
                color: "rgba(37,99,235,0.15)",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              03
            </div>
            <Img
              src={staticFile("tracee.png")}
              style={{
                width: logoSize,
                height: logoSize,
                objectFit: "contain",
                filter: `drop-shadow(0 ${logoDropShadow}px 20px rgba(37,99,235,0.18))`,
                transform: `scale(${logoScale}) translateY(${logoTranslateY}px)`,
              }}
            />
            <div
              style={{
                width: divider3.width,
                height: 4,
                background: "#2563EB",
                borderRadius: 2,
                opacity: divider3.opacity,
              }}
            />
            <div
              style={{
                fontSize: cardTitleFontSize,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Tracée
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: `translateX(-50%) translateY(${badge3.translateY}px)`,
                background: "#2563EB",
                color: "white",
                fontSize: badgeFontSizeCard,
                fontWeight: 700,
                letterSpacing: 3,
                padding: badgePaddingCard,
                borderRadius: "40px 40px 0 0",
                whiteSpace: "nowrap",
                opacity: badge3.opacity,
              }}
            >
              TRACÉE
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
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          Chaque étape est{" "}
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
            claire
          </span>
          ,<br />
          structurée et tracée.
        </div>
      </div>
    </div>
  );
};