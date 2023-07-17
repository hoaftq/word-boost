import { Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Switch } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { ChangeEvent, useEffect, useId, useState } from "react";
import { AllWords } from "@wb/components/learning/all-words";
import { OneWord } from "@wb/components/learning/one-word";
import { Sentence } from "@wb/pages/add-word"; // TODO
import { WordTest } from "./testing/word-test";
import { Sentences } from "./learning/sentences";
import { FillBlankTest } from "./testing/fill-blank-test";
import { TracingSentences } from "./learning/tracing-sentences";
import { GroupOptions, MultipleGroupedSelect, MultipleSelect, SelectionType } from "./multiple-select";
import { Lesson } from "./learning/lesson";

export interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
    sentences: Sentence[]
}

interface LessonWords {
    words: Word[],
    lesson: Lesson
}

type UnitAndCourse = {
    unit: string;
    course: string;
}

const MODE_LEARN_ONE_WORD = "0";
const MODE_LEARN_ALL_WORDS = "1";
const MODE_READ_SENTENCES = "2";
const MODE_WRITE_SENTENCES = "3";
const MODE_WORDS_TEST = "4";
const MODE_FILLBLANK_TEST = "5";

const { publicRuntimeConfig: { apiUrl } } = getConfig();

export function WordList() {
    const [unitAndCourses, setUnitAndCourses] = useState<UnitAndCourse[]>([]);
    const [groupOptions, setGroupOptions] = useState<GroupOptions[]>([]);

    const [mode, setMode] = useState(MODE_LEARN_ONE_WORD);
    const [imageVisible, setImageVisible] = useState(false);

    const [words, setWords] = useState([] as Word[]);

    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    const [testIndex, setTestIndex] = useState(0);
    const optionsPrefix = useId();

    const allCourses = unitAndCourses
        .map(uc => uc.course)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    useEffect(() => {
        blockingFetch(`${apiUrl}/units-and-courses`)
            .then(rsp => rsp.json())
            .then((unitAndCourses: UnitAndCourse[]) => { setUnitAndCourses(unitAndCourses); })
    }, [blockingFetch]);


    const handleCourseChange = (courses: string[]) => {
        const groupOptions = unitAndCourses.filter(uc => courses.some(c => c === uc.course))
            .sort((uc1, uc2) => uc1.course.localeCompare(uc2.course))
            .reduce((prev, curr) => {
                const lastItem = prev.slice(-1)?.[0];
                if (lastItem && lastItem.group === curr.course) {
                    lastItem.options = [...lastItem.options, curr.unit];
                    return prev;
                }

                const newItem: GroupOptions = {
                    group: curr.course,
                    options: [curr.unit]
                }
                return [...prev, newItem];
            }, [] as GroupOptions[])
        setGroupOptions(groupOptions);
    }

    const handleUnitCloseWithChanges = (units: SelectionType[]) => {
        blockingFetch(`${apiUrl}/words-by-units`,
            {
                method: "post",
                body: JSON.stringify(units.map(uc => ({ course: uc.group, unit: uc.option })))
            })
            .then((rsp: Response) => rsp.json())
            .then((lessonWords: LessonWords) => { setWords(lessonWords.words); });
    }

    const handleModeChange = (e: SelectChangeEvent) => {
        setMode(e.target.value);
    }

    const handleImageVisibleChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setImageVisible(checked);
    }

    const handleNewTestClick = () => {
        setTestIndex(testIndex + 1);
    }

    return (
        <>
            <Grid container spacing={2} paddingTop={1}>
                <Grid item xs={3}>
                    <MultipleSelect label="Course"
                        options={allCourses}
                        onChange={handleCourseChange} />
                </Grid>
                <Grid item xs={3}>
                    <MultipleGroupedSelect label="Unit"
                        groupOptions={groupOptions}
                        onCloseWithChanges={handleUnitCloseWithChanges}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl size="small" sx={{ minWidth: 230 }}>
                        <InputLabel id={`${optionsPrefix}-mode`}>Mode</InputLabel>
                        <Select labelId={`${optionsPrefix}-mode`}
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
                </Grid>
                <Grid item xs={3}>
                    {mode === MODE_LEARN_ONE_WORD && <FormControlLabel
                        control={<Switch checked={imageVisible} onChange={handleImageVisibleChange} />}
                        label="Always show image" />}

                    {mode == MODE_WORDS_TEST && <Button variant="outlined"
                        color="secondary"
                        onClick={handleNewTestClick}>New test</Button>}
                </Grid>
            </Grid>
            <div style={{ marginTop: 16 }}>
                {mode === MODE_LEARN_ALL_WORDS && !!words.length && <AllWords words={words} />}
                {mode === MODE_LEARN_ONE_WORD && !!words.length && <OneWord words={words} initialImageVisible={imageVisible} />}
                {mode === MODE_READ_SENTENCES && !!words.length && <Sentences words={words} />}
                {mode === MODE_WRITE_SENTENCES && !!words.length && <TracingSentences words={words} />}
                {mode == MODE_WORDS_TEST && <WordTest key={testIndex} words={words} />}
                {mode == MODE_FILLBLANK_TEST && <FillBlankTest words={words} />}
            </div>
            <FetchingBackdrop />
        </>
    );
}