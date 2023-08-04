import { useState } from "react";
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
    const [combinedSentences, setCombinedSentences] = useState<CombinedSentence[] | null>(null);
    const [sentenceIndex, setSentenceIndex] = useState(0);

    // TODO move this out of all the components
    if (!combinedSentences) {
        setCombinedSentences(combineSentences(words));
    }

    function handleFinish(): void {
        if (sentenceIndex < combinedSentences!.length - 1) {
            setSentenceIndex(prev => prev + 1);
        }
    }

    return combinedSentences && <WritingSenntenceFromAudio combinedSentence={combinedSentences[sentenceIndex]}
        onFinish={handleFinish} />
}

function WritingSenntenceFromAudio({ combinedSentence, onFinish }: { combinedSentence: CombinedSentence, onFinish: () => void }) {
    const [repeat, setRepeat] = useState(0);
    const [sentenceVisible, setSentenceVisible] = useState(false);

    const wordCount = combinedSentence.sentence.value.split(" ").length;
    const repeatCount = wordCount * 2;
    const intervalRate = (EndRate - StartRate) / repeatCount;

    function handleFinish(): void {
        if (repeat >= repeatCount - 1) {
            setRepeat(0);
            setSentenceVisible(false);

            setTimeout(() => {
                onFinish();
            }, 5000);
            return;
        }

        setTimeout(() => {
            if (repeat % 3 === 2) {
                setSentenceVisible(true);
                setTimeout(() => {
                    setSentenceVisible(false);
                }, wordCount * AverageDisplayTimeForAWord);
            }
            setRepeat(prev => prev + 1);
        }, MinDelayTime + (MaxDelayTime - MinDelayTime) * repeat / repeatCount);
    }

    return <>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5">
                Listen and write
            </Typography>
            <AudioPlayer videoUrl={combinedSentence.sentence.mediaUrl}
                rate={StartRate + intervalRate * repeat}
                repeat={repeat}
                onFinish={handleFinish} />
            <Typography variant="h6" fontWeight="bold">
                Repeat times: {repeat + 1} / {repeatCount}
            </Typography>
        </div>
        <Typography fontSize={55} color="primary">
            {sentenceVisible && combinedSentence?.sentence.value}
        </Typography>
    </>
}