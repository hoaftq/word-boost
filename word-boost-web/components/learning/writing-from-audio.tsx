import { useEffect, useMemo, useRef, useState } from "react";
import { Word } from "../main";
import { CombinedSentence } from "../testing/fill-blank-test";
import { combineSentences } from "@wb/utils/utils";
import { AudioPlayer } from "../shared/sentence-audio-player";
import { Typography, useTheme } from "@mui/material";
import HeadphonesIcon from '@mui/icons-material/Headphones';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Navigator } from "../shared/navigator";

const StartRate = 0.6;
const EndRate = 1;

const MinDelayTime = 4000;
const MaxDelayTime = 15000;

const AverageDisplayTimeForAWord = 2500;

export function WritingFromAudio({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const combinedSentences = useMemo(() => combineSentences(words).filter(s => s.sentence.mediaUrl), [words]);
    const [isFinished, setIsFinished] = useState(false);
    const theme = useTheme();

    function handleFinish(): void {
        if (sentenceIndex < combinedSentences!.length - 1) {
            // This will be called twice on a TV browser?
            // setSentenceIndex(prev => prev + 1);
            setSentenceIndex(sentenceIndex + 1);
        } else {
            setIsFinished(true);
        }
    }

    function handleRestart(): void {
        setSentenceIndex(0);
        setIsFinished(false);
    }

    if (combinedSentences && !!combinedSentences.length) {
        return <>
            <WritingSentenceFromAudio combinedSentence={combinedSentences[sentenceIndex]} onFinish={handleFinish} />
            {isFinished && <Typography marginTop={5}
                variant="h3"
                textAlign={"center"}
                color={theme.palette.warning.main}>Finish!</Typography>}
            <Navigator containerStyle={{ marginTop: 20 }}
                index={sentenceIndex}
                total={combinedSentences.length}
                onNext={() => setSentenceIndex(sentenceIndex + 1)}
                onPrev={() => setSentenceIndex(sentenceIndex - 1)}
                onRestart={handleRestart}
            />
        </>
    }

    return <Typography variant="h6"
        color="error"
        textAlign="center">No sentences with audio available</Typography>
}

function WritingSentenceFromAudio({ combinedSentence, onFinish }: { combinedSentence: CombinedSentence, onFinish: () => void }) {
    const [repeat, setRepeat] = useState(0);
    const [sentenceVisible, setSentenceVisible] = useState(false);
    const [prevCombinedSentence, setPrevCombinedSentence] = useState<CombinedSentence | null>(null);
    const repeatTimerId = useRef<number | null>(null);

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

        repeatTimerId.current = window.setTimeout(() => {
            if (repeat % 3 === 1) {
                setSentenceVisible(true);
                setTimeout(() => {
                    setSentenceVisible(false);
                }, wordCount * AverageDisplayTimeForAWord);
            }
            setRepeat(repeat + 1);
        }, MinDelayTime + (MaxDelayTime - MinDelayTime) * repeat / repeatCount);
    }

    useEffect(() => {
        if (repeatTimerId.current) {
            window.clearTimeout(repeatTimerId.current);
        }
    }, [combinedSentence]);

    return <>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <AudioPlayer videoUrl={combinedSentence.sentence.mediaUrl}
                rate={rate}
                repeat={repeat}
                onFinish={handleFinish} />
            <div style={{ display: "flex", alignItems: "center" }}>
                <HeadphonesIcon fontSize="large" color="info" />
                <Typography variant={"h5"}
                    fontWeight={"bold"}
                    marginX={1}>Listen and write</Typography>
                <EditNoteIcon fontSize="large" color="info" />
            </div>
            <Typography variant="h6" color="secondary">
                Repeat times: {repeat} / {repeatCount}
            </Typography>
        </div>
        <Typography fontSize={100} color="primary">
            {sentenceVisible && combinedSentence?.sentence.value}
        </Typography>
    </>
}