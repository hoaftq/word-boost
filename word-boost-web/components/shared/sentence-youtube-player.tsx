import { Tooltip, IconButton, Stack, ToggleButton } from "@mui/material";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { parseVideoUrl } from "./player-utils";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import screenfull from "screenfull";
import PlayDisabledIcon from '@mui/icons-material/PlayDisabled';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const YoutubePlayer = dynamic(() => import("../common/youtube-player"), { ssr: false });

type SentenceYoutubePlayerProps = {
    videoUrl: string;
    width: string | number;
    height: string | number;
    controlPosition: "start" | "center" | "end",
    initialMuted: boolean,
    play: boolean;
    onAutoPlay?: () => void,
    onUnmutedPlay?: () => void,
    onMutedPlay?: () => void,
    onPlayFinished?: () => void
}

export function SentenceYoutubePlayer({
    videoUrl,
    width,
    height,
    controlPosition,
    initialMuted,
    play,
    onAutoPlay,
    onUnmutedPlay,
    onMutedPlay,
    onPlayFinished }: SentenceYoutubePlayerProps) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlayingWholeVideo, setIsPlayingWholeVideo] = useState(false);
    const [hasControl, setHasControl] = useState(false);

    const [muted, setMuted] = useState(initialMuted);
    const [prevInitialMuted, setPrevInitialMuted] = useState(initialMuted);
    const [prevVideoUrl, setPrevVideoUrl] = useState(videoUrl);

    if (prevInitialMuted !== initialMuted) {
        setPrevInitialMuted(initialMuted);
        setMuted(initialMuted);
    }

    if (prevVideoUrl !== videoUrl) {
        setPrevVideoUrl(videoUrl);
        setMuted(initialMuted);
    }

    const urlInfo = parseVideoUrl(videoUrl);

    const replayWithTimeRange = (isMuted?: boolean) => {
        setIsPlayingWholeVideo(false);
        if (isMuted !== undefined) {
            setMuted(isMuted);
        }

        playAt(urlInfo.start);
    }

    const handlePlayAllClick = () => {
        setIsPlayingWholeVideo(true);
        playAt(0);
    }

    const handleCustomProgress = (duration: number) => {
        if (isPlayingWholeVideo) {
            return;
        }

        if (urlInfo.end && duration > urlInfo.end) {
            playerRef.current?.getInternalPlayer().pauseVideo();
            onPlayFinished?.();
        }
    }

    useEffect(() => {
        if (play) {
            const timerId = setTimeout(() => {
                playAt(urlInfo.start);
            }, 500);

            return () => {
                clearTimeout(timerId);
            }
        } else {
            // Internal player can be null here
            playerRef.current?.getInternalPlayer()?.pauseVideo();
        }
    }, [urlInfo.start, play]);

    useEffect(() => {
        if (play) {
            onAutoPlay?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [play, videoUrl]);

    const setFullScreen = useCallback((fullScreen: boolean) => {
        const playerWrapper = (playerRef.current as any).wrapper as any;
        if (fullScreen) {
            screenfull.request(playerWrapper);
        } else {
            screenfull.exit();
        }
    }, []);

    const playAt = (pos: number) => {
        playerRef.current?.seekTo(pos, "seconds");
        playerRef.current?.getInternalPlayer().playVideo();
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "white"
        }}>
            <YoutubePlayer playerRef={playerRef}
                key={hasControl ? "yp_1" : "yp_0"}
                width={width}
                height={height}
                controls={hasControl}
                muted={muted}
                url={urlInfo.url}
                onCustomProgress={handleCustomProgress} />
            <Stack direction={"row"}
                alignSelf={controlPosition}
                marginTop="2px"
                gap={1}>
                <Tooltip title="Play the whole video" sx={{ marginRight: 2 }}>
                    <IconButton onClick={handlePlayAllClick}>
                        <PlayCircleOutlineIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Show player controls">
                    <ToggleButton value={"controls"}
                        selected={hasControl}
                        size="small"
                        onChange={() => setHasControl(!hasControl)}>
                        <VideoSettingsIcon />
                    </ToggleButton>
                </Tooltip>
                <Tooltip title="Player volume">
                    <IconButton onClick={() => { setMuted(v => !v); }}>
                        {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Play with volume off">
                    <IconButton onClick={() => { onMutedPlay?.(); replayWithTimeRange(true); }}>
                        <PlayDisabledIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Play with volume on">
                    <IconButton onClick={() => { onUnmutedPlay?.(); replayWithTimeRange(false); }}>
                        <PlayArrowIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        </div >
    );
}

SentenceYoutubePlayer.defaultProps = {
    width: "min(560px, 100vw - 4px)",
    height: 315,
    controlPosition: "center",
    initialMuted: false
};