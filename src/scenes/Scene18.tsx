import {
  Easing,
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

export const Scene18 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
    [1, 1.06],
    clamp
  );

  // ---------- Background elements (same as Scene1) ----------
  const gridOffset = (time / 18) * 140;

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
    { top: "20%", left: "15%", size: 10, delay: 0 },
    { top: "65%", left: "85%", size: 6, delay: 0.7 },
    { top: "80%", left: "30%", size: 8, delay: 1.2 },
    { top: "40%", left: "72%", size: 6, delay: 0.3 },
    { top: "15%", left: "88%", size: 6, delay: 1.8 },
  ];

  const pulseRingWave = pulseValue(time, 5);
  const pulseRingScale = interpolate(pulseRingWave, [-1, 1], [0.92, 1.12]);
  const pulseRingOpacity = interpolate(pulseRingWave, [-1, 1], [0.5, 0.85]);

  // ---------- Badge entrance (slideDownPop) ----------
  const badgeEntrance = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.3, 0.55, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(badgeEntrance, [0, 0.6, 1], [-80, 8, 0], clamp);
  const badgeScale = interpolate(badgeEntrance, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  // Badge continuous glow (starts after 0.7s)
  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  // Dot inside badge (1.6s cycle)
  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Subheading (slideDownPop, delay 0.3s) ----------
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
    [-80, 8, 0],
    clamp
  );
  const subheadingScale = interpolate(
    subheadingEntrance,
    [0, 0.6, 1],
    [0.85, 1.02, 1],
    clamp
  );
  const subheadingBlur = interpolate(subheadingEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  // ---------- Cards (slideFromLeft with staggered delays) ----------
  const slideFromLeft = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateX: -300, scale: 0.85, blur: 12 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = interpolate(progress, [0, 0.6, 1], [0, 1, 1], clamp);
    const translateX = interpolate(progress, [0, 0.6, 0.8, 1], [-300, 15, -5, 0], clamp);
    const scale = interpolate(progress, [0, 0.6, 0.8, 1], [0.85, 1.02, 1, 1], clamp);
    const blur = interpolate(progress, [0, 0.6, 1], [12, 0, 0], clamp);
    return { opacity: op, translateX, scale, blur };
  };

  // Delays from original: 2.5s, 3.3s, 4.5s, 5.5s
  const card1 = slideFromLeft(2.5, 0.7);
  const card2 = slideFromLeft(3.3, 0.7);
  const card3 = slideFromLeft(4.5, 0.7);
  const card4 = slideFromLeft(5.5, 0.7);

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
      {/* Background elements (grid, orbs, lines, sparks, pulse ring) */}
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
          transform: `translate(${orb1Progress * 40}px, ${
            orb1Progress * 64
          }px) scale(${1 + orb1Progress * 0.05})`,
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
          transform: `translate(${orb2Progress * -45}px, ${
            orb2Progress * -72
          }px) scale(${1 + orb2Progress * 0.05})`,
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
          transform: `translate(${orb3Progress * 25}px, ${
            orb3Progress * 40
          }px) scale(${1 + orb3Progress * 0.05})`,
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

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 70,
          zIndex: 20,
          maxWidth: 3000,
          width: "85%",
          position: "relative",
          backdropFilter: "blur(2px)",
          padding: "60px 0",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 28,
            background: "rgba(224,237,255,0.75)",
            backdropFilter: "blur(12px)",
            border: `2px solid rgba(37,99,235,${badgeBorderOpacity})`,
            borderRadius: 120,
            padding: "20px 70px",
            boxShadow: `0 20px 35px -12px rgba(0, 0, 0, 0.1), 0 0 0 ${badgeRingSize}px rgba(37,99,235,0.2)`,
            opacity: badgeOpacity,
            transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`,
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
              textShadow: "0 2px 5px rgba(37,99,235,0.2)",
            }}
          >
            MULTI-CANAL
          </span>
        </div>

        {/* Subheading */}
        <h2
          style={{
            fontSize: 80,
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
          Vos clients choisissent<br />leur canal de communication :
        </h2>

        {/* Cards container */}
        <div
          style={{
            display: "flex",
            gap: 60,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          {/* Card 1: WhatsApp */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 70px",
              minWidth: 280,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card1.opacity,
              transform: `translateX(${card1.translateX}px) scale(${card1.scale})`,
              filter: `blur(${card1.blur}px)`,
            }}
          >
            <img
              src={staticFile("whatsapp.png")}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))",
              }}
              alt="WhatsApp"
            />
            <div
              style={{
                fontSize: 44,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
              }}
            >
              WhatsApp
            </div>
          </div>

          {/* Card 2: SMS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 70px",
              minWidth: 280,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card2.opacity,
              transform: `translateX(${card2.translateX}px) scale(${card2.scale})`,
              filter: `blur(${card2.blur}px)`,
            }}
          >
            <img
              src={staticFile("sms.png")}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))",
              }}
              alt="SMS"
            />
            <div
              style={{
                fontSize: 44,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
              }}
            >
              SMS
            </div>
          </div>

          {/* Card 3: Email */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 70px",
              minWidth: 280,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card3.opacity,
              transform: `translateX(${card3.translateX}px) scale(${card3.scale})`,
              filter: `blur(${card3.blur}px)`,
            }}
          >
            <img
              src={staticFile("mail.png")}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))",
              }}
              alt="Email"
            />
            <div
              style={{
                fontSize: 44,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
              }}
            >
              Email
            </div>
          </div>

          {/* Card 4: Notification App */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 70px",
              minWidth: 280,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card4.opacity,
              transform: `translateX(${card4.translateX}px) scale(${card4.scale})`,
              filter: `blur(${card4.blur}px)`,
            }}
          >
            <img
              src={staticFile("notification.png")}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.1))",
              }}
              alt="Notification App"
            />
            <div
              style={{
                fontSize: 44,
                fontWeight: 600,
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
              }}
            >
              Notification App
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};