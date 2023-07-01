import { Button, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { OnProgressProps } from "react-player/base";
const YoutubePlayer = dynamic(() => import("../youtube-player"), { ssr: false });

export type PlayCommand = {
    label: string;
    url: string;
    start: number;
    end: number;
    rate: number;
    delay?: number;
    repeat: number;
    description?: string;
}

export type Lesson = {
    name: string;
    commands: PlayCommand[]
}

type LessonProps = {
    lesson: Lesson;
    onEnd: () => void;
}

export function Lesson({ lesson: { name, commands }, onEnd }: LessonProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentRepeat, setCurrentRepeat] = useState(0);
    const delayedRef = useRef<"not_started" | "doing" | "done">("not_started");
    const playerRef = useRef<ReactPlayer>(null);

    const command = commands[currentIndex];

    const handleProgress = (duration: OnProgressProps) => {
        if (delayedRef.current === "doing") {
            return;
        }

        if (duration.playedSeconds >= command.end) {
            if (delayedRef.current === "not_started" && command.delay) {
                playerRef.current?.getInternalPlayer()?.pauseVideo();
                delayedRef.current = "doing";

                setTimeout(() => {
                    delayedRef.current = "done";
                    playerRef.current?.getInternalPlayer()?.playVideo();
                }, command.delay * 1000);
                return;
            }

            if (currentRepeat < command.repeat - 1) {
                setCurrentRepeat(currentRepeat + 1);
                delayedRef.current = "not_started";
            } else {
                playerRef.current?.getInternalPlayer()?.pauseVideo();

                if (currentIndex < commands.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setCurrentRepeat(0);
                    delayedRef.current = "not_started";
                }
            }
        }
    }

    useEffect(() => {
        const player = playerRef.current;
        player?.seekTo(command.start);
        player?.getInternalPlayer()?.playVideo();
    }, [command.start, currentIndex, currentRepeat]);

    return command
        ? <div style={{ width: "100%", height: "100%" }}>
            <YoutubePlayer playerRef={playerRef}
                onProgress={handleProgress}
                url={command.url}
                playbackRate={command.rate}
                width="100%"
                height="calc(100% - 60px)"
                config={{
                    youtube: {
                        playerVars: {
                            autoplay: 1,
                            modestbranding: 1,
                            rel: 0
                        }
                    }
                }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="primary"
                    fontSize={40}
                    fontWeight="bold">{"> "}{command.description}</Typography>
                <Button color="secondary"
                    onClick={onEnd}>End</Button>
            </div>
        </div>
        : null;
}