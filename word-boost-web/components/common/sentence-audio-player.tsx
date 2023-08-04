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
    onFinish?: () => void;
}

AudioPlayer.defaultProps = {
    rate: 1
};

export function AudioPlayer({ videoUrl, rate, repeat, onFinish }: AudioPlayerProps) {
    const playerRef = useRef<ReactPlayer>(null);
    const [playerState, setPlayerState] = useState<"unstarted" | "playing" | "paused" | "ended">("unstarted");
    const [canAutomaticallyStart, setCanAutomaticallyStart] = useState(false);

    const urlInfo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

    const handlePlay = () => {
        setPlayerState("playing")

        // For browsers that don't support autoplay
        if (!canAutomaticallyStart) {
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);
            playerRef.current?.getInternalPlayer().playVideo();
        }
        setCanAutomaticallyStart(true);
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
        setTimeout(() => {
            // Notice this will also play the video when it's paused on normal browsers
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

            // Make sure the video is played when it's the next sentence
            playerRef.current?.getInternalPlayer().playVideo();
        }, 1000);
    }, [urlInfo, repeat]);

    return (
        <div>
            <YoutubePlayer playerRef={playerRef}
                url={urlInfo.url}
                width={50}
                height={40}
                playbackRate={rate}
                style={{ display: canAutomaticallyStart ? "none" : "inline-block" }}
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