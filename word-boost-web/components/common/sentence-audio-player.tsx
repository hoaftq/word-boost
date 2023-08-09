import YoutubePlayer from "../youtube-player";
import ReactPlayer from "react-player";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseVideoUrl } from "./player-utils";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { CircularProgress } from "@mui/material";

type AudioPlayerProps = {
    videoUrl: string;
    rate: number;
    repeat?: number;
    autoplay: boolean;
    onFinish?: () => void;
}

AudioPlayer.defaultProps = {
    rate: 1,
    autoplay: true
};

export function AudioPlayer({ videoUrl, rate, repeat, autoplay, onFinish }: AudioPlayerProps) {
    const playerRef = useRef<ReactPlayer>(null);

    // Only set this state in player callback functions
    const [playerState, setPlayerState] = useState<"unstarted" | "playing" | "paused" | "ended">("unstarted");
    const [canAutomaticallyStart, setCanAutomaticallyStart] = useState<boolean | null>(null);

    const urlInfo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

    const handlePlay = () => {

        // The video has been started automatically
        if (canAutomaticallyStart === null) {
            setCanAutomaticallyStart(true);

            // After user clicks to play the video, we need to seek to start position, otherwise it will play from the begining
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

            if (autoplay) {
                playerRef.current?.getInternalPlayer().playVideo();
            } else {
                playerRef.current?.getInternalPlayer().pauseVideo();
            }

        } else if (canAutomaticallyStart === false) { // The video has been started manually

            // From now on the video can be controlled by our script
            setCanAutomaticallyStart(true);
        }

        else {
            setPlayerState("playing");
        }
    }

    const handlePause = () => {
        setPlayerState(prev => prev !== "ended" ? "paused" : "ended");
    }

    const handleEnded = () => {
        setPlayerState("ended");
    }

    const handlePlayPauseButtonClick = () => {
        switch (playerState) {
            case "playing":
                playerRef.current?.getInternalPlayer().pauseVideo();
                break;
            case "paused":
                playerRef.current?.getInternalPlayer().playVideo();
                break;
            case "ended":
                playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);
                playerRef.current?.getInternalPlayer().playVideo();
                break;
        }
    }

    const handleCustomProgress = (duration: number) => {
        if (duration > urlInfo.end) {
            playerRef.current?.getInternalPlayer().pauseVideo();
            setPlayerState("ended");
            setTimeout(() => {
                onFinish?.();
            }, 0);
        }
    }

    useEffect(() => {
        const timerId = setTimeout(() => {
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

            // When we change the url (actually start and end position)
            if (canAutomaticallyStart) {
                playerRef.current?.getInternalPlayer().unMute();

                if (autoplay) {
                    playerRef.current?.getInternalPlayer().playVideo();
                } else {
                    playerRef.current?.getInternalPlayer().pauseVideo();
                }
            } else {

                // Try to start the video to determine if it can be automatically played
                playerRef.current?.getInternalPlayer().mute();
                playerRef.current?.getInternalPlayer().playVideo();
            }

        }, 500);

        return () => {
            clearTimeout(timerId);
        }
    }, [urlInfo, repeat, autoplay, canAutomaticallyStart]);


    useEffect(() => {

        // After 1ms, if canAutomaticallyStart is still null, that means the video can't be automatically played
        const timerId = setTimeout(() => {
            if (canAutomaticallyStart === null) {
                setCanAutomaticallyStart(false);
            }
        }, 1000);

        return () => {
            clearTimeout(timerId);
        }
    }, [canAutomaticallyStart]);

    return (
        // While canAutomaticallyStart is null, the control isn't visible to user so they won't be able to play it manually
        <>
            {canAutomaticallyStart === null && <div style={{
                width: 50,
                height: 40,
                backgroundColor: "red",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <CircularProgress size="2em" color="info" />
            </div>}
            <div style={{ display: canAutomaticallyStart === null ? "none" : "block" }}>
                <YoutubePlayer playerRef={playerRef}
                    url={urlInfo.url}
                    width={50}
                    height={40}
                    style={{ display: (playerState === "playing" || canAutomaticallyStart) ? "none" : "inline-block" }}
                    playbackRate={rate}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onCustomProgress={handleCustomProgress}
                />
                {playerState === "playing"
                    ? <PauseIcon htmlColor="white"
                        sx={{
                            backgroundColor: "red",
                            width: 50,
                            height: 40,
                            cursor: "pointer"
                        }}
                        onClick={handlePlayPauseButtonClick} />
                    : canAutomaticallyStart && <PlayArrowIcon htmlColor="white"
                        sx={{
                            backgroundColor: "red",
                            width: 50,
                            height: 40,
                            cursor: "pointer"
                        }}
                        onClick={handlePlayPauseButtonClick} />}
            </div>
        </>);
}