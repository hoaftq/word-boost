import { Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { PlayCommand } from "@wb/components/learning/lesson";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import dynamic from "next/dynamic";
import { useId, useRef, useState, MouseEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import ReactPlayer from "react-player";

const YoutubePlayer = dynamic(() => import("../components/youtube-player"), { ssr: false });

export default function AddLesson() {
    const [positions, setPositions] = useState<Position[]>([]);
    const idPrefix = useId();
    const [commands, setCommands] = useState<PlayCommand[]>([]);
    const { control, getValues, resetField } = useForm({
        defaultValues: {
            url: "",
            label: "",
            start: null,
            end: null,
            rate: 1,
            delay: 0,
            repeat: 1,
            description: "",
            course: "",
            unit: ""
        }
    });
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    function handleUsePosition(position: Position) {
        setPositions([...positions, position]);
    }

    function handleAddCommandClick(): void {
        setCommands([...commands, {
            url: getValues("url"),
            label: getValues("label"),
            start: getValues("start") ?? 0,
            end: getValues("end") ?? 0,
            rate: getValues("rate"),
            delay: getValues("delay"),
            repeat: getValues("repeat"),
            description: getValues("description")
        }]);
        resetField("label");
        resetField("description");
    }

    function handleAddClick(event: MouseEvent<HTMLButtonElement>) {
        blockingFetch("add-lesson", {
            method: "post",
            body: JSON.stringify({
                course: getValues("course"),
                unit: getValues("unit"),
                mediaLessons: {
                    name: "",
                    commands
                }
            })
        });
    }

    return <>
        <GetPosition onUsePosition={handleUsePosition}></GetPosition>
        <Divider style={{ marginTop: 30, marginBottom: 30 }} />
        <Stack spacing={2}>
            <Controller control={control}
                name="label"
                render={({ field }) => <TextField {...field} label="Command Label" size="small"></TextField>}
            />
            <Stack direction="row" spacing={4}>
                <Controller control={control}
                    name="start"
                    render={({ field }) => <FormControl size="small" fullWidth>
                        <InputLabel id={`${idPrefix}-start`} >Start</InputLabel>
                        <Select {...field} labelId={`${idPrefix}-start`} label="Start">
                            {positions.map(p => <MenuItem key={p.position} value={p.position}>{p.label}</MenuItem>)}
                        </Select>
                    </FormControl>} />

                <Controller control={control}
                    name="end"
                    render={({ field }) => <FormControl size="small" fullWidth>
                        <InputLabel id={`${idPrefix}-end`} >End</InputLabel>
                        <Select {...field} labelId={`${idPrefix}-end`} label="End">
                            {positions.map(p => <MenuItem key={p.position} value={p.position}>{p.label}</MenuItem>)}
                        </Select>
                    </FormControl>} />
                <Controller control={control}
                    name="rate"
                    render={({ field }) => <FormControl size="small" fullWidth>
                        <InputLabel id={`${idPrefix}-rate`}>Rate</InputLabel>
                        <Select {...field} labelId={`${idPrefix}-rate`} label="Rate">
                            {[0.5, 0.6, 0.7, 0.75, 1].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>}
                />
            </Stack>

            <Stack direction="row" spacing={4}>
                <Controller control={control}
                    name="delay"
                    render={({ field }) => <TextField {...field} label="Delay" type="number" size="small" />}
                />
                <Controller control={control}
                    name="repeat"
                    render={({ field }) => <TextField {...field} label="Repeat" type="number" size="small" />}
                />
            </Stack>
            <Controller control={control}
                name="description"
                render={({ field }) => < TextField {...field} label="Description" size="small" fullWidth />}
            />

            <Button variant="contained"
                color="secondary"
                style={{ alignSelf: "end" }}
                onClick={handleAddCommandClick}>Add command</Button>

            <Divider style={{ marginTop: 30, marginBottom: 30 }} />

            <TextField multiline rows={4} fullWidth value={JSON.stringify(commands)}></TextField>
            <Controller control={control}
                name="course"
                render={({ field }) => <TextField {...field} label="Course" size="small" fullWidth />}
            />
            <Controller control={control}
                name="unit"
                render={({ field }) => <TextField {...field} label="Unit" size="small" fullWidth />}
            />
            <Button variant="contained"
                color="primary"
                style={{ alignSelf: "end" }}
                onClick={handleAddClick}>Add</Button>
        </Stack>
        <FetchingBackdrop />
    </>
}

enum TestingStatus {
    NotStarted,
    BeforeCurrentPosition,
    AfterCurrentPosition
}

type Position = {
    position: number;
    label: string;
}

function GetPosition({ onUsePosition }: { onUsePosition: (position: Position) => void }) {
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
                render={({ field }) => <TextField {...field} size="small" placeholder="Video URL" fullWidth />} />
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