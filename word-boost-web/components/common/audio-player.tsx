import { IconButton } from "@mui/material";
import YoutubePlayer from "../youtube-player";
import ReactPlayer from "react-player";
import { useRef, useState } from "react";
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

export function AudioPlayer({ mediaUrl }: { mediaUrl: string }) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
    }

    const handlePause = () => {
        setIsPlaying(false);
    }

    const handleEnded = () => {
        setIsPlaying(false);
    }

    const handlePlayPauseButtonClick = () => {
        const internalPlayer = playerRef.current!.getInternalPlayer();
        if (isPlaying) {
            internalPlayer.pauseVideo();
        } else {
            internalPlayer.playVideo();
        }
    }

    return (<div style={{
        display: "flex",
        alignItems: "center",
        gap: 3
    }}>
        <div>Listen:</div>
        <YoutubePlayer playerRef={playerRef}
            url={mediaUrl}
            width={50}
            height={40}
            style={{ display: "inline-block", }}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
        />
        <IconButton color="error"
            size="large"
            onClick={handlePlayPauseButtonClick}>
            {isPlaying ? <PauseCircleIcon /> : <SmartDisplayIcon />}
        </IconButton>
    </div>);
}