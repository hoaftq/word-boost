import { Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, Switch } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { ChangeEvent, useEffect, useState } from "react";
import { AllWords } from "@wb/components/learning/all-words";
import { OneWord } from "@wb/components/learning/one-word";
import { Sentence } from "@wb/pages/add-word"; // TODO
import { WordTest } from "./testing/word-test";
import { Sentences } from "./learning/sentences";
import { FillBlankTest } from "./testing/fill-blank-test";
import { TracingSentences } from "./learning/tracing-sentences";
import { TracingLetter } from "./learning/tracing-letter";

export interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
    sentences: Sentence[]
}

const MODE_LEARN_ONE_WORD = "0";
const MODE_LEARN_ALL_WORDS = "1";
const MODE_READ_SENTENCES = "2";
const MODE_WRITE_SENTENCES = "3";
const MODE_WORDS_TEST = "4";
const MODE_FILLBLANK_TEST = "5";

export function WordList() {
    const { publicRuntimeConfig: { apiUrl } } = getConfig();

    const [units, setUnits] = useState([] as string[]);
    const [selectedUnit, setSelectedUnit] = useState('');

    const [mode, setMode] = useState(MODE_LEARN_ONE_WORD);

    const [imageVisible, setImageVisible] = useState(false);

    const [words, setWords] = useState([] as Word[]);

    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    const [testComponentKey, setTestComponentKey] = useState(0);

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

    const handleModeChange = (e: SelectChangeEvent) => {
        setMode(e.target.value);
    }

    const handleImageVisibleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setImageVisible(checked);
    }

    const handleNewTestClick = () => {
        setTestComponentKey(testComponentKey + 1);
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
                    {units.map(u => (<MenuItem key={u} value={u}>{u}</MenuItem>))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 230, marginRight: 3, marginTop: 2 }} size="small">
                <InputLabel id="mode">Mode</InputLabel>
                <Select labelId="mode"
                    value={mode}
                    label="Mode"
                    onChange={handleModeChange}>
                    <MenuItem value={MODE_LEARN_ONE_WORD}>Learn one word at a time</MenuItem>
                    <MenuItem value={MODE_LEARN_ALL_WORDS}>Learn all words</MenuItem>
                    <MenuItem value={MODE_READ_SENTENCES}>Read sentences</MenuItem>
                    <MenuItem value={MODE_WRITE_SENTENCES}>Write sentences</MenuItem>
                    <MenuItem value={MODE_WORDS_TEST}>Test</MenuItem>
                    <MenuItem value={MODE_FILLBLANK_TEST}>Fill in the blank</MenuItem>
                </Select>
            </FormControl>

            {mode === MODE_LEARN_ONE_WORD && <FormControlLabel
                control={<Switch checked={imageVisible} onChange={handleImageVisibleChange} />}
                label="Always show image"
                sx={{ marginTop: 2 }} />}

            {mode == MODE_WORDS_TEST && <Button sx={{ marginTop: 2 }}
                variant="outlined"
                color="secondary"
                onClick={handleNewTestClick}>New test</Button>}

            <div style={{ marginTop: 16 }}>
                {mode === MODE_LEARN_ALL_WORDS && !!words.length && <AllWords words={words} />}
                {mode === MODE_LEARN_ONE_WORD && !!words.length && <OneWord words={words} initialImageVisible={imageVisible} />}
                {mode === MODE_READ_SENTENCES && !!words.length && <Sentences words={words} />}
                {mode === MODE_WRITE_SENTENCES && !!words.length && <TracingSentences words={words} />}
                {mode == MODE_WORDS_TEST && selectedUnit && <WordTest unit={selectedUnit} key={`${selectedUnit}_${testComponentKey}`} />}
                {mode == MODE_FILLBLANK_TEST && selectedUnit && <FillBlankTest words={words} />}
            </div>
            <FetchingBackdrop />
        </>
    );
}