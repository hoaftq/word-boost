import { Button, Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import getConfig from "next/config";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { useSnackbar } from "notistack";
import { ChangeEvent, FocusEvent, useState } from "react";

interface WordForm {
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
}

export default function AddWord() {
    const { control, formState: { errors }, handleSubmit, resetField, setFocus } = useForm({
        defaultValues: {
            value: '',
            unit: '',
            course: '',
            imageUrl: ''
        } as WordForm
    });
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
                imageUrl: data.imageUrl?.trim()
            })
        })
            .then(resp => resp.text())
            .then((wordId: string) => {
                enqueueSnackbar(`Added a new word with id of ${wordId}`, { variant: 'success' });
                resetField("value");
                resetField("imageUrl");
                setFocus("value");
            });
    }

    const handleTraditionalChange = (event: FocusEvent<HTMLInputElement>) => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(event.target.value?.trim())}&tbm=isch`,
            "word_boost_search_image",
            "popup");
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
                            onTraditionalChange={handleTraditionalChange}
                        />}
                    />
                    <Controller name="imageUrl"
                        control={control}
                        render={({ field }) => <TextField {...field}
                            label="Image Url"
                            size="small"
                        />}
                    />
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

type TraditionalChangeTextFieldProps = TextFieldProps & { onTraditionalChange: (event: FocusEvent<HTMLInputElement>) => void };

function TraditionalChangeTextField(props: TraditionalChangeTextFieldProps) {
    const { defaultValue, onTraditionalChange } = props;

    const [prevValue, setPrevValue] = useState(defaultValue);
    const [value, setValue] = useState(defaultValue);

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (prevValue !== value) {
            onTraditionalChange(event);
            setPrevValue(value);
        }
    }

    return <TextField {...props}
        value={value}
        onBlur={handleBlur}
        onChange={(event) => setValue(event.target.value)}
    />

}