import { Button, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { TracingLetter } from "./tracing-letter";
import { shuffleArray } from "@wb/utils/utils";
import { useState, useEffect, useRef } from "react";
import { CombinedSentence } from "../testing/fill-blank-test";
import { Word } from "../word-list";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";

const TimeForALetterInSeconds = 15;
const NumberOfExpectedSentences = 5;

export function TracingSentences({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [randomSentences, setRandomSentences] = useState<CombinedSentence[] | null>(null);
    const timerRef = useRef<ProgressTimerRef>(null);

    const theme = useTheme();
    const [expectedSentenceCount, setExpectedSentenceCount] = useState(0);

    if (!randomSentences) {
        const sentences = words.flatMap(w => w.sentences.map(s => ({
            sentence: s,
            words: [w]
        })));
        const randomSentences = shuffleArray(sentences);
        setRandomSentences(randomSentences);
    }

    const isLastSentence = () => sentenceIndex >= randomSentences!.length - 1;

    const moveToNextSentence = () => {
        if (isLastSentence()) {
            return;
        }

        setSentenceIndex(sentenceIndex + 1);
        timerRef.current!.resetTimer();
    }

    const restart = () => {
        setRandomSentences(null);
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

    const currentSentence = randomSentences?.[sentenceIndex].sentence.value;
    if (currentSentence) {
        const writingTime = currentSentence.length * TimeForALetterInSeconds * NumberOfExpectedSentences;
        return <>
            <Typography fontSize={50}>
                {currentSentence}
            </Typography>
            <TracingSentence sentence={currentSentence} />
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
                        {sentenceIndex + 1}/{randomSentences.length}
                    </span>
                    <Tooltip title="Restart">
                        <IconButton color="secondary"
                            onClick={restart}>
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>
                </div>

                {expectedSentenceCount === 0
                    ? <div>You might be writing</div>
                    : <div>
                        <span style={{
                            color: theme.palette.warning.main,
                            fontWeight: "bold",
                            fontSize: 30
                        }}>{expectedSentenceCount}</span> sentence(s) should be written already
                    </div>}

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

function TracingSentence({ sentence }: { sentence: string }) {
    return (
        <div>
            {sentence.split(" ").map((s, i) => (
                <div key={i} style={{ display: "inline-block" }}>
                    {s.split("").map((l, j) => <TracingLetter key={j}
                        letter={l}
                        previousLetter={j > 0 ? s.charAt(j - 1) : undefined}
                        hasColor={j % 2 === 0} />)}
                    <TracingLetter letter=" " hasColor={false} />
                </div>))
            }
        </div>
    )
}