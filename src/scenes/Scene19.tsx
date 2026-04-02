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

export const Scene19 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Badge entrance (slideDownPop adapté) ----------
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

  // ---------- Cartes entrance (cardRise with staggered delays, adapté) ----------
  const cardRise = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    const translateStart = isPortrait ? 40 : 60;
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

  const card1Anim = cardRise(0.8, 0.7);
  const card2Anim = cardRise(1.0, 0.7);
  const card3Anim = cardRise(1.2, 0.7);
  const card4Anim = cardRise(1.4, 0.7);

  // ---------- Animations continues (inchangées mais avec des valeurs adaptées si besoin) ----------
  const pulseRingCardWave = pulseValue(time, 1.8);
  const pulseRingCardScale = interpolate(pulseRingCardWave, [-1, 1], [0.8, 1.4]);
  const pulseRingCardOpacity = interpolate(pulseRingCardWave, [-1, 1], [0.6, 0]);

  const logoGlowWave = pulseValue(time, 1.5);
  const logoGlowSize = interpolate(logoGlowWave, [-1, 1], [0, 15]);
  const logoGlowOpacity = interpolate(logoGlowWave, [-1, 1], [0.2, 0]);

  const activeBadgeWave = pulseValue(time, 1.2);
  const activeBadgeScale = interpolate(activeBadgeWave, [-1, 1], [1, 1.05]);
  const activeBadgeOpacity = interpolate(activeBadgeWave, [-1, 1], [0.8, 1]);

  // ---------- Titre (riseGlow adapté) ----------
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

  // ---------- Sous-titre (slideUpFade adapté) ----------
  const subtitleEntrance = interpolate(frame, [0, 0.85 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
  });
  const subtitleOpacity = interpolate(subtitleEntrance, [0, 1], [0, 1], clamp);
  const subtitleTranslateY = interpolate(subtitleEntrance, [0, 1], [isPortrait ? 40 : 70, 0], clamp);
  const subtitleScale = interpolate(subtitleEntrance, [0, 1], [0.95, 1], clamp);
  const subtitleBlur = interpolate(subtitleEntrance, [0, 1], [6, 0], clamp);

  // ---------- Layout responsif ----------
  const contentWidth = width * (isPortrait ? 0.88 : 0.85);
  const mainGap = isPortrait ? height * 0.05 : 70;
  const badgeFontSize = isPortrait ? 28 : 38;
  const badgePadding = isPortrait ? "14px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 16 : 20;

  const cardsContainerDirection = isPortrait ? "column" : "row";
  const cardsGap = isPortrait ? 30 : 70;
  const cardWidth = isPortrait ? "100%" : 320;
  const cardPadding = isPortrait ? "30px 20px" : "40px 30px";
  const cardBorderRadius = isPortrait ? 40 : 48;
  const cardIconContainerSize = isPortrait ? 100 : 140;
  const cardIconImgSize = isPortrait ? 70 : 100;
  const cardIconBorderRadius = isPortrait ? 30 : 40;
  const cardTitleFontSize = isPortrait ? 32 : 38;
  const cardDescFontSize = isPortrait ? 20 : 26;
  const cardBadgeFontSize = isPortrait ? 20 : 24;
  const cardBadgePadding = isPortrait ? "6px 18px" : "8px 24px";

  const titleFontSize = isPortrait ? 56 : 110;
  const titleLineHeight = isPortrait ? 1.2 : 1.2;
  const subtitleFontSize = isPortrait ? 32 : 52;
  const subtitlePadding = isPortrait ? "8px 24px" : "12px 40px";
  const subtitleBorderRadius = isPortrait ? 60 : 80;

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
            FLEXIBILITÉ MAXIMALE
          </span>
        </div>

        {/* Grille des cartes (4 canaux) */}
        <div
          style={{
            width: "100%",
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: cardsContainerDirection,
              gap: cardsGap,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: isPortrait ? "nowrap" : "wrap",
            }}
          >
            {/* Carte 1: WhatsApp */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isPortrait ? 20 : 30,
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
                width: cardWidth,
                border: "2px solid rgba(37,99,235,0.2)",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
                opacity: card1Anim.opacity,
                transform: `translateY(${card1Anim.translateY}px) scale(${card1Anim.scale})`,
                filter: `blur(${card1Anim.blur}px)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  background: `radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)`,
                  borderRadius: cardBorderRadius,
                  transform: `translate(-50%, -50%) scale(${pulseRingCardScale})`,
                  opacity: pulseRingCardOpacity,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: cardIconContainerSize,
                  height: cardIconContainerSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  borderRadius: cardIconBorderRadius,
                  boxShadow: `0 0 0 ${logoGlowSize}px rgba(37,99,235,${logoGlowOpacity})`,
                }}
              >
                <Img
                  src={staticFile("whatsapp.png")}
                  style={{
                    maxWidth: cardIconImgSize,
                    maxHeight: cardIconImgSize,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: cardTitleFontSize,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                }}
              >
                WhatsApp
              </div>
              <div
                style={{
                  fontSize: cardDescFontSize,
                  color: "#2C3E66",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Alertes instantanées<br />Suivi de dossiers
              </div>
              <div
                style={{
                  background: "#22C55E",
                  color: "white",
                  padding: cardBadgePadding,
                  borderRadius: 40,
                  fontSize: cardBadgeFontSize,
                  fontWeight: 600,
                  letterSpacing: 1,
                  marginTop: 10,
                  opacity: activeBadgeOpacity,
                  transform: `scale(${activeBadgeScale})`,
                }}
              >
                ACTIVÉ
              </div>
            </div>

            {/* Carte 2: SMS */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isPortrait ? 20 : 30,
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
                width: cardWidth,
                border: "2px solid rgba(37,99,235,0.2)",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
                opacity: card2Anim.opacity,
                transform: `translateY(${card2Anim.translateY}px) scale(${card2Anim.scale})`,
                filter: `blur(${card2Anim.blur}px)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  background: `radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)`,
                  borderRadius: cardBorderRadius,
                  transform: `translate(-50%, -50%) scale(${pulseRingCardScale})`,
                  opacity: pulseRingCardOpacity,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: cardIconContainerSize,
                  height: cardIconContainerSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  borderRadius: cardIconBorderRadius,
                  boxShadow: `0 0 0 ${logoGlowSize}px rgba(37,99,235,${logoGlowOpacity})`,
                }}
              >
                <Img
                  src={staticFile("sms.png")}
                  style={{
                    maxWidth: cardIconImgSize,
                    maxHeight: cardIconImgSize,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: cardTitleFontSize,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                }}
              >
                SMS
              </div>
              <div
                style={{
                  fontSize: cardDescFontSize,
                  color: "#2C3E66",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Notifications critiques<br />Hors connexion
              </div>
              <div
                style={{
                  background: "#22C55E",
                  color: "white",
                  padding: cardBadgePadding,
                  borderRadius: 40,
                  fontSize: cardBadgeFontSize,
                  fontWeight: 600,
                  letterSpacing: 1,
                  marginTop: 10,
                  opacity: activeBadgeOpacity,
                  transform: `scale(${activeBadgeScale})`,
                }}
              >
                ACTIVÉ
              </div>
            </div>

            {/* Carte 3: In-App */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isPortrait ? 20 : 30,
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
                width: cardWidth,
                border: "2px solid rgba(37,99,235,0.2)",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
                opacity: card3Anim.opacity,
                transform: `translateY(${card3Anim.translateY}px) scale(${card3Anim.scale})`,
                filter: `blur(${card3Anim.blur}px)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  background: `radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)`,
                  borderRadius: cardBorderRadius,
                  transform: `translate(-50%, -50%) scale(${pulseRingCardScale})`,
                  opacity: pulseRingCardOpacity,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: cardIconContainerSize,
                  height: cardIconContainerSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  borderRadius: cardIconBorderRadius,
                  boxShadow: `0 0 0 ${logoGlowSize}px rgba(37,99,235,${logoGlowOpacity})`,
                }}
              >
                <Img
                  src={staticFile("notification.png")}
                  style={{
                    maxWidth: cardIconImgSize,
                    maxHeight: cardIconImgSize,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: cardTitleFontSize,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                }}
              >
                In-App
              </div>
              <div
                style={{
                  fontSize: cardDescFontSize,
                  color: "#2C3E66",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Notifications push<br />Expérience mobile
              </div>
              <div
                style={{
                  background: "#22C55E",
                  color: "white",
                  padding: cardBadgePadding,
                  borderRadius: 40,
                  fontSize: cardBadgeFontSize,
                  fontWeight: 600,
                  letterSpacing: 1,
                  marginTop: 10,
                  opacity: activeBadgeOpacity,
                  transform: `scale(${activeBadgeScale})`,
                }}
              >
                ACTIVÉ
              </div>
            </div>

            {/* Carte 4: Email */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isPortrait ? 20 : 30,
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: cardBorderRadius,
                padding: cardPadding,
                width: cardWidth,
                border: "2px solid rgba(37,99,235,0.2)",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
                opacity: card4Anim.opacity,
                transform: `translateY(${card4Anim.translateY}px) scale(${card4Anim.scale})`,
                filter: `blur(${card4Anim.blur}px)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  background: `radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)`,
                  borderRadius: cardBorderRadius,
                  transform: `translate(-50%, -50%) scale(${pulseRingCardScale})`,
                  opacity: pulseRingCardOpacity,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: cardIconContainerSize,
                  height: cardIconContainerSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  borderRadius: cardIconBorderRadius,
                  boxShadow: `0 0 0 ${logoGlowSize}px rgba(37,99,235,${logoGlowOpacity})`,
                }}
              >
                <Img
                  src={staticFile("mail.png")}
                  style={{
                    maxWidth: cardIconImgSize,
                    maxHeight: cardIconImgSize,
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: cardTitleFontSize,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                }}
              >
                Email
              </div>
              <div
                style={{
                  fontSize: cardDescFontSize,
                  color: "#2C3E66",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Rapports détaillés<br />Pièces jointes
              </div>
              <div
                style={{
                  background: "#22C55E",
                  color: "white",
                  padding: cardBadgePadding,
                  borderRadius: 40,
                  fontSize: cardBadgeFontSize,
                  fontWeight: 600,
                  letterSpacing: 1,
                  marginTop: 10,
                  opacity: activeBadgeOpacity,
                  transform: `scale(${activeBadgeScale})`,
                }}
              >
                ACTIVÉ
              </div>
            </div>
          </div>
        </div>

        {/* Titre principal */}
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
            maxWidth: 2800,
            margin: "0 auto",
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
            filter: `blur(${titleBlur}px)`,
          }}
        >
          Plusieurs canaux activés<br />
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
            simultanément.
          </span>
        </h1>

        {/* Sous-titre */}
        <p
          style={{
            fontSize: subtitleFontSize,
            fontWeight: 500,
            color: "#2C3E66",
            letterSpacing: "-0.01em",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(4px)",
            padding: subtitlePadding,
            borderRadius: subtitleBorderRadius,
            display: "inline-block",
            fontFamily: "'Sora', sans-serif",
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px) scale(${subtitleScale})`,
            filter: `blur(${subtitleBlur}px)`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.02)",
            textAlign: "center",
          }}
        >
          Aucune information ne passe à travers les mailles
        </p>
      </div>
    </div>
  );
};