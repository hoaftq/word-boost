import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, ToggleButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import { ChangeEvent, useEffect, useId, useState } from "react";
import { AllWords } from "@wb/components/learning/all-words";
import { FlashCard } from "@wb/components/learning/flashcard/flashcard";
import { Sentence } from "@wb/pages/add-word"; // TODO
import { WordTest } from "./testing/word-test";
import { Sentences } from "./learning/sentences";
import { FillBlankTest } from "./testing/fill-blank-test";
import { WritingSentences } from "./learning/writing-sentences";
import { GroupOptions, MultipleGroupedSelect, MultipleSelect, SelectionType } from "./common/multiple-select";
import { AutoLesson } from "./learning/lesson/auto-lesson";
import { shuffleArray } from "@wb/utils/utils";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import QuizIcon from '@mui/icons-material/Quiz';
import { WritingParagraph } from "./learning/writing-paragraph";
import { WritingFromAudio } from "./learning/writing-from-audio";
import { ListeningToStories } from "./learning/listening-to-stories";
import { Logo } from "./common/logo";
import { TextMediaButton } from "./learning/flashcard/text-media-button";
import { WordCardMode } from "./learning/flashcard/word-card";

export interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
    imageUrl: string;
    videoUrl?: string;
    sentences: Sentence[]
}

interface LessonWords {
    words: Word[],
    lesson: AutoLesson
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
    WriteAParagraph = "Write a paragraph",
    WriteFromAnAudio = "Write from an audio",
    WordsTest = "Words test",
    FillBlankTest = "Fill-blank test",
    ListeningToStories = "Listening to stories"
}

export function Main() {
    const [unitAndCourses, setUnitAndCourses] = useState<UnitAndCourse[]>([]);
    const [groupOptions, setGroupOptions] = useState<GroupOptions[]>([]);

    const [mode, setMode] = useState<string>(LearningMode.OneWord);
    const [showAll, setShowAll] = useState(false);
    const [isRandomOrder, setIsRandomeOrder] = useState(false);
    const [wordCardMode, setWordCardMode] = useState<WordCardMode>("show_word");

    const [words, setWords] = useState([] as Word[]);

    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();

    const [testIndex, setTestIndex] = useState(0);
    const modeId = useId();
    const [paragraphScrollSpeed, setParagraphScrollSpeed] = useState<number | null>(2);

    const theme = useTheme();
    const useFullLogo = useMediaQuery(theme.breakpoints.up("md"));

    const allCourses = unitAndCourses
        .map(uc => uc.course)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    useEffect(() => {
        blockingFetch('units-and-courses')
            .then(rsp => rsp.json())
            .then((unitAndCourses: UnitAndCourse[]) => { setUnitAndCourses(unitAndCourses); })
    }, [blockingFetch]);


    const handleCourseCloseWithChanges = (courses: string[]) => {
        const groupOptions = unitAndCourses.filter(uc => courses.some(c => c === uc.course))
            .sort((uc1, uc2) => uc1.course.localeCompare(uc2.course) || uc1.unit.localeCompare(uc2.unit))
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
        // FIXME
        // setWords([]);
    }

    const handleUnitCloseWithChanges = (units: SelectionType[]) => {
        if (!units.length) {
            setWords([]);
            return;
        }

        blockingFetch('words-by-units',
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

    const handleShowAllChange = (_: React.MouseEvent<HTMLElement>, value: any) => {
        setShowAll(!showAll);
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

    const handleSpeedChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let newSpeed: number | null = parseFloat(event.target.value);
        if (isNaN(newSpeed) || newSpeed < 0) {
            newSpeed = null;
        }

        setParagraphScrollSpeed(newSpeed);
    }

    return (
        <>
            <Stack direction={"row"} gap={1}>
                <Box display={{ "xs": "none", "sm": "block" }}>
                    <Logo full={useFullLogo} />
                </Box>
                <Grid container spacing={2} alignItems={"center"}>
                    <Grid item xs={6} md={3}>
                        <MultipleSelect label="Course"
                            options={allCourses}
                            onCloseWithChanges={handleCourseCloseWithChanges} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <MultipleGroupedSelect label="Unit"
                            groupOptions={groupOptions}
                            onCloseWithChanges={handleUnitCloseWithChanges}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <FormControl size="small" fullWidth>
                            <InputLabel id={modeId}>Mode</InputLabel>
                            <Select labelId={modeId}
                                value={mode}
                                label="Mode"
                                onChange={handleModeChange}>
                                <MenuItem value={LearningMode.OneWord}>Learn one word at a time</MenuItem>
                                <MenuItem value={LearningMode.AllWords}>Learn all words</MenuItem>
                                <MenuItem value={LearningMode.ReadSentences}>Read sentences</MenuItem>
                                <MenuItem value={LearningMode.WriteSentences}>Write sentences</MenuItem>
                                <MenuItem value={LearningMode.WriteAParagraph}>Write a paragraph</MenuItem>
                                <MenuItem value={LearningMode.WriteFromAnAudio}>Write from an audio</MenuItem>
                                <MenuItem value={LearningMode.WordsTest}>Test words</MenuItem>
                                <MenuItem value={LearningMode.FillBlankTest}>Fill in the blank</MenuItem>
                                <MenuItem value={LearningMode.ListeningToStories}>Listening to stories</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        {[LearningMode.WordsTest, LearningMode.WriteAParagraph, LearningMode.WriteFromAnAudio, LearningMode.ListeningToStories].indexOf(mode as LearningMode) < 0
                            && <Tooltip title="Random order (It can be toggled off if there are no words loaded, otherwise it will generate a new random)">
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
                        {mode === LearningMode.WriteAParagraph && <TextField
                            label="Speed"
                            type="number"
                            value={paragraphScrollSpeed}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 80 }}
                            onChange={handleSpeedChange}
                        />}
                        {mode === LearningMode.OneWord &&
                            <>
                                <TextMediaButton isText={wordCardMode === "show_word"}
                                    sx={{ marginLeft: 1 }}
                                    onClick={() => setWordCardMode(wordCardMode === "show_word" ? "show_media" : "show_word")} />
                                <Tooltip title="Show everything">
                                    <ToggleButton
                                        value="image"
                                        selected={showAll}
                                        color="secondary"
                                        size="small"
                                        sx={{ marginLeft: 1 }}
                                        onChange={handleShowAllChange}
                                    >
                                        <VisibilityIcon />
                                    </ToggleButton>
                                </Tooltip>
                            </>}
                    </Grid>
                </Grid>
            </Stack>

            {!!words.length && <div style={{ marginTop: 16 }}>
                {mode === LearningMode.AllWords && <AllWords words={words} />}
                {mode === LearningMode.OneWord && <FlashCard words={words} mode={wordCardMode} initialShowAll={showAll} />}
                {mode === LearningMode.ReadSentences && <Sentences words={words} />}
                {mode === LearningMode.WriteSentences && <WritingSentences words={words} />}
                {mode === LearningMode.WriteAParagraph && <WritingParagraph words={words} speed={paragraphScrollSpeed ?? 0} />}
                {mode === LearningMode.WordsTest && <WordTest key={testIndex} words={words} />}
                {mode === LearningMode.WriteFromAnAudio && <WritingFromAudio words={words} />}
                {mode === LearningMode.FillBlankTest && <FillBlankTest words={words} />}
                {mode === LearningMode.ListeningToStories && <ListeningToStories words={words} />}
            </div>}
            <FetchingBackdrop />
        </>
    );
}