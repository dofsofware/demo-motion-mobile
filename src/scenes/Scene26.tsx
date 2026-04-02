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

export const Scene26 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

  // ---------- Background elements (blue theme) ----------
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

  // ---------- Badge ----------
  const badgeEntrance = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.3, 0.55, 1),
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 0.6, 1], [0, 1, 1], clamp);
  const badgeTranslateY = interpolate(badgeEntrance, [0, 0.6, 1], [-80, 8, 0], clamp);
  const badgeScale = interpolate(badgeEntrance, [0, 0.6, 1], [0.85, 1.02, 1], clamp);
  const badgeBlur = interpolate(badgeEntrance, [0, 0.6, 1], [12, 0, 0], clamp);

  const badgePulse = pulseValue(time - 0.7, 2.8);
  const badgeRingSize = interpolate(badgePulse, [-1, 1], [0, 5]);
  const badgeBorderOpacity = interpolate(badgePulse, [-1, 1], [0.5, 0.9]);

  const dotPulse = pulseValue(time, 1.6);
  const dotScale = interpolate(dotPulse, [-1, 1], [1, 1.2]);
  const dotShadow = interpolate(dotPulse, [-1, 1], [0, 8]);
  const dotOpacity = interpolate(dotPulse, [-1, 1], [1, 0.9]);

  // ---------- Card entrance (cardAppear) ----------
  const cardEntrance = (delaySec: number, durationSec: number) => {
    const start = delaySec * fps;
    const end = (delaySec + durationSec) * fps;
    if (frame < start) return { opacity: 0, translateY: 40, scale: 0.92, blur: 6 };
    const progress = interpolate(frame, [start, end], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 0.9, 0.4, 1),
    });
    const op = progress;
    const translateY = interpolate(progress, [0, 1], [40, 0]);
    const scale = interpolate(progress, [0, 1], [0.92, 1]);
    const blur = interpolate(progress, [0, 1], [6, 0]);
    return { opacity: op, translateY, scale, blur };
  };

  const card1Entrance = cardEntrance(0.6, 0.8);
  const card2Entrance = cardEntrance(1.4, 0.8);
  const card3Entrance = cardEntrance(2.2, 0.8);

  // ---------- Card 1 internal animations ----------
  // Start at 0.6s, duration 0.6s
  const card1Progress = () => {
    const start = 0.6;
    const duration = 0.6;
    if (time < start) return 0;
    if (time >= start + duration) return 1;
    return (time - start) / duration;
  };
  const p1 = card1Progress();
  // Filling bar width from 0 to 100%
  const barWidth = p1 * 100;
  // Amount from 0 to 1,234,567
  const targetAmount = 1234567;
  const amount = Math.floor(targetAmount * p1);
  // Icon spin: rotate from 0 to 360 deg
  const iconSpin = p1 * 360;

  // ---------- Card 2 internal animations ----------
  // Start at 1.4s (entrance start), duration 1s
  const card2Progress = () => {
    const start = 1.4;
    const duration = 1;
    if (time < start) return 0;
    if (time >= start + duration) return 1;
    return (time - start) / duration;
  };
  const p2 = card2Progress();
  const targetHT = 1300000;
  const tvaRate = 0.18;
  const targetTVA = targetHT * tvaRate;
  const targetNet = targetHT + targetTVA;
  const currentHT = Math.floor(targetHT * p2);
  const currentTVA = Math.floor(targetTVA * p2);
  const currentNet = Math.floor(targetNet * p2);

  // ---------- Card 3 internal animations ----------
  // Start at 2.2s, duration 1s
  const card3Progress = () => {
    const start = 2.2;
    const duration = 1;
    if (time < start) return 0;
    if (time >= start + duration) return 1;
    return (time - start) / duration;
  };
  const p3 = card3Progress();
  const progressWidth = p3 * 100;
  // Status text based on progress
  let statusText = "En attente";
  let statusColor = "#F59E0B";
  let isPaid = false;
  if (p3 >= 1) {
    statusText = "Payé";
    statusColor = "#22C55E";
    isPaid = true;
  } else if (p3 >= 0.7) {
    statusText = "En cours de validation";
  } else if (p3 >= 0.3) {
    statusText = "Virement en cours";
  }
  // Dot pulse animation for pending state
  const dotPulseOrange = pulseValue(time, 1);
  const dotShadowOrange = interpolate(dotPulseOrange, [-1, 1], [0, 8]);

  // ---------- Connector line ----------
  const connectorStart = 1.0;
  const connectorDuration = 1.8;
  let connectorScale = 0;
  let connectorOpacity = 0;
  if (time >= connectorStart && time < connectorStart + connectorDuration) {
    const progress = (time - connectorStart) / connectorDuration;
    connectorScale = interpolate(progress, [0, 0.5, 1], [0, 1, 1], clamp);
    connectorOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0], clamp);
  }

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
          maxWidth: 3400,
          width: "90%",
          position: "relative",
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
            }}
          >
            FACTURATION SIMPLIFIÉE
          </span>
        </div>

        {/* Cards container */}
        <div
          style={{
            display: "flex",
            gap: 80,
            justifyContent: "center",
            flexWrap: "wrap",
            position: "relative",
            width: "100%",
          }}
        >
          {/* Connector line */}
          {connectorScale > 0 && (
            <div
              style={{
                position: "absolute",
                top: "45%",
                left: 0,
                right: 0,
                height: 3,
                background:
                  "linear-gradient(90deg, transparent, #2563EB, transparent)",
                transform: `scaleX(${connectorScale})`,
                transformOrigin: "left center",
                opacity: connectorOpacity,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Card 1 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 60px",
              width: 580,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card1Entrance.opacity,
              transform: `translateY(${card1Entrance.translateY}px) scale(${card1Entrance.scale})`,
              filter: `blur(${card1Entrance.blur}px)`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 100,
                marginBottom: 20,
                textAlign: "center",
                transform: `rotate(${iconSpin}deg)`,
                transition: "transform 0.1s linear",
              }}
            >
              ⚡
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                textAlign: "center",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: 20,
              }}
            >
              Création rapide
            </div>
            <div
              style={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 15,
                fontSize: 28,
                color: "#2C3E66",
              }}
            >
              <div style={{ display: "flex", gap: 20, fontSize: 28 }}>
                <span>Facture #INV-2847</span>
                <span style={{ color: "#2563EB" }}>✨</span>
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.1)",
                  borderRadius: 20,
                  padding: 16,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 38, fontWeight: 600 }}>
                  {amount.toLocaleString("fr-FR")} FCFA
                </div>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: 4,
                    background: "#2563EB",
                    borderRadius: 4,
                    marginTop: 12,
                  }}
                />
              </div>
              {p1 >= 1 && (
                <div style={{ color: "#22C55E", fontWeight: 500 }}>
                  ✓ Facture générée en 0.8s
                </div>
              )}
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 60px",
              width: 580,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card2Entrance.opacity,
              transform: `translateY(${card2Entrance.translateY}px) scale(${card2Entrance.scale})`,
              filter: `blur(${card2Entrance.blur}px)`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div className="card-icon" style={{ fontSize: 100, marginBottom: 20, textAlign: "center" }}>
              🔢
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                textAlign: "center",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: 20,
              }}
            >
              Calcul automatique
            </div>
            <div
              style={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 15,
                fontSize: 28,
                color: "#2C3E66",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>Total HT</div>
              <div className="count-up" style={{ fontWeight: 700, color: "#2563EB" }}>
                {currentHT.toLocaleString("fr-FR")} FCFA
              </div>
              <div style={{ fontSize: 30, marginTop: 15 }}>TVA (18%)</div>
              <div className="count-up" style={{ fontWeight: 700, color: "#2563EB" }}>
                {currentTVA.toLocaleString("fr-FR")} FCFA
              </div>
              <div style={{ fontSize: 30, marginTop: 15, fontWeight: "bold" }}>Net à payer</div>
              <div className="count-up" style={{ fontWeight: 700, color: "#2563EB" }}>
                {currentNet.toLocaleString("fr-FR")} FCFA
              </div>
              {p2 >= 1 && (
                <div style={{ color: "#22C55E", fontWeight: 500 }}>✓ Calcul instantané</div>
              )}
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "rgba(224,237,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(37,99,235,0.3)",
              borderRadius: 50,
              padding: "50px 60px",
              width: 580,
              boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
              opacity: card3Entrance.opacity,
              transform: `translateY(${card3Entrance.translateY}px) scale(${card3Entrance.scale})`,
              filter: `blur(${card3Entrance.blur}px)`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div className="card-icon" style={{ fontSize: 100, marginBottom: 20, textAlign: "center" }}>
              💰
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                textAlign: "center",
                background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                marginBottom: 20,
              }}
            >
              Suivi paiements
            </div>
            <div
              style={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 15,
                fontSize: 28,
                color: "#2C3E66",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(0,0,0,0.05)",
                  padding: "12px 24px",
                  borderRadius: 60,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: isPaid ? "#22C55E" : "#F59E0B",
                    boxShadow: isPaid ? "none" : `0 0 0 ${dotShadowOrange}px rgba(245,158,11,0.5)`,
                  }}
                />
                <span>{statusText}</span>
              </div>
              <div style={{ fontSize: 32, marginTop: 20 }}>Montant : 1 540 000 FCFA</div>
              <div
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.1)",
                  borderRadius: 20,
                  marginTop: 20,
                }}
              >
                <div
                  style={{
                    width: `${progressWidth}%`,
                    height: 10,
                    background: isPaid ? "#22C55E" : "#F59E0B",
                    borderRadius: 20,
                  }}
                />
              </div>
              {p3 >= 1 && (
                <div style={{ color: "#22C55E", fontWeight: 500 }}>✓ Paiement reçu</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};