import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, ToggleButton, Tooltip } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { useEffect, useId, useState } from "react";
import { AllWords } from "@wb/components/learning/all-words";
import { OneWord } from "@wb/components/learning/one-word";
import { Sentence } from "@wb/pages/add-word"; // TODO
import { WordTest } from "./testing/word-test";
import { Sentences } from "./learning/sentences";
import { FillBlankTest } from "./testing/fill-blank-test";
import { TracingSentences } from "./learning/tracing-sentences";
import { GroupOptions, MultipleGroupedSelect, MultipleSelect, SelectionType } from "./multiple-select";
import { Lesson } from "./learning/lesson";
import { shuffleArray } from "@wb/utils/utils";
import ImageIcon from '@mui/icons-material/Image';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import QuizIcon from '@mui/icons-material/Quiz';

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

enum LearningMode {
    OneWord = "One word",
    AllWords = "All words",
    ReadSentences = "Read sentences",
    WriteSentences = "Write sentences",
    WordsTest = "Words test",
    FillBlankTest = "Fill-blank test"
}

const { publicRuntimeConfig: { apiUrl } } = getConfig();

export function Main() {
    const [unitAndCourses, setUnitAndCourses] = useState<UnitAndCourse[]>([]);
    const [groupOptions, setGroupOptions] = useState<GroupOptions[]>([]);

    const [mode, setMode] = useState<string>(LearningMode.OneWord);
    const [imageVisible, setImageVisible] = useState(false);
    const [isRandomOrder, setIsRandomeOrder] = useState(false);

    const [words, setWords] = useState([] as Word[]);

    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    const [testIndex, setTestIndex] = useState(0);
    const modeId = useId();

    const allCourses = unitAndCourses
        .map(uc => uc.course)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    useEffect(() => {
        blockingFetch(`${apiUrl}/units-and-courses`)
            .then(rsp => rsp.json())
            .then((unitAndCourses: UnitAndCourse[]) => { setUnitAndCourses(unitAndCourses); })
    }, [blockingFetch]);


    const handleCourseCloseWithChanges = (courses: string[]) => {
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
        setWords([]);
    }

    const handleUnitCloseWithChanges = (units: SelectionType[]) => {
        if (!units.length) {
            return;
        }

        blockingFetch(`${apiUrl}/words-by-units`,
            {
                method: "post",
                body: JSON.stringify(units.map(uc => ({ course: uc.group, unit: uc.option })))
            })
            .then((rsp: Response) => rsp.json())
            .then((lessonWords: LessonWords) => { setWords(isRandomOrder ? shuffleArray(lessonWords.words) : lessonWords.words); });
    }

    const handleModeChange = (e: SelectChangeEvent) => {
        setMode(e.target.value);
    }

    const handleImageVisibleChange = (_: React.MouseEvent<HTMLElement>, value: any) => {
        setImageVisible(!imageVisible);
    }

    const handleRandomOrderChange = (_: React.MouseEvent<HTMLElement>, value: any) => {
        if (words.length === 0) {
            setIsRandomeOrder(!isRandomOrder);
            return;
        }

        if (!isRandomOrder) {
            setIsRandomeOrder(true);
        }

        setWords(shuffleArray(words));
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
                        onCloseWithChanges={handleCourseCloseWithChanges} />
                </Grid>
                <Grid item xs={3}>
                    <MultipleGroupedSelect label="Unit"
                        groupOptions={groupOptions}
                        onCloseWithChanges={handleUnitCloseWithChanges}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl size="small" sx={{ minWidth: 230 }}>
                        <InputLabel id={modeId}>Mode</InputLabel>
                        <Select labelId={modeId}
                            value={mode}
                            label="Mode"
                            onChange={handleModeChange}>
                            <MenuItem value={LearningMode.OneWord}>Learn one word at a time</MenuItem>
                            <MenuItem value={LearningMode.AllWords}>Learn all words</MenuItem>
                            <MenuItem value={LearningMode.ReadSentences}>Read sentences</MenuItem>
                            <MenuItem value={LearningMode.WriteSentences}>Write sentences</MenuItem>
                            <MenuItem value={LearningMode.WordsTest}>Test</MenuItem>
                            <MenuItem value={LearningMode.FillBlankTest}>Fill in the blank</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    {mode === LearningMode.OneWord
                        && <Tooltip title="Show images for next words">
                            <ToggleButton
                                value="image"
                                selected={imageVisible}
                                color="secondary"
                                size="small"
                                sx={{ marginRight: 1 }}
                                onChange={handleImageVisibleChange}
                            >
                                <ImageIcon />
                            </ToggleButton>
                        </Tooltip>}
                    {mode !== LearningMode.WordsTest
                        && <Tooltip title="Random order">
                            <ToggleButton value="random"
                                selected={isRandomOrder}
                                color="secondary"
                                size="small"
                                onChange={handleRandomOrderChange}>
                                <ShuffleIcon />
                            </ToggleButton>
                        </Tooltip>}
                    {mode === LearningMode.WordsTest && <Button variant="outlined"
                        color="secondary"
                        startIcon={<QuizIcon />}
                        onClick={handleNewTestClick}>New test</Button>}
                </Grid>
            </Grid>
            {!!words.length && <div style={{ marginTop: 16 }}>
                {mode === LearningMode.AllWords && <AllWords words={words} />}
                {mode === LearningMode.OneWord && <OneWord words={words} initialImageVisible={imageVisible} />}
                {mode === LearningMode.ReadSentences && <Sentences words={words} />}
                {mode === LearningMode.WriteSentences && <TracingSentences words={words} />}
                {mode === LearningMode.WordsTest && <WordTest key={testIndex} words={words} />}
                {mode === LearningMode.FillBlankTest && <FillBlankTest words={words} />}
            </div>}
            <FetchingBackdrop />
        </>
    );
}