import {
  Easing,
  interpolate,
  spring,
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
  if (duration <= 0) {
    return 0;
  }

  return (time % duration) / duration;
};

const pulseValue = (time: number, duration: number, phase = 0) =>
  Math.sin(((time + phase) / duration) * Math.PI * 2);

export const Scene1 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const duration = outFrame - inFrame;

  const tIn = Math.max(0, Math.min(1, frame / crossfadeFrames));
  const tOut = Math.max(0, Math.min(1, (duration - frame) / crossfadeFrames));
  const opacity = Math.min(tIn, tOut);

  const push = interpolate(frame, [0, crossfadeFrames], [8, 0], clamp);
  const outZoom = interpolate(
    frame,
    [duration - crossfadeFrames, duration],
    [1, 1.06],
    clamp
  );

  const gridOffset = (time / 18) * 140;
  const line1Progress = loop(time, 12);
  const line2Progress = loop(time, 14);
  const line1Translate = interpolate(line1Progress, [0, 1], [-30, 40]);
  const line2Translate = interpolate(line2Progress, [0, 1], [40, -50]);
  const line1Opacity = interpolate(line1Progress, [0, 0.2, 0.8, 1], [0, 0.5, 0.5, 0]);
  const line2Opacity = interpolate(line2Progress, [0, 0.2, 0.8, 1], [0, 0.4, 0.4, 0]);

  const orb1Progress = pulseValue(time, 22);
  const orb2Progress = pulseValue(time, 26, 3);
  const orb3Progress = pulseValue(time, 18, 1.8);

  const imageProgress = interpolate(frame, [0.2 * fps, 1.2 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const imageX = interpolate(imageProgress, [0, 0.6, 1], [-280, 20, 0], clamp);
  const imageScale = interpolate(imageProgress, [0, 0.6, 1], [0.92, 1.01, 1], clamp);
  const imageBlur = interpolate(imageProgress, [0, 1], [10, 0], clamp);
  const imageFloat = Math.sin(((time - 1.2) / 4) * Math.PI * 2) * 9;

  const dividerOpacity = interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], clamp);

  const badgeProgress = interpolate(frame, [0.5 * fps, 1.3 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.3)),
  });
  const badgeX = interpolate(badgeProgress, [0, 0.6, 1], [220, -12, 0], clamp);
  const badgeScale = interpolate(badgeProgress, [0, 0.6, 1], [0.94, 1.01, 1], clamp);
  const badgeBlur = interpolate(badgeProgress, [0, 1], [8, 0], clamp);
  const badgePulse = pulseValue(time, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  const clockProgress = interpolate(frame, [0.7 * fps, 1.6 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const clockX = interpolate(clockProgress, [0, 0.6, 1], [220, -12, 0], clamp);
  const clockScale = interpolate(clockProgress, [0, 0.6, 1], [0.94, 1.01, 1], clamp);
  const clockBlur = interpolate(clockProgress, [0, 1], [8, 0], clamp);
  const clockFloatY = Math.sin(((time - 1.6) / 3) * Math.PI * 2) * 4;
  const clockRotate = Math.sin(((time - 1.6) / 3) * Math.PI * 2) * 1;
  const hourAngle = (time / 5.5) * 360;
  const minuteAngle = (time / 0.55) * 360;
  const centerPulse = interpolate(pulseValue(time, 1.2), [-1, 1], [6, 7]);

  const titleProgress = interpolate(frame, [0.9 * fps, 1.8 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const titleX = interpolate(titleProgress, [0, 0.6, 1], [220, -12, 0], clamp);
  const titleScale = interpolate(titleProgress, [0, 0.6, 1], [0.94, 1.01, 1], clamp);
  const titleBlur = interpolate(titleProgress, [0, 1], [8, 0], clamp);
  const titleShine = `${(time * 50) % 200}% 50%`;
  const wordPulseScale = interpolate(pulseValue(time, 2.2), [-1, 1], [1, 1.02]);
  const wordGlow = interpolate(pulseValue(time, 2.2), [-1, 1], [0, 12]);

  const taglineProgress = interpolate(frame, [1.1 * fps, 1.95 * fps], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const taglineX = interpolate(taglineProgress, [0, 0.6, 1], [220, -12, 0], clamp);
  const taglineScale = interpolate(
    taglineProgress,
    [0, 0.6, 1],
    [0.94, 1.01, 1],
    clamp
  );
  const taglineBlur = interpolate(taglineProgress, [0, 1], [8, 0], clamp);

  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  const sparks = [
    { top: "20%", left: "15%", size: 10, delay: 0 },
    { top: "65%", left: "85%", size: 6, delay: 0.7 },
    { top: "80%", left: "30%", size: 8, delay: 1.2 },
    { top: "40%", left: "72%", size: 6, delay: 0.3 },
    { top: "15%", left: "88%", size: 6, delay: 1.8 },
  ];

  const heroDropShadow = "drop-shadow(0 40px 80px rgba(37,99,235,0.18))";

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
        background: "radial-gradient(circle at 50% 30%, #F0F5FF 0%, #F5F9FF 100%)",
        fontFamily: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(30, 58, 138, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.045) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          backgroundPosition: `${gridOffset}px ${gridOffset}px`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.4,
          top: "10%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.2), rgba(37,99,235,0))",
          transform: `translate(${orb1Progress * 40}px, ${orb1Progress * 64}px) scale(${1 + orb1Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.4,
          bottom: "-20%",
          right: "-15%",
          background:
            "radial-gradient(circle, rgba(15,43,109,0.18), rgba(15,43,109,0))",
          transform: `translate(${orb2Progress * -45}px, ${orb2Progress * -72}px) scale(${1 + orb2Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          filter: "blur(70px)",
          opacity: 0.4,
          top: "50%",
          left: "70%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.25), rgba(37,99,235,0))",
          transform: `translate(${orb3Progress * 25}px, ${orb3Progress * 40}px) scale(${1 + orb3Progress * 0.05})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)",
          top: "35%",
          left: "-50%",
          transform: `translateX(${line1Translate}%) rotate(8deg)`,
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
          top: "70%",
          left: "-40%",
          transform: `translateX(${line2Translate}%) rotate(-5deg)`,
          opacity: line2Opacity,
          zIndex: 1,
        }}
      />
      {sparks.map((spark, index) => {
        const sparkProgress = loop(time + spark.delay, 3);
        const sparkOpacity = interpolate(
          sparkProgress,
          [0, 0.3, 0.7, 1],
          [0, 0.7, 0.4, 0]
        );
        const sparkScale = interpolate(sparkProgress, [0, 0.3, 0.7, 1], [0, 1.2, 0.8, 0]);
        const blue = sparkProgress < 0.3 ? "#60A5FA" : "#3B82F6";

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: spark.top,
              left: spark.left,
              width: spark.size,
              height: spark.size,
              borderRadius: "50%",
              background: blue,
              opacity: sparkOpacity,
              transform: `scale(${sparkScale})`,
              filter: "blur(1px)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          zIndex: 20,
          width: "92%",
          maxWidth: 3600,
          height: "80%",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          style={{
            flex: "0 0 46%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 80,
            opacity: imageProgress,
            transform: `translateX(${imageX}px)`,
          }}
        >
          <img
            src={staticFile("scenes/1.png")}
            style={{
              width: "100%",
              maxWidth: 1500,
              height: "auto",
              objectFit: "contain",
              opacity: imageProgress,
              transform: `translateY(${imageFloat}px) scale(${imageScale})`,
              filter: `blur(${imageBlur}px) ${heroDropShadow}`,
            }}
          />
        </div>
        <div
          style={{
            flex: "0 0 3px",
            height: "60%",
            background:
              "linear-gradient(180deg, transparent, rgba(37,99,235,0.25) 30%, rgba(37,99,235,0.4) 50%, rgba(37,99,235,0.25) 70%, transparent)",
            borderRadius: 4,
            alignSelf: "center",
            opacity: dividerOpacity,
          }}
        />
        <div
          style={{
            flex: "0 0 54%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 120,
            gap: 70,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 28,
              background: "rgba(224, 237, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: `2px solid rgba(37, 99, 235, ${badgeBorderOpacity})`,
              borderRadius: 120,
              padding: "20px 70px",
              boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37, 99, 235, 0.2)`,
              opacity: badgeProgress,
              transform: `translateX(${badgeX}px) scale(${badgeScale})`,
              filter: `blur(${badgeBlur}px)`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                background: "#2563EB",
                borderRadius: "50%",
                opacity: dotOpacity,
                boxShadow: `0 0 12px #2563EB, 0 0 0 ${dotShadow}px rgba(37,99,235,0.4)`,
                transform: `scale(${dotScale})`,
              }}
            />
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              LE PROBLÈME
            </span>
          </div>
          <svg
            width="220"
            height="220"
            viewBox="0 0 100 100"
            style={{
              overflow: "visible",
              filter: `blur(${clockBlur}px) drop-shadow(0 10px 15px rgba(0,0,0,0.1))`,
              opacity: clockProgress,
              transform: `translateX(${clockX}px) translateY(${clockFloatY}px) scale(${clockScale}) rotate(${clockRotate}deg)`,
            }}
          >
            <defs>
              <linearGradient id="ringGradScene1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glowSvgScene1" x="-20%" y="-20%" width="140%" height="140%">
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
              stroke="url(#ringGradScene1)"
              strokeWidth="4.5"
              fill="rgba(219,234,254,0.4)"
              filter="url(#glowSvgScene1)"
              strokeDasharray="4 3"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#1E3A8A"
              strokeWidth="5.5"
              strokeLinecap="round"
              transform={`rotate(${hourAngle} 50 50)`}
            />
            <line
              x1="50"
              y1="50"
              x2="74"
              y2="50"
              stroke="#3B82F6"
              strokeWidth="4.2"
              strokeLinecap="round"
              transform={`rotate(${minuteAngle} 50 50)`}
            />
            <circle cx="50" cy="50" r={centerPulse} fill="white" stroke="#2563EB" strokeWidth="2" />
            <circle cx="50" cy="50" r="3" fill="#2563EB" />
          </svg>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 1.18,
              textAlign: "left",
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(130deg, #0F2B6D 0%, #2563EB 45%, #3B82F6 65%, #0F2B6D 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: titleShine,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: titleProgress,
              transform: `translateX(${titleX}px) scale(${titleScale})`,
              filter: `blur(${titleBlur}px)`,
            }}
          >
            <div>Vous perdez du <span
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #3B82F6, #1E40AF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: 900,
                transform: `scale(${wordPulseScale})`,
                textShadow: `0 0 ${wordGlow}px rgba(59,130,246,0.6)`,
              }}
            >temps</span></div>
            <div>à suivre vos dossiers</div>
            <div>de transit ?</div>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 500,
              color: "#2C3E66",
              background: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(4px)",
              padding: "14px 50px",
              borderRadius: 80,
              display: "inline-block",
              opacity: taglineProgress,
              transform: `translateX(${taglineX}px) scale(${taglineScale})`,
              filter: `blur(${taglineBlur}px)`,
              boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
            }}
          >
            Suivi de dossiers · Gestion de transit · Visibilité opérationnelle
          </div>
        </div>
      </div>
    </div>
  );
};
