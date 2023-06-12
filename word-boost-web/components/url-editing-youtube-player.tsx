import { Button, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from "react";
import ReactPlayer, { Config } from "react-player";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
const YoutubePlayer = dynamic(() => import("./youtube-player"), { ssr: false });

type UrlEditingYouTubePlayerProps = {
    onChange: (event: { target: { value: string } }) => void,
    rangeIndex: number

};

export function UrlEditingYouTubePlayer({ onChange, rangeIndex }: UrlEditingYouTubePlayerProps) {
    const { control, watch, setValue } = useForm({
        defaultValues: {
            videoUrl: '',
            start: '',
            end: '',
            sentence: '',
            words: [{
                value: '',
                imageUrl: ''
            }],
            finalVideoUrl: ''
        }
    });
    const videoUrl = watch("videoUrl", "");
    const end = watch("end");

    const playerRef = useRef<ReactPlayer>(null);
    const [timeFocus, setTimeFocus] = useState<"start" | "end" | "none">("none");

    const handleStartCurrentTimeClick = () => {
        const currentTime = Math.floor(playerRef.current!.getCurrentTime());
        playerRef.current!.getInternalPlayer().pauseVideo();
        setValue("start", currentTime.toString());
        setTimeFocus("start");
    }

    const handleEndCurrentTimeClick = () => {
        const currentTime = Math.round(playerRef.current!.getCurrentTime());
        playerRef.current!.getInternalPlayer().pauseVideo();
        setValue("end", currentTime.toString());
        setTimeFocus("end");
    }

    const handleSeekButtonClick = (value: number) => {
        const seekToValue = value + playerRef.current!.getCurrentTime();
        if (seekToValue < 0) {
            return;
        }

        switch (timeFocus) {
            case "start":
                setValue("start", Math.floor(seekToValue).toString());
                break;
            case "end":
                setValue("end", Math.round(seekToValue).toString());
        }

        playerRef.current?.seekTo(seekToValue, "seconds");
    }

    useEffect(() => {
        const getVideoId = (videoUrlOrIdValue?: string) => {
            if (!videoUrlOrIdValue) {
                return;
            }

            const youtubeUrlRegex = new RegExp("(https:\\/\\/youtu.be\\/|https:\\/\\/www.youtube.com\\/watch\\?v=|https:\\/\\/www.youtube.com\\/embed\\/)([^&]+)");
            const match = videoUrlOrIdValue.match(youtubeUrlRegex);
            return match?.[2];
        }

        watch((value, { name, type }) => {
            if (name === "videoUrl" || name === "start" || name === "end") {
                const videoUrl = getVideoId(value.videoUrl);
                if (!videoUrl) {
                    return;
                }

                const queries: string[] = [];
                if (value.start) {
                    queries.push(`start=${value.start}`);
                }

                if (value.end) {
                    queries.push(`end=${value.end}`);
                }

                const finalVideoUrl = `https://www.youtube.com/embed/${videoUrl}${queries.length ? "?" : ""}${queries.join("&")}`
                setValue("finalVideoUrl", finalVideoUrl);
                onChange({ target: { value: finalVideoUrl } });
            }
        });
    }, [onChange, setValue, watch])

    useEffect(() => {
        if (rangeIndex == 0) {
            return;
        }

        const startTime = Number.parseInt(end) + 1;
        setValue("start", startTime.toString());
        playerRef.current?.seekTo(startTime, "seconds");
        setValue("end", "");
        setTimeFocus("none");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rangeIndex, setValue]);

    return (
        <Stack direction={"column"} alignItems={"center"}>
            <Controller control={control}
                name="videoUrl"
                render={({ field }) => <TextField {...field}
                    label="Video URL"
                    size="small"
                    fullWidth
                    sx={{ marginBottom: 1 }} />}
            />
            <YoutubePlayer playerRef={playerRef}
                config={{
                    youtube: {
                        playerVars: { controls: 1 }
                    }
                }}
                url={videoUrl}
                onPlay={() => setTimeFocus("none")} />
            <div style={{ marginTop: 10 }}>
                <Controller control={control}
                    name="start"
                    render={({ field }) => <TextField {...field}
                        label="Start"
                        size="small"
                        InputProps={{
                            readOnly: true
                        }}
                        sx={{
                            width: 100,
                            backgroundColor: timeFocus == "start" ? "lightblue" : ""
                        }} />}
                />
                <Tooltip title="Current time">
                    <IconButton onClick={handleStartCurrentTimeClick}>
                        <AccessAlarmIcon />
                    </IconButton>
                </Tooltip>
                <Controller control={control}
                    name="end"
                    render={({ field }) => <TextField {...field}
                        label="End"
                        size="small"
                        InputProps={{
                            readOnly: true
                        }}
                        sx={{
                            width: 100,
                            marginLeft: 2,
                            backgroundColor: timeFocus == "end" ? "lightblue" : ""
                        }} />} />
                <Tooltip title="Current time">
                    <IconButton onClick={handleEndCurrentTimeClick}>
                        <AccessAlarmIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{ marginTop: 10 }}>
                {[-3, -2, -1, 1, 2, 3].map(v => <Button key={v} onClick={() => handleSeekButtonClick(v)}>{v}s</Button>)}
            </div>
            <Controller control={control}
                name="finalVideoUrl"
                render={({ field }) => <TextField {...field}
                    label="Final URL"
                    size="small"
                    fullWidth
                    InputProps={{
                        readOnly: true
                    }}
                    sx={{ marginTop: 1 }} />}
            />
        </Stack >
    )
}

