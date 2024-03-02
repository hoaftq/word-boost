import { Button, Divider, Grid, IconButton, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { useSnackbar } from "notistack";
import { FocusEvent, useState } from "react";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { UrlEditingYouTubePlayer } from "@wb/components/common/url-editing-youtube-player";

export interface Sentence {
    value: string;
    mediaUrl: string;
}

interface WordForm {
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
    videoUrl: string;
    sentences: Sentence[]
}

export default function AddWord() {
    const { control, formState: { errors }, handleSubmit, resetField, setFocus, setValue } = useForm({
        defaultValues: {
            value: '',
            unit: '',
            course: '',
            imageUrl: '',
            videoUrl: '',
            sentences: [{
                value: '',
                mediaUrl: ''
            }]
        } as WordForm
    });
    const { fields, append, remove } = useFieldArray({ control, name: "sentences" })
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();
    const { enqueueSnackbar } = useSnackbar();
    const [rangeIndex, setRangeIndex] = useState(0);

    const onSubmit = (data: WordForm) => {
        blockingFetch('add', {
            method: "post",
            body: JSON.stringify({
                value: data.value?.trim(),
                unit: data.unit?.trim(),
                course: data.course?.trim(),
                imageUrl: data.imageUrl?.trim(),
                videoUrl: data.videoUrl,
                sentences: data.sentences
            })
        })
            .then(resp => resp.text())
            .then((wordId: string) => {
                enqueueSnackbar(`Added a new word with id of ${wordId}`, { variant: 'success' });
                resetField("value");
                resetField("imageUrl");
                setRangeIndex(rangeIndex + 1);

                // For flashcard that might have a lot of words without sentences
                if (data.sentences.length == 0) {
                    setValue("sentences", []);
                } else {
                    resetField("sentences");
                }
                setFocus("value");
            });
    }

    const handleWordChange = (e: FocusEvent<HTMLInputElement>) => {
        const word = e.target.value?.trim();
        if (word) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(word)}&tbm=isch`, "word_boost_search");
        }
    }

    const handleRemoveSentenceClick = (index: number) => {
        remove(index);
    }

    const handleAddSentenceClick = () => {
        append({
            value: "",
            mediaUrl: ""
        });
    }

    const handleSentenceChange = (e: FocusEvent<HTMLInputElement>) => {
        const word = e.target.value?.trim();
        if (word) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(word)}`, "word_boost_search");
        }
    }

    return (
        <>
            <Typography variant="h5" mb={3}>Add a new word</Typography>
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
                    <Controller name="value"
                        control={control}
                        rules={{ required: { value: true, message: 'Word is required.' } }}
                        render={({ field: { ref, ...field } }) => <TraditionalChangeTextField {...field}
                            inputRef={ref}
                            label="Word"
                            size="small"
                            required
                            error={!!errors?.value}
                            helperText={errors?.value?.message}
                            onTraditionalChange={handleWordChange}
                        />}
                    />
                    <Controller name="imageUrl"
                        control={control}
                        render={({ field }) => <TextField {...field}
                            label="Image Url"
                            size="small"
                        />}
                    />
                    <Controller name="videoUrl"
                        control={control}
                        render={({ field: { onChange } }) => <UrlEditingYouTubePlayer
                            onChange={onChange}
                            rangeIndex={rangeIndex} />}
                    />

                    <Divider textAlign="left" >Example sentences</Divider>

                    {fields.map((f, i) => (<Grid key={f.id} container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Controller name={`sentences.${i}.value`}
                                control={control}
                                rules={{ required: { value: true, message: "Sentence is required." } }}
                                render={({ field }) => <TraditionalChangeTextField {...field}
                                    size="small"
                                    label="Sentence"
                                    fullWidth
                                    required
                                    error={!!errors?.value}
                                    helperText={errors?.value?.message}
                                    onTraditionalChange={handleSentenceChange} />}
                            />
                        </Grid>
                        <Grid item xs>
                            <Controller name={`sentences.${i}.mediaUrl`}
                                control={control}
                                render={({ field }) => <TextField {...field}
                                    size="small"
                                    label="Demo Media Url"
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
            </form>
            <FetchingBackdrop />
        </>
    )
}

type TraditionalChangeTextFieldProps = TextFieldProps & { onTraditionalChange: (e: FocusEvent<HTMLInputElement>) => void };

export function TraditionalChangeTextField(props: TraditionalChangeTextFieldProps) {
    const { defaultValue, onTraditionalChange } = props;

    const [prevValue, setPrevValue] = useState(defaultValue);

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const currentValue = e.target.value;
        if (prevValue !== currentValue) {
            onTraditionalChange(e);
            setPrevValue(currentValue);
        }
    }

    return <TextField {...props} onBlur={handleBlur} />
}