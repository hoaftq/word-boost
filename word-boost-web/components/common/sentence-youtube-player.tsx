import { Tooltip, IconButton, Stack, ToggleButton } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { parseVideoUrl } from "./player-utils";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';

const YoutubePlayer = dynamic(() => import("../youtube-player"), { ssr: false });

type SentenceYoutubePlayerProps = {
    videoUrl: string;
    width: string | number;
    height: string | number;
    controlPosition: "start" | "center" | "end",
    initialMuted: boolean,
    play: boolean;
}

export function SentenceYoutubePlayer({ videoUrl, width, height, controlPosition, initialMuted, play }: SentenceYoutubePlayerProps) {
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

    const handleReplayClick = () => {
        setIsPlayingWholeVideo(false);
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
            playerRef.current?.getInternalPlayer().pauseVideo();
        }
    }, [urlInfo.start, play]);

    const playAt = (pos: number) => {
        playerRef.current?.seekTo(pos, "seconds");
        playerRef.current?.getInternalPlayer().playVideo();
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <YoutubePlayer playerRef={playerRef}
                key={hasControl ? "yp_1" : "yp_0"}
                width={width}
                height={height}
                controls={hasControl}
                muted={muted}
                url={urlInfo.url}
                onCustomProgress={handleCustomProgress} />
            <Stack direction={"row"} alignSelf={controlPosition} marginTop="2px" gap={1}>
                <Tooltip title="Play the whole video" sx={{ marginRight: 2 }}>
                    <IconButton onClick={handlePlayAllClick}>
                        <RestartAltIcon />
                    </IconButton>
                </Tooltip>
                <ToggleButton value={"controls"}
                    selected={hasControl}
                    size="small"
                    onChange={() => setHasControl(!hasControl)}>
                    <SettingsIcon />
                </ToggleButton>
                <IconButton onClick={() => { setMuted(v => !v); }}>
                    {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <Tooltip title="Replay with time range">
                    <IconButton onClick={handleReplayClick}>
                        <ReplayCircleFilledIcon />
                    </IconButton>
                </Tooltip>

            </Stack>
        </div >
    );
}

SentenceYoutubePlayer.defaultProps = {
    width: "min(560px, 100vw - 4px)",
    height: "315px",
    controlPosition: "center",
    initialMuted: false
};