import { Tooltip, IconButton, FormControlLabel, Checkbox, Stack } from "@mui/material";
import dynamic from "next/dynamic";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { parseVideoUrl } from "./player-utils";

const YoutubePlayer = dynamic(() => import("../youtube-player"), { ssr: false });

type SentenceYoutubePlayerProps = {
    videoUrl: string;
    width: string | number;
    height: string | number;
    controlPosition: "start" | "center" | "end",
    play: boolean;
}

export function SentenceYoutubePlayer({ videoUrl, width, height, controlPosition, play }: SentenceYoutubePlayerProps) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlayingWholeVideo, setIsPlayingWholeVideo] = useState(false);
    const [hasControl, setHasControl] = useState(false);

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

    const handleHasControlChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setHasControl(checked);
    }

    useEffect(() => {
        if (play) {
            const timerId = setTimeout(() => {
                playAt(urlInfo.start);
            }, 500);

            return () => {
                clearTimeout(timerId);
            }
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
                url={urlInfo.url}
                onCustomProgress={handleCustomProgress} />
            <Stack direction={"row"} alignSelf={controlPosition}>
                <Tooltip title="Replay with time range">
                    <IconButton sx={{ marginRight: 1 }} onClick={handleReplayClick}>
                        <ReplayCircleFilledIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Play the whole video">
                    <IconButton sx={{ marginRight: 5 }} onClick={handlePlayAllClick}>
                        <RestartAltIcon />
                    </IconButton>
                </Tooltip>
                <FormControlLabel label="Control"
                    control={<Checkbox checked={hasControl} onChange={handleHasControlChange} />} />
            </Stack>
        </div>
    );
}

SentenceYoutubePlayer.defaultProps = {
    width: "min(560px, 100vw - 4px)",
    height: "315px",
    controlPosition: "center"
};