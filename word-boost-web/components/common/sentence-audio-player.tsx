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
    const [playerKey, setPlayerKey] = useState(0);

    // Only set this state in player callback functions
    const [playerState, setPlayerState] = useState<"unstarted" | "playing" | "paused" | "ended">("unstarted");
    const [canStartAutomatically, setCanStartAutomatically] = useState<boolean | null>(null);
    const isManuallyPlayedRef = useRef(false);

    const urlInfo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);

    const handlePlay = () => {

        // The video has been started manually
        if (canStartAutomatically === false) {

            // Since it started from 0, we need to seek to the desire position and play from there
            playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);
            playerRef.current?.getInternalPlayer().playVideo();

            setCanStartAutomatically(true);

            // This will be used to make changing CanStartAutomatically not trigger playing one more time
            isManuallyPlayedRef.current = true;
        }

        setPlayerState("playing");
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

    // Whenever the url (without start and end) is changed, determine if it can be played automatically
    useEffect(() => {

        function waitForReady(playerNode: ReactPlayer | null, callback: () => void, timeout = 0) {

            // 3s
            if (timeout >= 60) {
                return;
            }

            if (typeof playerNode?.getInternalPlayer()?.playVideo === "function") {
                callback();
                return;
            }

            setTimeout(() => {
                waitForReady(playerNode, callback, timeout + 1);
            }, 50);
        }

        waitForReady(playerRef.current, () => {
            try {

                // Try to start the video to determine if it can be automatically played
                playerRef.current?.getInternalPlayer().seekTo(0, true);
                playerRef.current?.getInternalPlayer().mute();
                playerRef.current?.getInternalPlayer().playVideo();

                // Don't check too soon
                setTimeout(() => {
                    const isPlaying = playerRef.current?.getInternalPlayer()?.getPlayerState() === 1;
                    if (isPlaying) {
                        playerRef.current?.getInternalPlayer().unMute();
                        playerRef.current?.getInternalPlayer().pauseVideo();
                        setCanStartAutomatically(true);
                    } else {

                        // Reset the player so there will be a red play button in the middle of original youtube player
                        // And user can click it to start the video manually
                        setPlayerKey(prev => prev + 1);
                        waitForReady(playerRef.current, () => setCanStartAutomatically(false));
                    }
                }, 500);
            } catch {
                setCanStartAutomatically(false);
            }
        });

        isManuallyPlayedRef.current = false;
    }, [urlInfo.url]);

    // Decide what to do based on automaticallyStartStatus
    useEffect(() => {
        if (canStartAutomatically !== true) {
            return;
        }

        if (isManuallyPlayedRef.current) {
            isManuallyPlayedRef.current = false;
            return;
        }

        playerRef.current?.getInternalPlayer().seekTo(urlInfo.start, true);

        if (autoplay) {

            // This makes sure the video play when moving fast to another one when the previous one still playing 
            setTimeout(() => {
                playerRef.current?.getInternalPlayer().playVideo();
            }, 5);
        }

    }, [autoplay, canStartAutomatically, urlInfo, repeat]);

    return (
        // While canAutomaticallyStart is undetermined, the control isn't visible to user so they won't be able to play it manually
        <>
            {canStartAutomatically === null && <div style={{
                width: 50,
                height: 40,
                backgroundColor: "red",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <CircularProgress size="2em" color="info" />
            </div>}
            <div style={{ display: canStartAutomatically === null ? "none" : "block" }}>
                <YoutubePlayer key={playerKey}
                    playerRef={playerRef}
                    url={urlInfo.url}
                    width={50}
                    height={40}
                    style={{ display: canStartAutomatically ? "none" : "inline-block" }}
                    playbackRate={rate}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onCustomProgress={handleCustomProgress}
                />
                {playerState === "playing"
                    ? (
                        <PauseIcon htmlColor="white"
                            sx={{
                                backgroundColor: "red",
                                width: 50,
                                height: 40,
                                cursor: "pointer"
                            }}
                            onClick={handlePlayPauseButtonClick} />
                    )
                    : (
                        canStartAutomatically && <PlayArrowIcon htmlColor="white"
                            sx={{
                                backgroundColor: "red",
                                width: 50,
                                height: 40,
                                cursor: "pointer"
                            }}
                            onClick={handlePlayPauseButtonClick} />
                    )
                }
            </div>
        </>);
}