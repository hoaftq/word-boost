import { Badge, Button, Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { useEffect, useState } from "react";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
}

export function WordList() {
    const { publicRuntimeConfig: { apiUrl } } = getConfig();

    const [units, setUnits] = useState([] as string[]);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [words, setWords] = useState([] as Word[]);
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    const DISPLAY_ALL_WORDS = "0";
    const DISPLAY_ONE_WORD = "1";
    const [displayMode, setDisplayMode] = useState(DISPLAY_ALL_WORDS);

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

    return (
        <>
            <FormControl sx={{ minWidth: 200, marginBottom: 5, marginRight: 5 }} size="small">
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
            <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel id="displayMode">Display mode</InputLabel>
                <Select labelId="displayMode"
                    value={displayMode}
                    label="Display mode"
                    onChange={handleDisplayModeChange}>
                    <MenuItem value={DISPLAY_ALL_WORDS}>All words</MenuItem>
                    <MenuItem value={DISPLAY_ONE_WORD}>One word at a time</MenuItem>
                </Select>
            </FormControl>

            {displayMode == DISPLAY_ALL_WORDS && !!words.length && <AllWords words={words} />}
            {displayMode == DISPLAY_ONE_WORD && !!words.length && <OneWord words={words} />}

            <FetchingBackdrop />
        </>
    );
}

function AllWords({ words }: { words: Word[] }) {
    return (
        <Stack direction={"row"} spacing={5} flexWrap={"wrap"}>
            {words.map((w, i) => (
                <Chip key={w.id}
                    label={`${i + 1}. ${w.value}`}
                    clickable
                    sx={{ marginBottom: 5 }}
                />
            ))}
        </Stack>
    );
}

function OneWord({ words }: { words: Word[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const isFirstWord = currentIndex == 0;
    const isLastWord = currentIndex == words.length - 1;
    const currentWord = words[currentIndex];

    const handleNext = () => {
        if (isLastWord) {
            return;
        }

        setCurrentIndex(currentIndex + 1);
    }

    const handlePrevious = () => {
        if (isFirstWord) {
            return;
        }

        setCurrentIndex(currentIndex - 1);
    }

    useEffect(() => {
        setCurrentIndex(0);
    }, [words]);

    return (
        <Stack direction={"column"} alignItems={"center"}>
            <Chip key={currentWord?.id}
                label={currentWord?.value}
                clickable
                sx={{ marginBottom: 5 }}
            />
            <div style={{ marginBottom: 10, fontWeight: 'bold' }}>{currentIndex + 1}/{words.length}
            </div>
            <div>
                <Button onClick={handlePrevious}
                    variant="contained"
                    disabled={isFirstWord}
                    sx={{ marginRight: 5 }}
                    startIcon={<SkipPreviousIcon />}
                >Previous</Button>
                <Button onClick={handleNext}
                    variant="contained"
                    disabled={isLastWord}
                    endIcon={<SkipNextIcon />}
                >Next</Button>
            </div>
        </Stack>
    );
}