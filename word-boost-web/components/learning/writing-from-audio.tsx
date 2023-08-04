import { useMemo, useState } from "react";
import { Word } from "../main";
import { CombinedSentence } from "../testing/fill-blank-test";
import { combineSentences } from "@wb/utils/utils";
import { AudioPlayer } from "../common/sentence-audio-player";
import { Typography } from "@mui/material";

const StartRate = 0.6;
const EndRate = 1;

const MinDelayTime = 4000;
const MaxDelayTime = 15000;

const AverageDisplayTimeForAWord = 2500;

export function WritingFromAudio({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const combinedSentences = useMemo(() => combineSentences(words), [words]);

    function handleFinish(): void {
        if (sentenceIndex < combinedSentences!.length - 1) {
            // This will be called twice on a TV browser?
            // setSentenceIndex(prev => prev + 1);
            setSentenceIndex(sentenceIndex + 1);
        }
    }

    return combinedSentences && <WritingSenntenceFromAudio combinedSentence={combinedSentences[sentenceIndex]}
        onFinish={handleFinish} />
}

function WritingSenntenceFromAudio({ combinedSentence, onFinish }: { combinedSentence: CombinedSentence, onFinish: () => void }) {
    const [repeat, setRepeat] = useState(0);
    const [sentenceVisible, setSentenceVisible] = useState(false);
    const [prevCombinedSentence, setPrevCombinedSentence] = useState<CombinedSentence | null>(null);

    const wordCount = combinedSentence.sentence.value.split(" ").length;
    const repeatCount = wordCount * 2;
    const intervalRate = (EndRate - StartRate) / repeatCount;

    const rate = repeat === 0 ? EndRate : StartRate + intervalRate * (repeat - 1);

    if (prevCombinedSentence !== combinedSentence) {
        setRepeat(0);
        setSentenceVisible(false);
        setPrevCombinedSentence(combinedSentence);
    }

    function handleFinish(): void {
        if (repeat >= repeatCount) {
            setTimeout(() => {
                onFinish();
            }, 10000);
            return;
        }

        window.setTimeout(() => {
            if (repeat % 3 === 1) {
                setSentenceVisible(true);
                setTimeout(() => {
                    setSentenceVisible(false);
                }, wordCount * AverageDisplayTimeForAWord);
            }
            setRepeat(repeat + 1);
        }, MinDelayTime + (MaxDelayTime - MinDelayTime) * repeat / repeatCount);
    }

    return <>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <AudioPlayer videoUrl={combinedSentence.sentence.mediaUrl}
                rate={rate}
                repeat={repeat}
                onFinish={handleFinish} />
            <Typography variant="h5" fontWeight="bold">
                Listen and write
            </Typography>
            <Typography variant="h6" color="secondary">
                Repeat times: {repeat} / {repeatCount}
            </Typography>
        </div>
        <Typography fontSize={100} color="primary">
            {sentenceVisible && combinedSentence?.sentence.value}
        </Typography>
    </>
}