import { useEffect, useMemo, useRef, useState, UIEvent } from "react";
import { Word } from "../main";
import { combineSentences } from "@wb/utils/utils";
import { WritingSentenceWithOrigin } from "./writing-sentence";
import { AudioPlayer } from "../common/sentence-audio-player";

type WritingParagraphProps = {
    words: Word[];
    speed: number;
}
export function WritingParagraph({ words, speed }: WritingParagraphProps) {
    const combinedSentences = useMemo(() => combineSentences(words), [words]);
    const containerRef = useRef<HTMLDivElement>(null);

    const [playerPosition, setPlayerPosition] = useState({ top: 0, left: 0 });

    const sentencesRef = useRef<Array<HTMLDivElement | null>>([]);
    const [focusIndex, setFocusIndex] = useState(0);

    const scannerPositionRef = useRef(0);

    function handleScroll(event: UIEvent<HTMLDivElement>): void {
        // Make sure the sanner is in the middle for manually scrolling
        scannerPositionRef.current = containerRef.current!.clientHeight / 2;
        setFocusSentence();
    }

    useEffect(() => {
        function moveScannerDown(pos: number, done?: () => void) {
            const timerId = window.setInterval(() => {
                scannerPositionRef.current += speed;
                setFocusSentence();

                if (scannerPositionRef.current >= pos) {
                    window.clearInterval(timerId);
                    done?.();
                }
            }, 1000);

            return timerId;
        }

        function scrollDown(done: () => void) {
            const timerId = window.setInterval(() => {
                const container = containerRef.current!;
                container.scrollBy(0, speed);

                if (Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 1) {
                    window.clearInterval(timerId);
                    done();
                }
            }, 1000);

            return timerId;
        }

        let timerId1: number, timerId2: number, timerId3: number;
        timerId1 = moveScannerDown(containerRef.current!.clientHeight / 2, () => {
            timerId2 = scrollDown(() => {
                timerId3 = moveScannerDown(containerRef.current!.clientHeight);
            });
        })

        return () => {
            clearInterval(timerId1);
            clearInterval(timerId2);
            clearInterval(timerId3);
        }
    }, [speed]);

    // Put the player to the desire position
    useEffect(() => {
        const container = containerRef.current!;
        setPlayerPosition({
            top: container.offsetTop,
            left: container.offsetLeft + container.clientWidth - 50,
        });
    }, []);

    function setFocusSentence() {
        const container = containerRef.current!;
        for (let i = sentencesRef.current.length - 1; i >= 0; i--) {
            if (sentencesRef.current[i]!.offsetTop < container.scrollTop + container.offsetTop + scannerPositionRef.current) {
                setFocusIndex(i);
                break;
            }
        }
    }

    return combinedSentences
        && <div ref={containerRef}
            style={{
                height: "calc(100vh - 80px)",
                overflowY: "auto"
            }} onScroll={handleScroll}>
            {combinedSentences.map((cs, i) => <>
                <WritingSentenceWithOrigin key={cs.sentence.value}
                    ref={(node) => { sentencesRef.current[i] = node }}
                    sentence={cs.sentence.value} focused={focusIndex === i} />
            </>)}
            <div style={{
                position: "fixed",
                top: playerPosition.top,
                left: playerPosition.left,
                width: 50,
                height: 40,
                backgroundColor: "red"
            }}>
                <AudioPlayer videoUrl={combinedSentences[focusIndex].sentence.mediaUrl} />
            </div>
        </div>
}