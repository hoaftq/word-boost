import { Button, IconButton, Typography } from "@mui/material";
import { TracingLetter } from "./tracing-letter";
import { shuffleArray } from "@wb/utils/utils";
import { useState, useEffect, useRef } from "react";
import { CombinedSentence } from "../testing/fill-blank-test";
import { Word } from "../word-list";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";

export function TracingSentences({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [randomSentences, setRandomSentences] = useState<CombinedSentence[] | null>(null);
    const timerRef = useRef<ProgressTimerRef>(null);

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

    useEffect(() => {
        restart();
    }, [words]);

    return randomSentences && randomSentences[sentenceIndex] &&
        <>
            <Typography fontSize={55}>
                {randomSentences[sentenceIndex].sentence.value}
            </Typography>
            <TracingSentence sentence={randomSentences[sentenceIndex].sentence.value} />
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
                    <IconButton color="secondary"
                        onClick={restart}>
                        <RestartAltIcon />
                    </IconButton>
                </div>
                <ProgressTimer ref={timerRef}
                    mode="minutes"
                    maxValue={20 * 60}
                    onTimeup={handleTimeup} />
            </div>
        </>;
}

function TracingSentence({ sentence }: { sentence: string }) {
    return (
        <div>
            {sentence.split(" ").map((s, i) => (
                <div key={i} style={{ display: "inline-block" }}>
                    {s.split("").map((l, j) => <TracingLetter key={j} letter={l} hasColor={j % 2 === 0} />)}
                    <TracingLetter letter=" " hasColor={false} />
                </div>))
            }
        </div>
    )
}