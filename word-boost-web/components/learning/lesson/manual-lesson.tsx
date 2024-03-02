import dynamic from "next/dynamic";
import { Position } from "./get-position";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Button, Slider, Stack, Typography } from "@mui/material";

const YoutubePlayer = dynamic(() => import("../../youtube-player"), { ssr: false });

type ManualLesson = {
    videoUrl: string;
    positions: Position[]
}

export function ManualLesson({ lesson: { videoUrl, positions } }: { lesson: ManualLesson }) {
    const playerRef = useRef<ReactPlayer>(null);
    const [currentIndex, setCurrenIndex] = useState(0);

    const allPositions = [{ position: 0, label: '' }, ...positions];

    const marks = allPositions.map(l => ({
        value: l.position,
        label: ''
    }))

    function valueLabelFormat(value: number) {
        return Math.floor(value * 100) / 100;
    }

    function handlePrev() {
        const prevIndex = currentIndex - 1;
        setCurrenIndex(prevIndex);
        playerRef.current?.seekTo(allPositions[prevIndex].position);
        playerRef.current?.getInternalPlayer().playVideo();
    }

    function handlePlay() {
        playerRef.current?.getInternalPlayer().playVideo();
    }

    function handleCustomProgress(duration: number) {
        if (duration >= allPositions[currentIndex + 1].position) {
            playerRef.current?.getInternalPlayer().pauseVideo();
            setCurrenIndex(prevIndex => prevIndex + 1);
        }
    }

    function handleSliderChange(event: Event, value: number | number[], activeThumb: number) {
        const index = allPositions.findIndex(p => p.position === value);
        setCurrenIndex(index);
        playerRef.current?.seekTo(allPositions[index].position);
        playerRef.current?.getInternalPlayer().playVideo();
    }

    useEffect(() => {
        playerRef.current?.seekTo(0, "seconds");
        playerRef.current?.getInternalPlayer().playVideo();
    }, []);

    const sentence = allPositions[currentIndex].label;
    return (
        <Stack sx={{ height: 'calc(100vh - 16px)' }}>
            <YoutubePlayer
                playerRef={playerRef}
                url={videoUrl}
                width="100%"
                controls={true}
                style={{ flex: 1 }}
                onCustomProgress={handleCustomProgress} />
            <Stack sx={{ marginTop: 1 }}>
                {sentence && <Typography variant="h4">{sentence}</Typography>}
                <Slider
                    valueLabelFormat={valueLabelFormat}
                    valueLabelDisplay="auto"
                    step={null}
                    marks={marks}
                    value={marks[currentIndex].value}
                    onChange={handleSliderChange}
                />
                <Stack direction="row" gap={3} sx={{ justifyContent: 'center' }}>
                    <Button color="primary" variant="contained" onClick={handlePrev}>Prev</Button>
                    <Button color="primary" variant="contained" onClick={handlePlay}>Play</Button>
                </Stack>
            </Stack>
        </Stack>
    )
}