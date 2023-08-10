import { Paper, Stack } from "@mui/material";
import { Word } from "../main";
import { CombinedSentenceTypography } from "./sentence-typography";
import { combineSentences } from "@wb/utils/utils";
import { AudioPlayer } from "../common/sentence-audio-player";
import { useMemo, useState } from "react";

export function Sentences({ words }: { words: Word[] }) {
    const combinedSentences = useMemo(() => combineSentences(words), [words]);
    const [focusIndex, setFocusIndex] = useState(0);

    function handleClick(index: number): void {
        setFocusIndex(index);
    }

    return (
        <Paper elevation={3}
            sx={{
                padding: 1
            }}>
            {combinedSentences.map((s, i) => (
                <Stack key={s.sentence.value}
                    direction={"row"}
                    sx={{
                        alignItems: "center",
                        gap: 2,
                        marginX: 1,
                        marginY: 2
                    }}>
                    <CombinedSentenceTypography
                        combinedSentence={s}
                        variant="h4"
                        component="div"
                        color="primary"
                        fontSize={50}
                        fontWeight="bold"
                        onClick={() => handleClick(i)}
                    />
                    {focusIndex === i && <AudioPlayer videoUrl={s.sentence.mediaUrl} autoplay={false} />}
                </Stack>)
            )}
        </Paper>
    );
}