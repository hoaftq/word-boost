import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Switch } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { ChangeEvent, useEffect, useState } from "react";
import { AllWords } from "@wb/components/all-words";
import { OneWord } from "@wb/components/one-word";

export interface Word {
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

    const DISPLAY_ONE_WORD = "0";
    const DISPLAY_ALL_WORDS = "1";
    const [displayMode, setDisplayMode] = useState(DISPLAY_ONE_WORD);

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
                    <MenuItem value={DISPLAY_ONE_WORD}>One word at a time</MenuItem>
                    <MenuItem value={DISPLAY_ALL_WORDS}>All words</MenuItem>
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