import { Button, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
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

enum DelayStatus {
    NotStarted,
    Started,
    Done
}

type LessonProps = {
    lesson: Lesson;
    onEnd: () => void;
}

export function Lesson({ lesson: { name, commands }, onEnd }: LessonProps) {
    const [currentCommand, setCurrentCommand] = useState({ index: 0, repeat: 0 });
    const delayedRef = useRef(DelayStatus.NotStarted);
    const playerRef = useRef<ReactPlayer>(null);

    const command = commands[currentCommand.index];

    const handleCustomProgress = (duration: number) => {
        if (delayedRef.current === DelayStatus.Started) {
            return;
        }

        if (duration >= command.end) {
            playerRef.current?.getInternalPlayer()?.pauseVideo();

            // Check if needs to delay
            if (command.delay && delayedRef.current === DelayStatus.NotStarted) {
                delayedRef.current = DelayStatus.Started;

                setTimeout(() => {
                    delayedRef.current = DelayStatus.Done;
                    playerRef.current?.getInternalPlayer()?.playVideo();
                }, command.delay * 1000);
                return;
            }

            // Check if needs to repeat
            if (currentCommand.repeat < command.repeat - 1) {
                setCurrentCommand(({ index, repeat }) => ({ index, repeat: repeat + 1 }));
            } else {

                // Move to next command
                if (currentCommand.index < commands.length - 1) {
                    setCurrentCommand(({ index }) => ({ index: index + 1, repeat: 0 }));
                }
            }

            delayedRef.current = DelayStatus.NotStarted;
        }
    }

    useEffect(() => {
        const player = playerRef.current;
        player?.seekTo(command.start);
        player?.getInternalPlayer()?.playVideo();
        console.log(command.start);
    }, [command, currentCommand]);

    return command
        ? <div style={{
            width: "100%",
            height: "100%",
            marginTop: 1
        }}>
            <YoutubePlayer playerRef={playerRef}
                onCustomProgress={handleCustomProgress}
                url={command.url}
                playbackRate={command.rate}
                width="100%"
                height="calc(100% - 60px)"
                config={{
                    youtube: {
                        playerVars: {
                            autoplay: 1,
                            modestbranding: 1,
                            rel: 0,
                            controls: 1
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