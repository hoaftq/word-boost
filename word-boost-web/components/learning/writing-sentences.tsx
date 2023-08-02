import { Button, IconButton, Tooltip, useTheme } from "@mui/material";
import { combineSentences } from "@wb/utils/utils";
import { useState, useEffect, useRef } from "react";
import { CombinedSentence } from "../testing/fill-blank-test";
import { Word } from "../main";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";
import { TimeForALetterInSeconds, WritingSentenceWithOrigin } from "./writing-sentence";

const NumberOfExpectedSentences = 5;

export function WritingSentences({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [combinedSentences, setCombinedSentences] = useState<CombinedSentence[] | null>(null);
    const timerRef = useRef<ProgressTimerRef>(null);

    const theme = useTheme();
    const [expectedSentenceCount, setExpectedSentenceCount] = useState(0);

    if (!combinedSentences) {
        setCombinedSentences(combineSentences(words));
    }

    const isLastSentence = () => sentenceIndex >= combinedSentences!.length - 1;

    const moveToNextSentence = () => {
        if (isLastSentence()) {
            return;
        }

        setSentenceIndex(sentenceIndex + 1);
        timerRef.current!.resetTimer();
    }

    const restart = () => {
        setCombinedSentences(null);
        setSentenceIndex(0);
        timerRef.current!.resetTimer();
    }

    const handleTimeup = () => {
        moveToNextSentence();
    }

    const handleTicking = (currentValue: number, maxValue: number) => {
        setExpectedSentenceCount(Math.round((1 - currentValue / maxValue) * NumberOfExpectedSentences));
    }

    useEffect(() => {
        restart();
    }, [words]);

    const currentSentence = combinedSentences?.[sentenceIndex].sentence.value;
    if (currentSentence) {
        const writingTime = currentSentence.length * TimeForALetterInSeconds * NumberOfExpectedSentences;
        return <>
            <WritingSentenceWithOrigin sentence={currentSentence} />
            <div style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end"
            }}>
                <div>
                    <Button variant="outlined"
                        sx={{ marginRight: 1 }}
                        startIcon={<ArrowRightIcon />}
                        color="secondary"
                        disabled={isLastSentence()}
                        onClick={moveToNextSentence}>
                        Next
                    </Button>
                    <span style={{
                        fontWeight: "bold",
                        marginRight: 6
                    }}>
                        {sentenceIndex + 1}/{combinedSentences.length}
                    </span>
                    <Tooltip title="Restart">
                        <IconButton color="secondary"
                            onClick={restart}>
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>
                </div>

                <div style={{ color: theme.palette.warning.main }}>
                    {expectedSentenceCount === 0
                        ? <>You might be writing now</>
                        : <><span style={{
                            fontWeight: "bold",
                            fontSize: 30
                        }}>{expectedSentenceCount}</span> sentence(s) should be written already</>}
                </div>

                <ProgressTimer ref={timerRef}
                    key={currentSentence}
                    mode="minutes"
                    maxValue={writingTime}
                    onTimeup={handleTimeup}
                    onTicking={handleTicking} />
            </div>
        </>;
    }

    return null;
}