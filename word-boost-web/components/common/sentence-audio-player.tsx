import YoutubePlayer from "../youtube-player";
import ReactPlayer from "react-player";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseVideoUrl } from "./player-utils";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

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

        // First time the video has been started
        if (!canAutomaticallyStart) {

            // It gets here, so from now on the video can be surelly controlled by our script
            setCanAutomaticallyStart(true);

            // After user clicks to play the video, we need to seek to start position (it will be paused by youtube)
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

            if (autoplay) {
                playerRef.current?.getInternalPlayer().playVideo();
            }
        } else {
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

    // When we change the url (actually start and end position), and it doesn't affect the first one
    useEffect(() => {
        setTimeout(() => {
            // Notice this will also play or pause the video
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

            if (autoplay) {
                playerRef.current?.getInternalPlayer().playVideo();
            } else {
                playerRef.current?.getInternalPlayer().pauseVideo();
            }
        }, 1000);
    }, [urlInfo, repeat, autoplay]);


    useEffect(() => {

        // After 500ms, if canAutomaticallyStart is still null, that means the video can't be automatically played
        setTimeout(() => {
            if (canAutomaticallyStart === null) {
                setCanAutomaticallyStart(false);
            }
        }, 500);
    }, [canAutomaticallyStart]);

    return (
        <div style={{ display: canAutomaticallyStart === null ? "none" : "block" }}>
            <YoutubePlayer playerRef={playerRef}
                url={urlInfo.url}
                width={50}
                height={40}
                style={{ display: canAutomaticallyStart ? "none" : "inline-block" }}
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
        </div>);
}