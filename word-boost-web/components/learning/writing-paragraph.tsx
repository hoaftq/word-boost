import { useEffect, useRef, useState } from "react";
import { Word } from "../main";
import { CombinedSentence } from "../testing/fill-blank-test";
import { combineSentences } from "@wb/utils/utils";
import { TimeForALetterInSeconds, WritingSentenceWithOrigin } from "./writing-sentence";

type WritingParagraphProps = {
    words: Word[];
    speed: number;
}
export function WritingParagraph({ words, speed }: WritingParagraphProps) {
    const [combinedSentences, setCombinedSentences] = useState<CombinedSentence[] | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const countRef = useRef(0);

    if (!combinedSentences) {
        setCombinedSentences(combineSentences(words));
    }

    useEffect(() => {
        if (!combinedSentences || combinedSentences.length === 0) {
            return;
        }

        const delayForFirstSentence = TimeForALetterInSeconds * combinedSentences[0].sentence.value.length * 2 / 3;
        const timerId = setInterval(() => {
            if (countRef.current < delayForFirstSentence) {
                countRef.current++;
                return;
            }

            const container = containerRef.current!;

            container.scrollBy(0, speed);
            if (Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 1) {
                clearInterval(timerId);
            }
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [combinedSentences, speed])

    return combinedSentences
        && <div ref={containerRef}
            style={{
                height: "calc(100vh - 80px)",
                overflowY: "auto"
            }}>
            {combinedSentences.map((cs) => <WritingSentenceWithOrigin key={cs.sentence.value} sentence={cs.sentence.value} />)}
        </div>
}