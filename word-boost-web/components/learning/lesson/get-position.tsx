import { Stack, TextField, Button } from "@mui/material";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactPlayer from "react-player";

const YoutubePlayer = dynamic(() => import("../../../components/youtube-player"), { ssr: false });

enum TestingStatus {
    NotStarted,
    BeforeCurrentPosition,
    AfterCurrentPosition
}

export type Position = {
    position: number;
    label: string;
}

type GetPositionProps = {
    onVideoUrlChange: (url: string) => void;
    onUsePosition: (position: Position) => void;
}

export function GetPosition({ onVideoUrlChange, onUsePosition }: GetPositionProps) {
    const playerRef = useRef<ReactPlayer>(null);
    const { control, watch, setValue, getValues, resetField } = useForm({
        defaultValues: {
            videoUrl: "",
            currentPosition: "",
            label: ""
        }
    });

    const videoUrl = watch("videoUrl");
    const currentPosition = parseFloat(watch("currentPosition"));
    watch(({ currentPosition }) => {
        if (currentPosition) {
            playerRef.current?.seekTo(parseFloat(currentPosition), "seconds");
        }
    });

    const [testingStatus, setTestingStatus] = useState<TestingStatus>(TestingStatus.NotStarted);

    const handleSeekButtonClick = (value: number) => {
        const seekToValue = value + playerRef.current!.getCurrentTime();
        if (seekToValue < 0) {
            return;
        }

        playerRef.current?.seekTo(seekToValue, "seconds");
        setValue("currentPosition", seekToValue.toString());
    }

    const handleGetCurrentPositionClick = () => {
        const position = playerRef.current?.getCurrentTime();
        setValue("currentPosition", position?.toString() ?? "");
    }

    function handleTestPositionClick(): void {
        setTestingStatus(TestingStatus.BeforeCurrentPosition);

        const position = currentPosition >= 5 ? currentPosition - 5 : 0;
        playerRef.current?.seekTo(position);
        playerRef.current?.getInternalPlayer().playVideo();
    }

    function handleUsePositionClick(): void {
        const value = getValues();
        onUsePosition({
            label: value.label,
            position: parseFloat(value.currentPosition)
        });
        resetField("label");
    }

    function handleCustomProgress(duration: number): void {
        switch (testingStatus) {
            case TestingStatus.BeforeCurrentPosition:
                if (duration >= currentPosition) {
                    playerRef.current?.getInternalPlayer().pauseVideo();
                    const timerId = setTimeout(() => {
                        playerRef.current?.getInternalPlayer().playVideo();
                        setTestingStatus(TestingStatus.AfterCurrentPosition);
                        clearTimeout(timerId);
                    }, 2000);
                }
                break;
            case TestingStatus.AfterCurrentPosition:
                if (duration >= currentPosition + 5) {
                    playerRef.current?.getInternalPlayer().pauseVideo();
                    playerRef.current?.seekTo(currentPosition);
                    setTestingStatus(TestingStatus.NotStarted);
                }
                break;
        }
    }

    return (
        <Stack spacing={2}>
            <Controller control={control}
                name="videoUrl"
                render={({ field }) => <TextField
                    {...field}
                    size="small"
                    placeholder="Video URL"
                    fullWidth
                    onChange={event => { field.onChange(event); onVideoUrlChange(event.target.value) }}
                />} />
            <YoutubePlayer playerRef={playerRef}
                config={{
                    youtube: {
                        playerVars: { controls: 1 }
                    }
                }}
                url={videoUrl}
                onCustomProgress={handleCustomProgress}
            />
            <div style={{ marginTop: 10 }}>
                {[-3, -1, -0.5, -0.1, 0.1, 0.5, 1, 3].map(v => <Button key={v} onClick={() => handleSeekButtonClick(v)}>{v}s</Button>)}
            </div>
            <Stack direction="row" spacing={1}>
                <Controller control={control}
                    name="currentPosition"
                    render={({ field }) => <TextField {...field} size="small" label="Current Position" type="number" />} />
                <Button variant="contained"
                    color="secondary"
                    onClick={handleGetCurrentPositionClick}>Get currrent position</Button>
                <Button variant="contained"
                    color="secondary"
                    onClick={handleTestPositionClick}>Test position</Button>
            </Stack>
            <Controller control={control}
                name="label"
                render={({ field }) => <TextField {...field} size="small" label="Position Label" fullWidth />}
            />

            <Button variant="contained"
                color="secondary"
                style={{ alignSelf: "end" }}
                onClick={handleUsePositionClick}>Use position</Button>
        </Stack>
    );
}