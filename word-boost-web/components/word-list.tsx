import { Box, Button, Chip, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Switch } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Image from "next/image";

interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
}

export function WordList() {
    const { publicRuntimeConfig: { apiUrl } } = getConfig();

    const [units, setUnits] = useState([] as string[]);
    const [selectedUnit, setSelectedUnit] = useState('');

    const DISPLAY_ALL_WORDS = "0";
    const DISPLAY_ONE_WORD = "1";
    const [displayMode, setDisplayMode] = useState(DISPLAY_ALL_WORDS);

    const [imageVisible, setImageVisible] = useState(false);

    const [words, setWords] = useState([] as Word[]);

    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    useEffect(() => {
        blockingFetch(`${apiUrl}/units`)
            .then(rsp => rsp.json())
            .then((units: string[]) => { setUnits(units); })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUnitChange = (e: SelectChangeEvent) => {
        const unit = e.target.value;
        setSelectedUnit(unit);

        blockingFetch(`${apiUrl}/words?unit=${unit}`)
            .then((rsp: Response) => rsp.json())
            .then((words: Word[]) => { setWords(words); });
    }

    const handleDisplayModeChange = (e: SelectChangeEvent) => {
        setDisplayMode(e.target.value);
    }

    const handleImageVisibleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setImageVisible(checked);
    }

    return (
        <>
            <FormControl sx={{ minWidth: 150, marginRight: 3, marginTop: 2 }} size="small">
                <InputLabel id="unit">Unit</InputLabel>
                <Select labelId="unit"
                    value={selectedUnit}
                    size="small"
                    label="Unit"
                    onChange={handleUnitChange}
                >
                    {units.map(u => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}

                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200, marginRight: 3, marginTop: 2 }} size="small">
                <InputLabel id="displayMode">Display mode</InputLabel>
                <Select labelId="displayMode"
                    value={displayMode}
                    label="Display mode"
                    onChange={handleDisplayModeChange}>
                    <MenuItem value={DISPLAY_ALL_WORDS}>All words</MenuItem>
                    <MenuItem value={DISPLAY_ONE_WORD}>One word at a time</MenuItem>
                </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={imageVisible} onChange={handleImageVisibleChange} />}
                label="Show image"
                sx={{ marginTop: 2 }}
                disabled={displayMode !== DISPLAY_ONE_WORD} />

            <div style={{ marginTop: 16 }}>
                {displayMode === DISPLAY_ALL_WORDS && !!words.length && <AllWords words={words} />}
                {displayMode === DISPLAY_ONE_WORD && !!words.length && <OneWord words={words} initialImageVisible={imageVisible} />}
            </div>

            <FetchingBackdrop />
        </>
    );
}

function AllWords({ words }: { words: Word[] }) {
    return (
        <Stack direction={"row"} flexWrap={"wrap"}>
            {words.map((w, i) => (
                <Box key={w.id} padding={2}>
                    <Chip label={`${i + 1}. ${w.value}`}
                        clickable
                        sx={{ fontSize: 30, p: 4 }}
                        color="primary"
                    />
                </Box>
            ))}
        </Stack>
    );
}

function OneWord({ words, initialImageVisible }: { words: Word[], initialImageVisible: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageVisible, setImageVisible] = useState(initialImageVisible);

    const isFirstWord = currentIndex == 0;
    const isLastWord = currentIndex == words.length - 1;
    const currentWord = words[currentIndex];

    const handleNext = () => {
        if (isLastWord) {
            return;
        }

        updateCurrentIndex(currentIndex + 1);
    }

    const handlePrevious = () => {
        if (isFirstWord) {
            return;
        }

        updateCurrentIndex(currentIndex - 1);
    }

    const handleWordClick = () => {
        setImageVisible(!imageVisible);
    }

    const updateCurrentIndex = useCallback((index: number) => {
        setCurrentIndex(index);
        setImageVisible(initialImageVisible);
    }, [initialImageVisible]);

    useEffect(() => {
        updateCurrentIndex(0);
    }, [updateCurrentIndex, words]);

    return (
        <Stack direction={"column"} alignItems={"center"}>
            <div style={{ width: "100%", height: 300, position: "relative" }}>
                {imageVisible && <Image src={currentWord?.imageUrl ?? ""}
                    alt=""
                    style={{ objectFit: 'contain' }}
                    fill={true}
                />}
            </div>
            <Chip key={currentWord?.id}
                label={currentWord?.value}
                clickable
                color="primary"
                sx={{ marginTop: 1, marginBottom: 3, fontSize: 30, p: 3 }}
                onClick={handleWordClick}
            />
            <div style={{ marginBottom: 10, fontWeight: 'bold' }}>{currentIndex + 1}/{words.length}
            </div>
            <div>
                <Button onClick={handlePrevious}
                    variant="outlined"
                    disabled={isFirstWord}
                    sx={{ marginRight: 5 }}
                    startIcon={<SkipPreviousIcon />}
                    color="secondary"
                >Prev</Button>
                <Button onClick={handleNext}
                    variant="outlined"
                    disabled={isLastWord}
                    endIcon={<SkipNextIcon />}
                    color="secondary"
                >Next</Button>
            </div>
        </Stack>
    );
}