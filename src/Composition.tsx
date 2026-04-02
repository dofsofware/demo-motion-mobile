import type { ReactNode } from "react";
import { Sequence, Audio, staticFile, useVideoConfig } from "remotion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";
import { Scene9 } from "./scenes/Scene9";
import { Scene10 } from "./scenes/Scene10";
import { Scene11 } from "./scenes/Scene11";
import { Scene12 } from "./scenes/Scene12";
import { Scene13 } from "./scenes/Scene13";
import { Scene14 } from "./scenes/Scene14";
import { Scene15 } from "./scenes/Scene15";
import { Scene16 } from "./scenes/Scene16";
import { Scene17 } from "./scenes/Scene17";
import { Scene18 } from "./scenes/Scene18";
import { Scene19 } from "./scenes/Scene19";
import { Scene20 } from "./scenes/Scene20";
import { Scene21 } from "./scenes/Scene21";
import { Scene22 } from "./scenes/Scene22";
import { Scene23 } from "./scenes/Scene23";
import { Scene24 } from "./scenes/Scene24";
import { Scene25 } from "./scenes/Scene25";
import { Scene26 } from "./scenes/Scene26";
import { Scene27 } from "./scenes/Scene27";
import { Scene28 } from "./scenes/Scene28";

const fps = 30;
const framesPerScene = 4 * fps;
const crossfadeFrames = Math.round(0.5 * fps);
const designWidth = 3840;
const designHeight = 2160;

type Slot = { from: number; to: number };
const fixedSlots: Slot[] = [
  { from: 0 * fps + 0, to: 2 * fps + 20 }, // Scene 1: 00:00.00 → 00:02.20
  { from: 2 * fps + 20, to: 5 * fps + 23 }, // Scene 2: 00:02.20 → 00:05.23
  { from: 5 * fps + 23, to: 7 * fps + 22 }, // Scene 3: 00:05.23 → 00:07.22
  { from: 7 * fps + 22, to: 9 * fps + 15 }, // Scene 4: 00:07.22 → 00:09.15
  { from: 9 * fps + 15, to: 11 * fps + 0 }, // Scene 5: 00:09.15 → 00:11.00
  { from: 11 * fps + 0, to: 12 * fps + 3 }, // Scene 6: 00:11.00 → 00:12.03
  { from: 12 * fps + 3, to: 13 * fps + 12 }, // Scene 7: 00:12.03 → 00:13.12
  { from: 13 * fps + 12, to: 14 * fps + 18 }, // Scene 8: 00:13.12 → 00:14.18
  { from: 14 * fps + 18, to: 16 * fps + 25 }, // Scene 9:  00:14.18 → 00:16.25
  { from: 16 * fps + 25, to: 19 * fps + 23 }, // Scene 10: 00:16.25 → 00:19.23
  { from: 19 * fps + 23, to: 22 * fps + 5 },  // Scene 11: 00:19.23 → 00:22.05
  { from: 22 * fps + 5, to: 25 * fps + 6 },   // Scene 12: 00:22.05 → 00:25.06
  { from: 25 * fps + 6, to: 28 * fps + 22 },  // Scene 13: 00:25.06 → 00:28.22
  { from: 28 * fps + 22, to: 31 * fps + 18 }, // Scene 14: 00:28.22 → 00:31.18
  { from: 31 * fps + 18, to: 34 * fps + 18 }, // Scene 15: 00:31.18 → 00:34.18
  { from: 34 * fps + 18, to: 39 * fps + 2 },  // Scene 16: 00:34.18 → 00:39.02
  { from: 39 * fps + 2, to: 41 * fps + 13 },  // Scene 17: 00:39.02 → 00:41.13
  { from: 41 * fps + 13, to: 48 * fps + 4 },  // Scene 18: 00:41.13 → 00:48.04
  { from: 48 * fps + 4, to: 50 * fps + 14 },  // Scene 19: 00:48.04 → 00:50.14
  { from: 50 * fps + 14, to: 53 * fps + 22 }, // Scene 20: 00:50.14 → 00:53.22
  { from: 53 * fps + 22, to: 56 * fps + 0 },  // Scene 21: 00:53.22 → 00:56.00
  { from: 56 * fps + 0, to: 60 * fps + 1 },   // Scene 22: 00:56.00 → 01:00.01
  { from: 60 * fps + 1, to: 63 * fps + 22 },  // Scene 23: 01:00.01 → 01:03.22
  { from: 63 * fps + 22, to: 67 * fps + 21 }, // Scene 24: 01:03.22 → 01:07.21
  { from: 67 * fps + 21, to: 69 * fps + 27 }, // Scene 25: 01:07.21 → 01:09.27
  { from: 69 * fps + 27, to: 74 * fps + 3 },  // Scene 26: 01:09.27 → 01:14.03
  { from: 74 * fps + 3, to: 78 * fps + 3 },   // Scene 27: 01:14.03 → 01:18.03
  { from: 78 * fps + 3, to: 88 * fps + 3 },   // Scene 28: 01:18.03 → 01:28.03
];

const scenes = [
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
  Scene6,
  Scene7,
  Scene8,
  Scene9,
  Scene10,
  Scene11,
  Scene12,
  Scene13,
  Scene14,
  Scene15,
  Scene16,
  Scene17,
  Scene18,
  Scene19,
  Scene20,
  Scene21,
  Scene22,
  Scene23,
  Scene24,
  Scene25,
  Scene26,
  Scene27,
  Scene28,
] as const;

const schedule: { from: number; duration: number }[] = [];
for (let i = 0; i < 28; i++) {
  if (i < fixedSlots.length) {
    const { from, to } = fixedSlots[i];
    const duration = Math.max(1, to - from);
    schedule.push({ from, duration });
  } else {
    const prev = schedule[i - 1];
    schedule.push({ from: prev.from + prev.duration, duration: framesPerScene });
  }
}

export const timeline = {
  fps,
  framesPerScene,
  crossfadeFrames,
  totalDuration: schedule[schedule.length - 1].from + schedule[schedule.length - 1].duration,
};

const ResponsiveSceneStage = ({ children }: { children: ReactNode }) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  if (isPortrait) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 20%, rgba(96,165,250,0.22) 0%, rgba(96,165,250,0) 45%), radial-gradient(circle at 50% 85%, rgba(30,58,138,0.18) 0%, rgba(30,58,138,0) 42%), linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(96,165,250,0.18), rgba(96,165,250,0) 40%), radial-gradient(circle at bottom, rgba(30,58,138,0.12), rgba(30,58,138,0) 38%), linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: designWidth,
          height: designHeight,
          transform: "translate(-50%, -50%)",
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const MyComposition = () => {
  return (
    <>
      <Audio src={staticFile("scenes/voix off.wav")} />
      {scenes.map((S, i) => {
        const { from, duration } = schedule[i];
        const extendedDuration = duration + crossfadeFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={extendedDuration}>
            <ResponsiveSceneStage>
              <S
                inFrame={from}
                outFrame={from + duration}
                crossfadeFrames={crossfadeFrames}
              />
            </ResponsiveSceneStage>
          </Sequence>
        );
      })}
    </>
  );
};
