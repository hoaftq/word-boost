import { useCallback, useMemo, MouseEvent, useState, useEffect } from "react";
import { BingTranslateReader, FullBingTranslate } from "../common/bing-translate-reader";
import { Word } from "../main";
import { combineSentences } from "@wb/utils/utils";
import { Controller, useForm } from "react-hook-form";
import { Box, IconButton, Link, Stack, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { CombinedSentence } from "../testing/fill-blank-test";
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { Navigator } from "../common/navigator";

export function ListeningToStories({ words }: { words: Word[] }) {
    const combinedSentences = useMemo(() => combineSentences(words), [words]);
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box>
            <Tabs value={tabIndex} sx={{ marginBottom: 3 }} onChange={(e, newIndex) => setTabIndex(newIndex)}>
                <Tab label="Whole stories" />
                <Tab label="Each sentence" />
            </Tabs>
            {tabIndex === 0 && <ListenToTheWhole combinedSentences={combinedSentences} />}
            {tabIndex === 1 && <ListenToEachSentence combinedSentences={combinedSentences} />}
        </Box>
    );
}

export function ListenToTheWhole({ combinedSentences }: { combinedSentences: CombinedSentence[] }) {

    const { control, watch } = useForm({
        defaultValues: {
            sentenceRepeat: "1",
            storyRepeat: "1",
            allRepeat: "1"
        }
    });

    const values = watch();

    const mapAll = useCallback(function mapAll() {
        const storyMap = new Map<string, CombinedSentence[]>();
        for (const sentence of combinedSentences) {
            const word = sentence.words[0];
            const key = `${word.course}\n${word.unit}`;
            if (storyMap.has(key)) {
                storyMap.get(key)?.push(sentence);
            } else {
                storyMap.set(key, [sentence]);
            }
        }

        const allStoriesContent = Array.from(storyMap.values()).map(story => mapStory(story)).join("\n");
        return Array(parseRepeat(values.allRepeat)).fill(allStoriesContent).join("\n\n");

        function mapStory(story: CombinedSentence[]): string {
            const storyNameSentence = story.shift();
            const storyContent = story.map(sentence => mapSentence(sentence)).filter(s => s).join(". ");
            const storyContentWithName = `You are listening to story ${storyNameSentence?.sentence.value}. ${storyContent}`
            return Array(parseRepeat(values.storyRepeat)).fill(storyContentWithName).join("\n");
        }

        function mapSentence(sentence: CombinedSentence) {
            return Array(parseRepeat(values.sentenceRepeat)).fill(sentence.sentence.value).join(". ");
        }

        function parseRepeat(repeat: string) {
            const result = parseInt(repeat);
            if (Number.isNaN(result) || result < 0) {
                return 0;
            }

            return result;
        }
    }, [combinedSentences, values.allRepeat, values.sentenceRepeat, values.storyRepeat]);

    const allText = useMemo(() => mapAll(), [mapAll]);

    function handleCopyClick(event: MouseEvent<HTMLButtonElement>): void {
        navigator.clipboard.writeText(allText);
    }

    return (
        <Stack direction={{ xs: "column", md: "row" }} gap={{ xs: 3, md: 3 }}>
            <TextReader text={allText} />
            <Stack direction={{ xs: "row", md: "column" }}
                spacing={3}
                marginBottom={3}
                alignItems={"start"}>
                <Controller name="sentenceRepeat"
                    control={control}
                    render={({ field }) => <TextField {...field}
                        type="number"
                        label="Sentence"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ width: 80 }} />}
                />
                <Controller name="storyRepeat"
                    control={control}
                    render={({ field }) => <TextField {...field}
                        type="number"
                        label="Story"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ width: 80 }} />}
                />
                <Controller name="allRepeat"
                    control={control}
                    render={({ field }) => <TextField {...field}
                        type="number"
                        label="All"
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ width: 80 }} />}
                />
                <Tooltip title="Copy story text to clipboard">
                    <IconButton onClick={handleCopyClick}>
                        <CopyAllIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
}

function TextReader({ text }: { text: string }) {

    useEffect(() => {
        if (text.length > 5000) {
            navigator.clipboard.writeText(text);
        }
    }, [text]);

    if (text.length <= 1000) {
        return <div style={{ width: 300 }}>
            <Typography variant="subtitle1" color="gray">Press the speaker icon to read the text.</Typography>
            <FullBingTranslate text={text} />
        </div>;
    }

    if (text.length <= 5000) {
        return (<div style={{ width: 300 }}>
            <Typography variant="subtitle1" color="gray">
                Click the link below to open Google Translate with pre-filled text then press the speaker icon to read the text.
            </Typography>
            <Link href={`https://translate.google.com/?hl=en&sl=en&text=${encodeURIComponent(text)}`}
                target="_blank"
                variant="h6">Google Translate</Link>
        </div>
        );
    }

    return (<div style={{ width: 300 }}>
        <Typography variant="subtitle1" color="gray">
            Click the link below to open Natural Reader. Paste the text, which has already been copied to the clipboard, into it and press the play button to listen to.
        </Typography>
        <Link href="https://www.naturalreaders.com/online/"
            target="_blank"
            variant="h6">Natural Reader</Link>
    </div>
    );
}

function ListenToEachSentence({ combinedSentences }: { combinedSentences: CombinedSentence[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentSentence = combinedSentences[currentIndex].sentence.value;
    const nextSentence = currentIndex + 1 < combinedSentences.length ? combinedSentences[currentIndex + 1].sentence.value : null;

    return (
        <>
            <SentenceReader key={currentSentence} sentence={currentSentence} />
            {nextSentence && <SentenceReader key={nextSentence}
                sentence={nextSentence}
                onClick={() => setCurrentIndex(currentIndex + 1)} />}

            <Navigator index={currentIndex}
                total={combinedSentences.length}
                onNext={() => setCurrentIndex(currentIndex + 1)}
                onPrev={() => setCurrentIndex(currentIndex - 1)}
                onRestart={() => setCurrentIndex(0)} />
        </>
    )
}

function SentenceReader({ sentence, onClick }: { sentence: string, onClick?: () => void }) {
    return (
        <Stack key={sentence}
            direction={"row-reverse"}
            alignItems={"center"}
            gap={1}
            sx={{ marginBottom: 3 }}
        >
            <div style={{
                borderRadius: "50%",
                border: "2px solid #f5f5f5",
                minWidth: 80, width: 80,
                height: 80,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <BingTranslateReader text={sentence} onClick={onClick} />
            </div>
            <Typography variant="h6">{sentence}</Typography>
        </Stack>
    );
}