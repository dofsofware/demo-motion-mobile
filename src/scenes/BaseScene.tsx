import {
  interpolate,
  spring,
  IFrame,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  inFrame: number;
  outFrame: number;
  crossfadeFrames: number;
  htmlSrc?: string;
  htmlWidth?: number;
  htmlHeight?: number;
  title?: string;
  subtitle?: string;
  colors?: { primary: string; secondary: string; bg1: string; bg2: string };
};

export const BaseScene = ({
  inFrame,
  outFrame,
  crossfadeFrames,
  htmlSrc,
  htmlWidth = 3840,
  htmlHeight = 2160,
  title,
  subtitle,
  colors = {
    primary: "#1E3A8A",
    secondary: "#60A5FA",
    bg1: "#0F172A",
    bg2: "#1E293B",
  },
}: Props) => {
  // useCurrentFrame() est LOCAL à la <Sequence> — commence à 0
  const local = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const duration = outFrame - inFrame; // durée réelle de la scène

  // Fade in
  const tIn = Math.max(0, Math.min(1, local / crossfadeFrames));
  // Fade out (par rapport à la fin réelle de la scène)
  const tOut = Math.max(0, Math.min(1, (duration - local) / crossfadeFrames));
  const opacity = Math.min(tIn, tOut);

  const scaleToFit = Math.min(width / htmlWidth, height / htmlHeight);

  const enterSpring = spring({
    fps,
    frame: local,
    durationInFrames: Math.round(0.8 * fps),
    config: { damping: 200, mass: 0.8, stiffness: 120 },
  });

  const rise = interpolate(enterSpring, [0, 1], [24, 0]);
  const scale = interpolate(enterSpring, [0, 1], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = interpolate(enterSpring, [0, 1], [0, 24]);

  const push = interpolate(local, [0, crossfadeFrames], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outZoom = interpolate(
    local,
    [duration - crossfadeFrames, duration],
    [1, 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const bgShift = interpolate(local, [0, duration], [0, 40]);

  if (htmlSrc) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity, // ← fade in/out appliqué aussi aux scènes HTML
          backgroundColor: "black",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: htmlWidth,
            height: htmlHeight,
            transform: `translate(-50%, -50%) scale(${scaleToFit})`,
            transformOrigin: "top left",
          }}
        >
          <IFrame
            key={htmlSrc}
            src={staticFile(htmlSrc)}
            style={{
              width: "100%",
              height: "100%",
              border: "0",
              display: "block",
            }}
          />
        </div>
      </div>
    );
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
        fontFamily: "'Sora', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        background: `linear-gradient(135deg, ${colors.bg1}, ${colors.bg2})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background:
            "radial-gradient(1000px 1000px at 20% 30%, rgba(96,165,250,0.25), transparent 60%), radial-gradient(800px 800px at 80% 70%, rgba(30,58,138,0.35), transparent 60%)",
          transform: `translateX(${bgShift}px)`,
          filter: "saturate(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          left: "10%",
          top: "15%",
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, transparent 60%)`,
          filter: "blur(40px)",
          opacity: 0.35,
          transform: `translateY(${Math.sin(local / 30) * 12}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          right: "12%",
          bottom: "12%",
          background: `radial-gradient(circle at 70% 70%, ${colors.primary}, transparent 60%)`,
          filter: "blur(52px)",
          opacity: 0.3,
          transform: `translateY(${Math.cos(local / 36) * 16}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 6vw",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: "4.2vw",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textShadow: `0 0 ${glow}px rgba(255,255,255,0.6)`,
            transform: `translateY(${rise}px) scale(${scale})`,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 24,
              fontSize: "1.5vw",
              fontWeight: 500,
              opacity: 0.9,
              color: "rgba(255,255,255,0.95)",
            }}
          >
            {subtitle}
          </div>
        ) : null}
        <div
          style={{
            position: "relative",
            marginTop: 40,
            width: "60%",
            height: 6,
            borderRadius: 8,
            background: "rgba(255,255,255,0.25)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(Math.min(local, duration) / duration) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, #ffffff, ${colors.secondary}, #ffffff)`,
              boxShadow: "0 0 12px rgba(255,255,255,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
};