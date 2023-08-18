import { Paper, Stack } from "@mui/material";
import { Word } from "../main";
import { CombinedSentenceTypography } from "./sentence-typography";
import { combineSentences } from "@wb/utils/utils";
import { AudioPlayer } from "../common/sentence-audio-player";
import { useMemo, useState } from "react";
import { useSelectionTranslator } from "@wb/utils/use-selection-translator";
import { BingTranslateReader } from "../common/bing-translate-reader";

export function Sentences({ words }: { words: Word[] }) {
    const combinedSentences = useMemo(() => combineSentences(words), [words]);
    const [focusIndex, setFocusIndex] = useState(0);

    const { onMouseUpCapture, TranslatorPopover } = useSelectionTranslator();

    function handleClick(index: number): void {
        setFocusIndex(index);
    }

    return (
        <Paper elevation={3}
            sx={{ padding: 1 }}
            onMouseUpCapture={onMouseUpCapture}>
            {combinedSentences.map((s, i) => (
                <Stack key={s.sentence.value}
                    direction={"row"}
                    sx={{
                        alignItems: "center",
                        gap: 2,
                        paddingX: 1,
                        paddingY: 2.5,
                        backgroundColor: i % 2 === 0 ? "whitesmoke" : "white",
                        borderRadius: 2
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
                    {focusIndex === i && s.sentence.mediaUrl && <AudioPlayer videoUrl={s.sentence.mediaUrl} autoplay={false} />}
                    {focusIndex === i && <div>
                        <BingTranslateReader text={s.sentence.value} />
                    </div>}
                </Stack>)
            )}
            <TranslatorPopover />
        </Paper>
    );
}