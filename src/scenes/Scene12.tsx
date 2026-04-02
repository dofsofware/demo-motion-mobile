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

export const Scene12 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Helper slideFromLeft (avec valeurs adaptées au portrait) ----------
  const slideFromLeft = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    if (frame < startFrame) return { opacity: 0, translateX: isPortrait ? -120 : -220, scale: 0.93, blur: 8 };
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [isPortrait ? -120 : -220, 10, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.93, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [8, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };

  // Badge
  const badgeAnim = slideFromLeft(0, 0.6);
  const badgePulse = pulseValue(time - 0.6, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, isPortrait ? 8 : 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacityVal = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // Title
  const titleAnim = slideFromLeft(0.1, 0.65);
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // ---------- Helper slideFromRight ----------
  const slideFromRight = (startDelaySec: number, durationSec: number) => {
    const startFrame = startDelaySec * fps;
    const endFrame = (startDelaySec + durationSec) * fps;
    if (frame < startFrame) return { opacity: 0, translateX: isPortrait ? 120 : 220, scale: 0.93, blur: 8 };
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 1], [isPortrait ? 120 : 220, -10, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 1], [0.93, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [8, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };
  const panelAnim = slideFromRight(0.05, 0.65);

  // Workflow title (pop)
  const titlePop = () => {
    const start = 0.2 * fps;
    const end = (0.2 + 0.4) * fps;
    if (frame < start) return { opacity: 0, translateY: -16, blur: 4 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [-16, 0]);
    const blur = interpolate(progress, [0, 1], [4, 0]);
    return { opacity: op, translateY, blur };
  };
  const workflowTitleAnim = titlePop();

  // Steps reveal (stepReveal) avec valeurs adaptées
  const stepReveal = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: isPortrait ? 60 : 80, scale: 0.92, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    const op = interpolate(progress, [0, 0.55, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.55, 1], [isPortrait ? 60 : 80, -6, 0], clamp);
    const scale = interpolate(progress, [0, 0.55, 1], [0.92, 1.01, 1], clamp);
    const blur = interpolate(progress, [0, 0.55, 1], [6, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };

  const step1 = stepReveal(0.3, 0.45);
  const step2 = stepReveal(0.6, 0.45);
  const step3 = stepReveal(0.9, 0.45);
  const step4 = stepReveal(1.2, 0.45);

  // Checkmark pop
  const checkPop = (startDelaySec: number, durationSec: number) => {
    const start = startDelaySec * fps;
    const end = (startDelaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, scale: 0, rotate: -90 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.22, 1, 0.5, 1),
    });
    const op = progress;
    const scale = interpolate(progress, [0, 0.6, 1], [0, 1.2, 1]);
    const rotate = interpolate(progress, [0, 0.6, 1], [-90, 5, 0]);
    return { opacity: op, scale, rotate };
  };

  const check1 = checkPop(0.78, 0.3);
  const check2 = checkPop(1.08, 0.3);
  const check3 = checkPop(1.38, 0.3);
  const check4 = checkPop(1.68, 0.3);

  // Custom tag fade in
  const tagFade = () => {
    const start = 1.6 * fps;
    const end = (1.6 + 0.4) * fps;
    if (frame < start) return { opacity: 0, translateY: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.ease });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [12, 0]);
    return { opacity: op, translateY };
  };
  const tagAnim = tagFade();

  // Step number pulse
  const numberPulse = (delaySec: number) => {
    const t = time - delaySec;
    if (t < 0) return { shadowScale: 0, scale: 1 };
    const wave = pulseValue(t, 2.5);
    const shadowScale = interpolate(wave, [-1, 1], [16, 24]);
    const scale = interpolate(wave, [-1, 1], [1, 1.06]);
    return { shadowScale, scale };
  };

  const pulse1 = numberPulse(0);
  const pulse2 = numberPulse(0.5);
  const pulse3 = numberPulse(1.0);
  const pulse4 = numberPulse(1.5);

  // Custom tag dot pulse
  const tagDotPulse = pulseValue(time, 1.6);
  const tagDotScale = interpolate(tagDotPulse, [-1, 1], [1, 1.2]);
  const tagDotShadow = interpolate(tagDotPulse, [-1, 1], [0, 8]);

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
  const titleFontSize = isPortrait ? 48 : 90;
  const titleLineHeight = isPortrait ? 1.2 : 1.1;
  const panelWidth = isPortrait ? "100%" : "1000px";
  const panelPadding = isPortrait ? 30 : 60;
  const panelBorderRadius = isPortrait ? 30 : 40;
  const workflowTitleFontSize = isPortrait ? 32 : 40;
  const stepCircleSize = isPortrait ? 48 : 60;
  const stepNumberFontSize = isPortrait ? 22 : 28;
  const stepTextFontSize = isPortrait ? 26 : 36;
  const stepTextPadding = isPortrait ? "16px 20px" : "22px 32px";
  const stepGap = isPortrait ? 20 : 32;
  const stepMarginBottom = isPortrait ? 20 : 28;
  const checkSize = isPortrait ? 36 : 44;
  const checkFontSize = isPortrait ? 18 : 22;
  const tagFontSize = isPortrait ? 20 : 26;
  const tagPadding = isPortrait ? "8px 20px" : "12px 32px";
  const tagGap = isPortrait ? 10 : 14;
  const tagDotSize = isPortrait ? 8 : 10;

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
              transform: `translateX(${badgeAnim.translateX}px) scale(${badgeAnim.scale})`,
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
              VOS PROPRES RÈGLES
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
              transform: `translateX(${titleAnim.translateX}px) scale(${titleAnim.scale})`,
              filter: `blur(${titleAnim.blur}px)`,
            }}
          >
            Mais surtout…<br />
            Définissez vos propres<br />
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
              workflows.
            </span>
          </div>
        </div>

        {/* Colonne droite : panneau workflow */}
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
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Titre du workflow */}
            <div
              style={{
                fontSize: workflowTitleFontSize,
                fontWeight: 700,
                color: "#0F2B6D",
                marginBottom: isPortrait ? 30 : 50,
                fontFamily: "'Sora', sans-serif",
                opacity: workflowTitleAnim.opacity,
                transform: `translateY(${workflowTitleAnim.translateY}px)`,
                filter: `blur(${workflowTitleAnim.blur}px)`,
              }}
            >
              Mon Workflow Transit
            </div>

            {/* Step 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: stepGap,
                marginBottom: stepMarginBottom,
                position: "relative",
                opacity: step1.opacity,
                transform: `translateX(${step1.translateX}px) scale(${step1.scale})`,
                filter: `blur(${step1.blur}px)`,
              }}
            >
              <div
                style={{
                  width: stepCircleSize,
                  height: stepCircleSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: stepNumberFontSize,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: `0 4px ${pulse1.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${pulse1.scale})`,
                }}
              >
                1
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 20,
                  padding: stepTextPadding,
                  fontSize: stepTextFontSize,
                  fontWeight: 500,
                  color: "#0F2B6D",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    borderRadius: "4px 0 0 4px",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                  }}
                />
                Réception commande
              </div>
              <div
                style={{
                  width: checkSize,
                  height: checkSize,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: checkFontSize,
                  color: "#16A34A",
                  flexShrink: 0,
                  opacity: check1.opacity,
                  transform: `scale(${check1.scale}) rotate(${check1.rotate}deg)`,
                }}
              >
                ✓
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: stepGap,
                marginBottom: stepMarginBottom,
                position: "relative",
                opacity: step2.opacity,
                transform: `translateX(${step2.translateX}px) scale(${step2.scale})`,
                filter: `blur(${step2.blur}px)`,
              }}
            >
              <div
                style={{
                  width: stepCircleSize,
                  height: stepCircleSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: stepNumberFontSize,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: `0 4px ${pulse2.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${pulse2.scale})`,
                }}
              >
                2
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 20,
                  padding: stepTextPadding,
                  fontSize: stepTextFontSize,
                  fontWeight: 500,
                  color: "#0F2B6D",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    borderRadius: "4px 0 0 4px",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                  }}
                />
                Vérification documents
              </div>
              <div
                style={{
                  width: checkSize,
                  height: checkSize,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: checkFontSize,
                  color: "#16A34A",
                  flexShrink: 0,
                  opacity: check2.opacity,
                  transform: `scale(${check2.scale}) rotate(${check2.rotate}deg)`,
                }}
              >
                ✓
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: stepGap,
                marginBottom: stepMarginBottom,
                position: "relative",
                opacity: step3.opacity,
                transform: `translateX(${step3.translateX}px) scale(${step3.scale})`,
                filter: `blur(${step3.blur}px)`,
              }}
            >
              <div
                style={{
                  width: stepCircleSize,
                  height: stepCircleSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: stepNumberFontSize,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: `0 4px ${pulse3.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${pulse3.scale})`,
                }}
              >
                3
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 20,
                  padding: stepTextPadding,
                  fontSize: stepTextFontSize,
                  fontWeight: 500,
                  color: "#0F2B6D",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    borderRadius: "4px 0 0 4px",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                  }}
                />
                Dédouanement
              </div>
              <div
                style={{
                  width: checkSize,
                  height: checkSize,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: checkFontSize,
                  color: "#16A34A",
                  flexShrink: 0,
                  opacity: check3.opacity,
                  transform: `scale(${check3.scale}) rotate(${check3.rotate}deg)`,
                }}
              >
                ✓
              </div>
            </div>

            {/* Step 4 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: stepGap,
                marginBottom: stepMarginBottom,
                position: "relative",
                opacity: step4.opacity,
                transform: `translateX(${step4.translateX}px) scale(${step4.scale})`,
                filter: `blur(${step4.blur}px)`,
              }}
            >
              <div
                style={{
                  width: stepCircleSize,
                  height: stepCircleSize,
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: stepNumberFontSize,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: `0 4px ${pulse4.shadowScale}px rgba(37,99,235,0.35)`,
                  transform: `scale(${pulse4.scale})`,
                }}
              >
                4
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: 20,
                  padding: stepTextPadding,
                  fontSize: stepTextFontSize,
                  fontWeight: 500,
                  color: "#0F2B6D",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    borderRadius: "4px 0 0 4px",
                    background: "linear-gradient(180deg, #2563EB, #60A5FA)",
                  }}
                />
                Livraison client
              </div>
              <div
                style={{
                  width: checkSize,
                  height: checkSize,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.15)",
                  border: "2px solid rgba(34,197,94,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: checkFontSize,
                  color: "#16A34A",
                  flexShrink: 0,
                  opacity: check4.opacity,
                  transform: `scale(${check4.scale}) rotate(${check4.rotate}deg)`,
                }}
              >
                ✓
              </div>
            </div>

            {/* Tag personnalisable */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: tagGap,
                marginTop: isPortrait ? 24 : 36,
                background: "rgba(37,99,235,0.1)",
                border: "1.5px solid rgba(37,99,235,0.25)",
                borderRadius: 60,
                padding: tagPadding,
                opacity: tagAnim.opacity,
                transform: `translateY(${tagAnim.translateY}px)`,
              }}
            >
              <div
                style={{
                  width: tagDotSize,
                  height: tagDotSize,
                  background: "#2563EB",
                  borderRadius: "50%",
                  transform: `scale(${tagDotScale})`,
                  boxShadow: `0 0 0 ${tagDotShadow}px rgba(37,99,235,0.4)`,
                }}
              />
              <span
                style={{
                  fontSize: tagFontSize,
                  fontWeight: 600,
                  color: "#2563EB",
                  letterSpacing: 1,
                }}
              >
                100% personnalisable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};