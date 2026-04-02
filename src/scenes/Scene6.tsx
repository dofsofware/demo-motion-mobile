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

export const Scene6 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // Background elements (responsifs)
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

  // Entrées animées : image (gauche) / texte (droite)
  const entranceProgress = interpolate(frame, [0, 0.95 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.1, 0.35, 1),
  });

  const imageOpacity = interpolate(entranceProgress, [0, 0.4, 1], [0, 0.7, 1], clamp);
  const imageTranslateX = interpolate(
    entranceProgress,
    [0, 0.4, 0.7, 1],
    [isPortrait ? -120 : -380, 12, -5, 0],
    clamp
  );
  const imageBlur = interpolate(entranceProgress, [0, 0.4, 1], [18, 2, 0], clamp);
  const imageFloat = Math.sin(((time - 1.2) / 4) * Math.PI * 2) * (isPortrait ? 8 : 12);

  const textOpacity = interpolate(entranceProgress, [0, 0.4, 1], [0, 0.7, 1], clamp);
  const textTranslateX = interpolate(
    entranceProgress,
    [0, 0.4, 0.7, 1],
    [isPortrait ? 120 : 380, -12, 5, 0],
    clamp
  );
  const textBlur = interpolate(entranceProgress, [0, 0.4, 1], [18, 2, 0], clamp);

  // Badge animations continues
  const badgePulse = pulseValue(time, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, isPortrait ? 8 : 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacityVal = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // SVG animations continues
  const svgFloatY = Math.sin((time / 3) * Math.PI * 2) * 4;
  const svgRotate = Math.sin((time / 3) * Math.PI * 2) * 1;

  // Barres : hauteurs variables selon pulse
  const bar1Progress = pulseValue(time, 2);
  const bar1Height = interpolate(bar1Progress, [-1, 1], [18, 24]);
  const bar2Progress = pulseValue(time, 2.2);
  const bar2Height = interpolate(bar2Progress, [-1, 1], [28, 32]);
  const bar3Progress = pulseValue(time, 2.5);
  const bar3Height = interpolate(bar3Progress, [-1, 1], [38, 42]);
  const bar4Progress = pulseValue(time, 1.8);
  const bar4Height = interpolate(bar4Progress, [-1, 1], [23, 28]);

  // Ligne pointillée animée
  const lineDashOffset = loop(time, 1) * 16;
  const dashOffset = interpolate(lineDashOffset, [0, 0.5, 1], [0, 16, 0]);

  // Titre : shine + mot "marges" pulsant
  const titleShine = `${((time % 4) / 4) * 200}% 50%`;
  const wordPulse = pulseValue(time, 2.2);
  const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

  // Layout responsive
  const contentWidth = width * (isPortrait ? 0.85 : 0.9);
  const contentHeight = height * (isPortrait ? 0.85 : 0.85);
  const contentDirection = isPortrait ? "column" : "row";
  const contentGap = isPortrait ? height * 0.04 : 80;
  const imageFlex = isPortrait ? "0 0 auto" : 1.1;
  const imageMaxHeight = isPortrait ? contentHeight * 0.42 : "100%";
  const textFlex = isPortrait ? "0 0 auto" : 1;
  const textAlign = isPortrait ? "center" : "left";
  const textItemsAlign = isPortrait ? "center" : "flex-start";
  const textGap = isPortrait ? height * 0.025 : 40;

  // Tailles dynamiques
  const badgeFontSize = isPortrait ? 26 : 38;
  const badgePadding = isPortrait ? "12px 40px" : "20px 70px";
  const badgeGap = isPortrait ? 20 : 28;
  const badgeDotSize = isPortrait ? 14 : 20;
  const svgSize = isPortrait ? 180 : 260;
  const titleFontSize = isPortrait ? 72 : 130;
  const titleLineHeight = isPortrait ? 1.1 : 1.15;

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

      {/* Contenu principal : deux colonnes responsives */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          width: contentWidth,
          height: contentHeight,
          display: "flex",
          flexDirection: contentDirection,
          alignItems: "center",
          justifyContent: "center",
          gap: contentGap,
        }}
      >
        {/* Colonne image (gauche en paysage, haut en portrait) */}
        <div
          style={{
            flex: imageFlex,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: imageOpacity,
            transform: isPortrait
              ? `translateY(${imageTranslateX * 0.35}px)`
              : `translateX(${imageTranslateX}px)`,
            filter: `blur(${imageBlur}px)`,
            maxHeight: imageMaxHeight,
            width: "100%",
          }}
        >
          <Img
            src={staticFile("marge.png")}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: imageMaxHeight,
              objectFit: "contain",
              transform: `translateY(${imageFloat}px)`,
              filter: `drop-shadow(0 40px 80px rgba(37,99,235,0.18))`,
            }}
          />
        </div>

        {/* Colonne texte (droite en paysage, bas en portrait) */}
        <div
          style={{
            flex: textFlex,
            display: "flex",
            flexDirection: "column",
            alignItems: textItemsAlign,
            justifyContent: "center",
            gap: textGap,
            opacity: textOpacity,
            transform: `translateX(${textTranslateX}px)`,
            filter: `blur(${textBlur}px)`,
            textAlign,
            width: "100%",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: badgeGap,
              background: "rgba(224, 237, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: `2px solid rgba(37, 99, 235, ${badgeBorderOpacity})`,
              borderRadius: 120,
              padding: badgePadding,
              width: "fit-content",
              boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37, 99, 235, 0.2)`,
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
              PROBLÈME 3/3
            </span>
          </div>

          {/* SVG animé (euro + barres + ligne) */}
          <svg
            width={svgSize}
            height={svgSize}
            viewBox="0 0 100 100"
            style={{
              overflow: "visible",
              filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))",
              transform: `translateY(${svgFloatY}px) rotate(${svgRotate}deg)`,
            }}
          >
            <defs>
              <linearGradient id="ringGrad06" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glowSvg06" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="rgba(219,234,254,0.6)"
              stroke="url(#ringGrad06)"
              strokeWidth="3.5"
              filter="url(#glowSvg06)"
            />
            <text
              x="50"
              y="62"
              textAnchor="middle"
              fontSize="48"
              fill="#1E3A8A"
              fontFamily="Sora, sans-serif"
              fontWeight="800"
              stroke="#2563EB"
              strokeWidth="1"
            >
              €
            </text>
            {/* Barres avec y calculé dynamiquement pour rester ancrées en bas (y = 88 - hauteur) */}
            <rect x="28" y={88 - bar1Height} width="8" height={bar1Height} fill="#EF4444" opacity="0.7" rx="2" />
            <rect x="40" y={88 - bar2Height} width="8" height={bar2Height} fill="#F59E0B" opacity="0.7" rx="2" />
            <rect x="52" y={88 - bar3Height} width="8" height={bar3Height} fill="#22C55E" opacity="0.7" rx="2" />
            <rect x="64" y={88 - bar4Height} width="8" height={bar4Height} fill="#EF4444" opacity="0.7" rx="2" />
            <line
              x1="28"
              y1="88"
              x2="72"
              y2="88"
              stroke="#DC2626"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeDashoffset={dashOffset}
            />
          </svg>

          {/* Titre principal */}
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: titleLineHeight,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            <div>Vous ne maîtrisez pas</div>
            <div>
              vos{" "}
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
                marges
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};