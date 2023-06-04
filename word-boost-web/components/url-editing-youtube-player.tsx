import { Button, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import dynamic from 'next/dynamic'
import { useEffect, useRef } from "react";
import ReactPlayer, { Config } from "react-player";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
const YoutubePlayer = dynamic(() => import("./youtube-player"), { ssr: false });

type UrlEditingYouTubePlayerProps = {
    onChange: (event: { target: { value: string } }) => void
};

export function UrlEditingYouTubePlayer({ onChange }: UrlEditingYouTubePlayerProps) {
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

    let playerRef = useRef<ReactPlayer>(null);

    const handleStartCurrentTimeClick = () => {
        const currentTime = Math.floor(playerRef.current!.getCurrentTime());
        setValue('start', currentTime.toString());
    }

    const handleEndCurrentTimeClick = () => {
        const currentTime = Math.round(playerRef.current!.getCurrentTime());
        setValue('end', currentTime.toString());
    }

    const handleSeekButtonClick = (value: number) => {
        const seekToValue = value + playerRef.current!.getCurrentTime();
        if (seekToValue < 0) {
            return;
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

    const config: Config = {
        youtube: {
            playerVars: { controls: 1 }
        }
    };

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
            <YoutubePlayer playerRef={playerRef} config={config} url={videoUrl} />
            <div style={{ marginTop: 10 }}>
                <Controller control={control}
                    name="start"
                    render={({ field }) => <TextField {...field}
                        label="Start"
                        size="small"
                        InputProps={{
                            readOnly: true
                        }}
                        sx={{ width: 100 }} />} />
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
                        sx={{ width: 100, marginLeft: 2 }} />} />
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

