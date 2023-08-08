import { Stack, useTheme } from "@mui/material";
import { combineSentences } from "@wb/utils/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { Word } from "../main";
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";
import { TimeForALetterInSeconds, WritingSentenceWithOrigin } from "./writing-sentence";
import { Navigator } from "../common/navigator";
import { AudioPlayer } from "../common/sentence-audio-player";

const NumberOfExpectedSentences = 5;

export function WritingSentences({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const combinedSentences = useMemo(() => combineSentences(words), [words]);
    const timerRef = useRef<ProgressTimerRef>(null);

    const theme = useTheme();
    const [expectedSentenceCount, setExpectedSentenceCount] = useState(0);

    const moveToPrevSentence = () => {
        setSentenceIndex(sentenceIndex - 1);
        timerRef.current!.resetTimer();
    }

    const moveToNextSentence = () => {
        setSentenceIndex(sentenceIndex + 1);
        timerRef.current!.resetTimer();
    }

    const restart = () => {
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
                <Stack direction={"row"} gap={1}>
                    <Navigator index={sentenceIndex}
                        total={combinedSentences.length}
                        onPrev={moveToPrevSentence}
                        onNext={moveToNextSentence}
                        onRestart={restart} />
                    <AudioPlayer videoUrl={combinedSentences[sentenceIndex].sentence.mediaUrl} repeat={expectedSentenceCount} />
                </Stack>

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