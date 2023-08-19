import { useCallback, useMemo } from "react";
import { FullBingTranslate } from "../common/bing-translate-reader";
import { Word } from "../main";
import { combineSentences } from "@wb/utils/utils";
import { Controller, useForm } from "react-hook-form";
import { Stack, TextField } from "@mui/material";
import { CombinedSentence } from "../testing/fill-blank-test";

export function ListeningToStories({ words }: { words: Word[] }) {
    const combinedSentences = useMemo(() => combineSentences(words), [words]);

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

    const allSentences = useMemo(() => mapAll(), [mapAll]);

    return (
        <Stack direction={{ xs: "column", md: "row" }} gap={{ xs: 3, md: 3 }}>
            <FullBingTranslate text={allSentences} />
            <Stack direction={{ xs: "row", md: "column" }} spacing={3} marginBottom={3}>
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
            </Stack>
        </Stack>
    );
}
