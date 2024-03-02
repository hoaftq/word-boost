import { Button, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, MouseEvent } from "react";
import ReactPlayer from "react-player";
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import BugReportIcon from '@mui/icons-material/BugReport';

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
    const start = parseFloat(watch("start"));
    const end = parseFloat(watch("end"));

    const playerRef = useRef<ReactPlayer>(null);
    const [timeFocus, setTimeFocus] = useState<"start" | "end" | "none">("none");
    const [isTesting, setIsTesting] = useState(false);

    const handleCurrentTimeClick = (target: "start" | "end") => {
        const currentTime = playerRef.current!.getCurrentTime();
        playerRef.current!.getInternalPlayer().pauseVideo();
        setValue(target, currentTime.toString());
        setTimeFocus(target);
    }

    const handleSeekButtonClick = (value: number) => {
        const seekToValue = value + playerRef.current!.getCurrentTime();
        if (seekToValue < 0) {
            return;
        }

        if (timeFocus !== "none") {
            setValue(timeFocus, seekToValue.toString());
        }

        playerRef.current?.seekTo(seekToValue, "seconds");
    }

    const handleGotoButtonClick = (target: "start" | "end") => {
        const seekToValue = target === "start" ? start : end;
        playerRef.current?.seekTo(seekToValue, "seconds");
        setTimeFocus(target);
    }

    const handleTestClick = (event: MouseEvent<HTMLButtonElement>) => {
        setIsTesting(true);
        playerRef.current?.seekTo(start, "seconds");
        playerRef.current!.getInternalPlayer().playVideo();
    }

    const handleCustomProgress = (duration: number) => {
        if (isTesting && duration >= end) {
            playerRef.current!.getInternalPlayer().pauseVideo();
            setIsTesting(false);
        }
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

        const newStartTime = watch("end");;
        setValue("start", newStartTime);
        playerRef.current?.seekTo(parseFloat(newStartTime), "seconds");
        setValue("end", "");
        setTimeFocus("none");
    }, [rangeIndex, setValue, watch]);

    return (
        <Stack direction={"column"}
            alignItems={"center"}
            border={1}
            borderColor={"#c4c4c4"}
            borderRadius={1}
            padding={1}>
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
                onPlay={() => setTimeFocus("none")}
                onCustomProgress={handleCustomProgress} />
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
                            width: 200,
                            backgroundColor: timeFocus == "start" ? "lightblue" : ""
                        }} />}
                />
                <Tooltip title="Use current time">
                    <IconButton color="secondary" onClick={() => handleCurrentTimeClick("start")}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Seek to start time">
                    <IconButton sx={{ marginRight: 3 }}
                        onClick={() => handleGotoButtonClick("start")}>
                        <UploadIcon />
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
                            width: 200,
                            backgroundColor: timeFocus == "end" ? "lightblue" : ""
                        }} />} />
                <Tooltip title="Use current time">
                    <IconButton color="secondary" onClick={() => handleCurrentTimeClick("end")}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Seek to start end">
                    <IconButton sx={{ marginRight: 3 }}
                        onClick={() => handleGotoButtonClick("end")}>
                        <UploadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Test">
                    <IconButton onClick={handleTestClick}>
                        <BugReportIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{ marginTop: 10 }}>
                {[-3, -1, -0.5, -0.1, 0.1, 0.5, 1, 3].map(v => <Button key={v}
                    onClick={() => handleSeekButtonClick(v)}>{v}s
                </Button>)}
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
