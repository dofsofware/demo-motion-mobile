import "./index.css";
import { Composition } from "remotion";
import { MyComposition, timeline } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShipTrack"
        component={MyComposition}
        durationInFrames={timeline.totalDuration}
        fps={timeline.fps}
        width={1080}
        height={1920}
      />
    </>
  );
};
