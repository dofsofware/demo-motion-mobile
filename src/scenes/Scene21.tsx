import {
    Easing,
    interpolate,
    interpolateColors,
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

export const Scene21 = ({ inFrame, outFrame, crossfadeFrames }: P) => {
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

    // ---------- Icon entrance (scalePopSpin + float) ----------
    const iconEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
        ...clamp,
        easing: Easing.bezier(0.2, 0.9, 0.4, 1.1),
    });
    const iconOpacity = interpolate(iconEntrance, [0, 0.5, 1], [0, 1, 1], clamp);
    const iconScale = interpolate(iconEntrance, [0, 0.5, 1], [0.2, 1.08, 1], clamp);
    const iconRotate = interpolate(iconEntrance, [0, 0.5, 1], [-120, 3, 0], clamp);
    const iconBlur = interpolate(iconEntrance, [0, 0.5, 1], [10, 0, 0], clamp);

    // Continuous float (3s cycle)
    const iconFloatY = Math.sin((time / 3) * Math.PI * 2) * 4;
    const iconFloatRotate = Math.sin((time / 3) * Math.PI * 2) * 1;

    // ---------- Title ----------
    const titleEntrance = interpolate(frame, [0, 0.9 * fps], [0, 1], {
        ...clamp,
        easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
    });
    const titleOpacity = interpolate(titleEntrance, [0, 0.4, 1], [0, 0.9, 1], clamp);
    const titleTranslateY = interpolate(titleEntrance, [0, 0.4, 1], [100, -12, 0], clamp);
    const titleScale = interpolate(titleEntrance, [0, 0.4, 1], [0.92, 1.01, 1], clamp);
    const titleBlur = interpolate(titleEntrance, [0, 0.4, 1], [8, 0, 0], clamp);

    const titleShine = `${((time % 4) / 4) * 200}% 50%`;

    const wordPulse = pulseValue(time, 2.2);
    const wordScale = interpolate(wordPulse, [-1, 1], [1, 1.02]);
    const wordGlow = interpolate(wordPulse, [-1, 1], [0, 12]);

    // ---------- Calls ----------
    const callNumbers = [
        "+221 77 6 12 34 56",
        "+221 77 798 76 54",
        "+221 78 645 67 89",
        "+221 70 712 34 56",
        "+221 76 678 90 12",
    ];

    // Entrance: callEntry with delays 0.1s, 0.2s, 0.3s, 0.4s, 0.5s
    const callEntry = (delaySec: number, durationSec: number = 0.5) => {
        const start = delaySec * fps;
        const end = (delaySec + durationSec) * fps;
        if (frame < start) return { opacity: 0, translateY: 30, scale: 0.9, blur: 6 };
        const progress = interpolate(frame, [start, end], [0, 1], {
            ...clamp,
            easing: Easing.bezier(0.2, 0.9, 0.4, 1),
        });
        const op = progress;
        const translateY = interpolate(progress, [0, 1], [30, 0]);
        const scale = interpolate(progress, [0, 1], [0.9, 1]);
        const blur = interpolate(progress, [0, 1], [6, 0]);
        return { opacity: op, translateY, scale, blur };
    };

    const callDelays = [0.1, 0.2, 0.3, 0.4, 0.5];
    const callEntries = callDelays.map((delay) => callEntry(delay, 0.5));

    // Removal: each call removed at time = 1.0 + i * 0.5 (seconds)
    // Removal animation crossOutFade duration 0.5s
    const isRemoved = (index: number) => {
        const startRemoval = 1.0 + index * 0.5;
        const endRemoval = startRemoval + 0.5;
        if (time < startRemoval) return false;
        if (time >= endRemoval) return true;
        return true; // during removal, we still consider it removed for counting? Actually the removal animation makes it disappear. We'll count as removed after startRemoval.
        // For visual, we'll apply a transform style for removal progress.
    };

    const removalProgress = (index: number) => {
        const startRemoval = 1.0 + index * 0.5;
        const endRemoval = startRemoval + 0.5;
        if (time < startRemoval) return 0;
        if (time >= endRemoval) return 1;
        return (time - startRemoval) / 0.5;
    };

    // Counter: remaining calls = total - number removed (where removal has started)
    const removedCount = callNumbers.filter((_, i) => time >= 1.0 + i * 0.5).length;
    const remaining = callNumbers.length - removedCount;

    // Final message appears when remaining == 0, with finalPop animation
    const finalMessageVisible = remaining === 0;
    const finalPop = () => {
        if (!finalMessageVisible) return { opacity: 0, scale: 0.8, blur: 4 };
        const start = (1.0 + (callNumbers.length - 1) * 0.5 + 0.5); // after last removal finishes
        const end = start + 0.6;
        if (time < start) return { opacity: 0, scale: 0.8, blur: 4 };
        const progress = interpolate(frame, [start * fps, end * fps], [0, 1], {
            ...clamp,
            easing: Easing.bezier(0.2, 0.9, 0.4, 1),
        });
        const op = interpolate(progress, [0, 0.8, 1], [0, 1, 1], clamp);
        const scale = interpolate(progress, [0, 0.8, 1], [0.8, 1.02, 1], clamp);
        const blur = interpolate(progress, [0, 0.8, 1], [4, 0, 0], clamp);
        return { opacity: op, scale, blur };
    };
    const finalAnim = finalPop();

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
                    transform: `translate(${orb1Progress * 40}px, ${orb1Progress * 64
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
                    transform: `translate(${orb2Progress * -45}px, ${orb2Progress * -72
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
                    transform: `translate(${orb3Progress * 25}px, ${orb3Progress * 40
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
                    width: 1000,
                    height: 1000,
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
                        }}
                    >
                        BÉNÉFICE DIRECT
                    </span>
                </div>

                {/* Icon */}
                <div
                    style={{
                        width: 260,
                        height: 260,
                        background: "rgba(224,237,255,0.7)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 120,
                        border: "3px solid rgba(37,99,235,0.4)",
                        boxShadow: "0 25px 40px -12px rgba(0,0,0,0.15)",
                        opacity: iconOpacity,
                        transform: `translateY(${iconFloatY}px) rotate(${iconFloatRotate}deg) scale(${iconScale}) rotate(${iconRotate}deg)`,
                        filter: `blur(${iconBlur}px)`,
                    }}
                >
                    📵
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 110,
                        fontWeight: 800,
                        lineHeight: 1.2,
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
                    Et vous recevez<br />
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
                        moins d'appels
                    </span>{" "}
                    inutiles.
                </div>

                {/* Calls section */}
                <div
                    style={{
                        width: "100%",
                        marginTop: 20,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 30,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: 40,
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {callNumbers.map((number, idx) => {
                            const entry = callEntries[idx];
                            const removed = time >= 1.0 + idx * 0.5;
                            const removalProg = removalProgress(idx);
                            // removal animation: crossOutFade
                            let transformStyle = {};
                            let opacityStyle = 1;
                            let filterStyle = "";
                            if (removed) {
                                // crossOutFade: scale and rotate, background changes at ~40%
                                const scale = interpolate(removalProg, [0, 0.4, 1], [1, 1.05, 0.8], clamp);
                                const rotate = interpolate(removalProg, [0, 0.4, 1], [0, -2, -10], clamp);
                                const bgColor = interpolateColors(removalProg, [0, 0.4], ["#FFFFFF", "#FFEDED"]);
                                const borderColor = interpolateColors(removalProg, [0, 0.4], ["rgba(37,99,235,0.2)", "#EF4444"]);
                                const blur = interpolate(removalProg, [0.4, 1], [0, 4], clamp);
                                opacityStyle = interpolate(removalProg, [0.8, 1], [1, 0], clamp);
                                transformStyle = {
                                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                                    background: bgColor,
                                    borderColor: borderColor,
                                    filter: `blur(${blur}px)`,
                                    opacity: opacityStyle,
                                };
                            } else {
                                transformStyle = {
                                    transform: `translateY(${entry.translateY}px) scale(${entry.scale})`,
                                    filter: `blur(${entry.blur}px)`,
                                    opacity: entry.opacity,
                                };
                            }
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: "white",
                                        borderRadius: 60,
                                        padding: "20px 40px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 20,
                                        fontSize: 40,
                                        fontWeight: 600,
                                        color: "#0F2B6D",
                                        boxShadow: "0 10px 20px -5px rgba(0,0,0,0.05)",
                                        border: "2px solid rgba(37,99,235,0.2)",
                                        backdropFilter: "blur(4px)",
                                        ...transformStyle,
                                    }}
                                >
                                    <div style={{ fontSize: 48 }}>📞</div>
                                    <div style={{ fontSize: 36, fontWeight: 700, color: "#2563EB" }}>
                                        {number}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Counter info */}
                    <div
                        style={{
                            fontSize: 36,
                            fontWeight: 600,
                            color: "#2C3E66",
                            background: "rgba(224,237,255,0.6)",
                            backdropFilter: "blur(8px)",
                            padding: "12px 32px",
                            borderRadius: 80,
                            marginTop: 20,
                            opacity: time >= 1.2 ? 1 : 0,
                            transform: time >= 1.2 ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.5s, transform 0.5s",
                        }}
                    >
                        📞 Appels entrants : <span style={{ fontSize: 48, fontWeight: 800, color: "#2563EB" }}>{remaining}</span>
                    </div>

                    {/* Final message */}
                    {finalMessageVisible && (
                        <div
                            style={{
                                fontSize: 40,
                                fontWeight: 600,
                                color: "#22C55E",
                                background: "rgba(34,197,94,0.1)",
                                padding: "12px 32px",
                                borderRadius: 80,
                                backdropFilter: "blur(4px)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 15,
                                opacity: finalAnim.opacity,
                                transform: `scale(${finalAnim.scale})`,
                                filter: `blur(${finalAnim.blur}px)`,
                            }}
                        >
                            ✅ + de sérénité, - de perturbations
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};