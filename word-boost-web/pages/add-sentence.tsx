import { FocusEvent, useState } from "react";
import { Button, Divider, FormControl, Grid, IconButton, Stack, TextField } from "@mui/material";
import { UrlEditingYouTubePlayer } from "@wb/components/url-editing-youtube-player";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TraditionalChangeTextField } from "./add-word";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { enqueueSnackbar } from "notistack";

type VideoForm = {
    unit: string;
    course: string;
    videoUrl: string;
    sentence: string;
    words: {
        value: string;
        imageUrl: string;
    }[];
}

export default function AddSentence() {
    const { control, handleSubmit, resetField, setFocus, formState: { errors } } = useForm({
        defaultValues: {
            unit: '',
            course: '',
            videoUrl: '',
            sentence: '',
            words: [{
                value: '',
                imageUrl: ''
            }]
        } as VideoForm
    });
    const { fields, append, remove } = useFieldArray({ control, name: "words" });
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();
    const [rangeIndex, setRangeIndex] = useState(0);

    const handleRemoveSentenceClick = (index: number) => {
        remove(index);
    }

    const handleAddSentenceClick = () => {
        append({
            value: "",
            imageUrl: ""
        });
    }

    const handleWordChange = (e: FocusEvent<HTMLInputElement>) => {
        const word = e.target.value?.trim();
        if (word) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(word)}&tbm=isch`, "word_boost_search");
        }
    }

    const onSubmit = async (data: VideoForm) => {
        await blockingFetch('add-words-sentence', {
            method: "post",
            body: JSON.stringify({
                sentence: data.sentence.trim(),
                unit: data.unit.trim(),
                course: data.course.trim(),
                mediaUrl: data.videoUrl.trim(),
                words: data.words.map(w => ({
                    value: w.value.trim(),
                    imageUrl: w.imageUrl.trim(),
                }))
            })
        })
            .then(resp => resp.text())
            .then((wordIds: string) => {
                enqueueSnackbar(`Added ${wordIds.split(",").length} new word(s)`, { variant: 'success' });
            });

        resetField("sentence");
        resetField("words");
        setFocus("sentence");
        setRangeIndex(rangeIndex + 1);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack direction={"column"} spacing={2} >
                <Controller name="unit"
                    control={control}
                    rules={{ required: { value: true, message: 'Unit is required.' } }}
                    render={({ field }) => <TextField {...field}
                        label="Unit"
                        size="small"
                        required
                        error={!!errors.unit}
                        helperText={errors?.unit?.message}
                    />}
                />

                <Controller name="course"
                    control={control}
                    rules={{ required: { value: true, message: 'Course is required.' } }}
                    render={({ field }) => <TextField {...field}
                        label="Course"
                        size="small"
                        required
                        error={!!errors.course}
                        helperText={errors?.course?.message}
                    />}
                />

                <Controller control={control}
                    name="videoUrl"
                    render={({ field: { onChange } }) => <FormControl>
                        <UrlEditingYouTubePlayer onChange={onChange} rangeIndex={rangeIndex} />
                    </FormControl>}
                />

                <Controller control={control}
                    name="sentence"
                    rules={{ required: { value: true, message: "Sentence is required." } }}
                    render={({ field }) => <TextField {...field}
                        label="Sentence"
                        size="small"
                        required
                        error={!!errors.sentence}
                        helperText={errors.sentence?.message}
                        fullWidth />} />

                <Divider textAlign="left">Words</Divider>

                {fields.map((f, i) => (<Grid key={f.id} container rowSpacing={2}>
                    <Grid item xs={12}>
                        <Controller name={`words.${i}.value`}
                            control={control}
                            rules={{ required: { value: true, message: 'Word is required.' } }}
                            render={({ field }) => <TraditionalChangeTextField {...field}
                                size="small"
                                label="Word"
                                fullWidth
                                required
                                error={!!errors.words?.[i]?.value}
                                helperText={errors?.words?.[i]?.value?.message}
                                onTraditionalChange={handleWordChange} />}
                        />
                    </Grid>
                    <Grid item xs>
                        <Controller name={`words.${i}.imageUrl`}
                            control={control}
                            render={({ field }) => <TextField {...field}
                                size="small"
                                label="Word Image URL"
                                fullWidth />}
                        />
                    </Grid>
                    <Grid item xs="auto">
                        <IconButton color="error" onClick={() => handleRemoveSentenceClick(i)}>
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                    </Grid>
                    <Divider />
                </Grid>))}

                <IconButton color="info" sx={{ alignSelf: "flex-end" }} onClick={handleAddSentenceClick}>
                    <AddCircleOutlineIcon />
                </IconButton>

                <Button variant="contained"
                    sx={{ width: 100, alignSelf: "flex-end" }}
                    startIcon={<AddCircleIcon />}
                    type="submit"
                >Add</Button>
            </Stack>
            <FetchingBackdrop />
        </form>
    );
}