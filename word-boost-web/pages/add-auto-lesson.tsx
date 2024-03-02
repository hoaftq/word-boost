import { Button, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { PlayCommand } from "@wb/components/learning/lesson/auto-lesson";
import { GetPosition, Position } from "@wb/components/learning/lesson/get-position";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { useId, useState, MouseEvent } from "react";
import { Controller, useForm } from "react-hook-form";

export default function AddAutoLesson() {
    const [videoUrl, setVideoUrl] = useState('');
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

    function handleVideoUrlChange(url: string) {
        setVideoUrl(url);
    }

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
        <GetPosition onVideoUrlChange={handleVideoUrlChange} onUsePosition={handleUsePosition}></GetPosition>
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
