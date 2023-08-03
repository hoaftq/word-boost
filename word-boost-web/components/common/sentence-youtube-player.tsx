import { Tooltip, IconButton, FormControlLabel, Checkbox } from "@mui/material";
import dynamic from "next/dynamic";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const YoutubePlayer = dynamic(() => import("../youtube-player"), { ssr: false });

export function SentenceYoutubePlayer({ videoUrl, play }: { videoUrl: string, play: boolean }) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlayingWholeVideo, setIsPlayingWholeVideo] = useState(false);
    const [hasControl, setHasControl] = useState(false);

    const handleReplayClick = () => {
        setIsPlayingWholeVideo(false);
        playAt(startEnd.start);
    }

    const handlePlayAllClick = () => {
        setIsPlayingWholeVideo(true);
        playAt(0);
    }

    const startEnd: { [key: string]: number } = { start: 0 };
    const splittedUrlParts = videoUrl.split(/[?|&]/g);
    for (let i = 1; i < splittedUrlParts.length; i++) {
        const query = splittedUrlParts[i].split("=");
        startEnd[query[0]] = parseFloat(query[1]);
    }

    const handleCustomProgress = (duration: number) => {
        if (isPlayingWholeVideo) {
            return;
        }

        if (startEnd.end && duration > startEnd.end) {
            playerRef.current?.getInternalPlayer().pauseVideo();
        }
    }

    const handleHasControlChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setHasControl(checked);
    }

    useEffect(() => {
        if (play) {
            const timerId = setTimeout(() => {
                playAt(startEnd.start);
            }, 500);

            return () => {
                clearTimeout(timerId);
            }
        }
    }, [startEnd.start, play]);

    const playAt = (pos: number) => {
        playerRef.current?.seekTo(pos, "seconds");
        playerRef.current?.getInternalPlayer().playVideo();
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <YoutubePlayer playerRef={playerRef}
                    key={hasControl ? "yp_1" : "yp_0"}
                    width="min(560px, 100vw - 4px)"
                    height="315px"
                    controls={hasControl}
                    url={splittedUrlParts[0]}
                    onCustomProgress={handleCustomProgress} />
                <div>
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
                </div>
            </div>
        </>
    )
}