import { Box, Button, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { GetPosition, Position } from "@wb/components/learning/lesson/get-position";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export default function AddManualLesson() {
    const [videoUrl, setVideoUrl] = useState('');
    const [positions, setPositions] = useState<Position[]>([]);
    const { control, getValues, formState: { errors }, handleSubmit } = useForm({
        defaultValues: {
            course: "",
            unit: ""
        }
    });

    function handleVideoUrlChange(url: string) {
        setVideoUrl(url);
    }

    function handleUsePosition(position: Position) {
        setPositions(prev => [...prev, position]);
    }

    function handleFirst() {

    }

    function handleLast() {
    }

    function onAddLesson() {
        const lesson = {
            ...getValues(),
            videoUrl,
            positions
        };
        alert(`Add lesson ${JSON.stringify(lesson)}`);
    }

    return (
        <form onSubmit={handleSubmit(onAddLesson)}>
            <GetPosition onVideoUrlChange={handleVideoUrlChange} onUsePosition={handleUsePosition} />
            <Stack direction="row" sx={{ marginTop: 5, gap: 2 }}>
                <Box sx={{
                    flex: 1,
                    height: 300,
                    overflow: 'auto'
                }}>
                    {positions.length
                        ? <List dense={true} style={{ flex: 1 }}>
                            {positions.map((p, i) => <ListItem key={p.position}>
                                <ListItemButton>
                                    <ListItemText>
                                        <Typography sx={{
                                            fontWeight: 'bold',
                                            minWidth: 30,
                                            marginRight: 2
                                        }}
                                            display="inline-block">{i + 1}.</Typography>
                                        {p.position}{p.label && ' - '}{p.label}
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>)}
                        </List>
                        : <Box sx={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div>No positions</div>
                        </Box>
                    }
                </Box>
                <Stack sx={{ justifyContent: 'center', gap: 2 }}>
                    <Button onClick={handleFirst} color="info" variant="contained">Fist</Button>
                    <Button onClick={handleLast} color="info" variant="contained">Last</Button>
                </Stack>
            </Stack>
            <Controller control={control}
                name="course"
                rules={{ required: { value: true, message: 'Course is required.' } }}
                render={({ field }) => <TextField {...field}
                    sx={{ marginTop: 2 }}
                    error={!!errors?.course}
                    helperText={errors?.course?.message}
                    label="Course"
                    size="small"
                    fullWidth />}
            />
            <Controller control={control}
                name="unit"
                rules={{ required: { value: true, message: 'Unit is required.' } }}
                render={({ field }) => <TextField
                    {...field}
                    sx={{ marginTop: 2 }}
                    error={!!errors?.unit}
                    helperText={errors?.unit?.message}
                    label="Unit"
                    size="small"
                    fullWidth />}
            />
            <Stack direction="row-reverse" sx={{ marginTop: 5 }}>
                <Button color="primary" variant="contained" type="submit">Add lesson</Button>
            </Stack>
        </form>
    )
}