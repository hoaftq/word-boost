import { Button, Divider, Grid, IconButton, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import getConfig from "next/config";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { useSnackbar } from "notistack";
import { FocusEvent, useState } from "react";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export interface Sentence {
    value: string;
    mediaUrl: string;
}

interface WordForm {
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
    sentences: Sentence[]
}

export default function AddWord() {
    const { control, formState: { errors }, handleSubmit, resetField, setFocus } = useForm({
        defaultValues: {
            value: '',
            unit: '',
            course: '',
            imageUrl: '',
            sentences: [{
                value: '',
                mediaUrl: ''
            }]
        } as WordForm
    });
    const { fields, append, remove } = useFieldArray({ control, name: "sentences" })
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();
    const { enqueueSnackbar } = useSnackbar();

    const onSubmit = (data: WordForm) => {
        const { publicRuntimeConfig: { apiUrl } } = getConfig();
        blockingFetch(`${apiUrl}/add`, {
            method: "post",
            body: JSON.stringify({
                value: data.value?.trim(),
                unit: data.unit?.trim(),
                course: data.course?.trim(),
                imageUrl: data.imageUrl?.trim(),
                sentences: data.sentences
            })
        })
            .then(resp => resp.text())
            .then((wordId: string) => {
                enqueueSnackbar(`Added a new word with id of ${wordId}`, { variant: 'success' });
                resetField("value");
                resetField("imageUrl");
                resetField("sentences");
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

                    <Divider textAlign="left" >Example sentences</Divider>

                    {fields.map((f, i) => (<Grid key={f.id} container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Controller name={`sentences.${i}.value`}
                                control={control}
                                render={({ field }) => <TraditionalChangeTextField {...field}
                                    size="small"
                                    label="Sentence"
                                    fullWidth
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