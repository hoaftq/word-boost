import { FocusEvent, useState } from "react";
import { Button, Divider, FormControl, Grid, IconButton, Stack, TextField } from "@mui/material";
import { UrlEditingYouTubePlayer } from "@wb/components/url-editing-youtube-player";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TraditionalChangeTextField } from "./add-word";
import getConfig from "next/config";
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

export default function AddWordVideoBased() {
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
        const { publicRuntimeConfig: { apiUrl } } = getConfig();

        for (const word of data.words) {
            await blockingFetch(`${apiUrl}/add`, {
                method: "post",
                body: JSON.stringify({
                    value: word.value?.trim(),
                    unit: data.unit?.trim(),
                    course: data.course?.trim(),
                    imageUrl: word.imageUrl?.trim(),
                    sentences: [{
                        value: data.sentence,
                        mediaUrl: data.videoUrl
                    }]
                })
            })
                .then(resp => resp.text())
                .then((wordId: string) => {
                    enqueueSnackbar(`Added a new word with id of ${wordId}`, { variant: 'success' });
                });
        }

        resetField("sentence");
        resetField("words");
        setFocus("sentence");
        setRangeIndex(rangeIndex + 1);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction={"column"} spacing={2} >
                <Controller name="unit"
                    control={control}
                    rules={{ required: { value: true, message: 'Unit is required.' } }}
                    render={({ field }) => <TextField {...field}
                        label="Unit"
                        size="small"
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
                    render={({ field }) => <TextField {...field}
                        label="Sentence"
                        size="small"
                        fullWidth />} />

                <Divider textAlign="left" >Words</Divider>

                {fields.map((f, i) => (<Grid key={f.id} container rowSpacing={2}>
                    <Grid item xs={12}>
                        <Controller name={`words.${i}.value`}
                            control={control}
                            render={({ field }) => <TraditionalChangeTextField {...field}
                                size="small"
                                label="Word"
                                fullWidth
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