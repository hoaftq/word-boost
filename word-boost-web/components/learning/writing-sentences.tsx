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
    const [repeat, setRepeat] = useState(0);

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
        const newValue = Math.round((1 - currentValue / maxValue) * NumberOfExpectedSentences);
        if (expectedSentenceCount != newValue) {
            setExpectedSentenceCount(newValue);
            setRepeat(0);
        }
    }

    useEffect(() => {
        restart();
    }, [words]);

    function handleAudioFinish(): void {
        setTimeout(() => setRepeat(1), 5000);
    }

    const currentSentence = combinedSentences?.[sentenceIndex].sentence;
    if (currentSentence.value) {
        const writingTime = currentSentence.value.length * TimeForALetterInSeconds * NumberOfExpectedSentences;

        return <>
            <WritingSentenceWithOrigin sentence={currentSentence.value} />
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
                    {currentSentence.mediaUrl && <AudioPlayer videoUrl={currentSentence.mediaUrl}
                        repeat={expectedSentenceCount * 2 + repeat}
                        onFinish={handleAudioFinish} />}
                </Stack>

                <div style={{ color: theme.palette.warning.main }}>
                    {expectedSentenceCount === 0
                        ? <>You might be writing the first sentence now</>
                        : <><span style={{
                            fontWeight: "bold",
                            fontSize: 30
                        }}>{expectedSentenceCount}</span> sentence(s) should be written already</>}
                </div>

                <ProgressTimer ref={timerRef}
                    key={currentSentence.value}
                    mode="minutes"
                    maxValue={writingTime}
                    onTimeup={handleTimeup}
                    onTicking={handleTicking} />
            </div>
        </>;
    }

    return null;
}