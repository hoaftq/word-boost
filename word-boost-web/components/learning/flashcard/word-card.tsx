import { IconButton, Chip } from "@mui/material";
import { BingTranslateReader } from "@wb/components/common/bing-translate-reader";
import { parseVideoUrl } from "@wb/components/common/player-utils";
import { SentenceYoutubePlayer } from "@wb/components/common/sentence-youtube-player";
import { LoadingImage } from "@wb/components/loading-image";
import { Word } from "@wb/components/main";
import { ProgressTimerRef, ProgressTimer } from "@wb/components/progress-timer";
import { useState, useRef, useEffect } from "react";
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ImageIcon from '@mui/icons-material/Image';

export type WordCardMode = "show_word" | "show_media";

const scale = 1.5;

export function WordCard({ word, initialShowAll, mode }: { word: Word, initialShowAll: boolean, mode: WordCardMode }) {
    const [mediaVisible, setMediaVisible] = useState(initialShowAll);
    const [wordVisible, setWordVisible] = useState(initialShowAll);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const timer = useRef<ProgressTimerRef>(null);
    const [prevWord, setPrevWord] = useState(word);

    const [isTeachingPlaying, setIsTeachingPlaying] = useState(false);

    if (prevWord !== word) {
        setPrevWord(word);

        if (word.imageUrl && mediaType === "video") {
            setMediaType("image");
        }

        setMediaVisible(initialShowAll);
        setWordVisible(initialShowAll);
    }

    if (!word.imageUrl && word.videoUrl && mediaType === "image") {
        setMediaType("video");
    }

    if (mode === "show_word" && !wordVisible) {
        setWordVisible(true);
    }

    if (mode === "show_media" && !mediaVisible) {
        setMediaVisible(true);
    }

    const handleWordClick = () => {
        if (mode === "show_word") {
            setMediaVisible(!mediaVisible);
        }
    }

    const handleTimeup = () => {
        setTimeout(() => {
            if (mode === "show_word") {
                setMediaVisible(true);
            } else {
                setWordVisible(true);
            }
        });
    }

    useEffect(() => {
        timer.current?.resetTimer();
    }, [word]);


    let videoDuration = 15;
    if (word?.videoUrl) {
        const { start, end } = parseVideoUrl(word.videoUrl);
        videoDuration = Math.max(15, end - start);
    }

    return <>
        <div style={{
            width: "100%",
            height: 397,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            position: "relative"
        }}>
            {word?.imageUrl && <LoadingImage imageUrl={word?.imageUrl}
                visible={mediaVisible && mediaType === "image"} />}
            {word?.videoUrl && <div style={{
                display: mediaVisible && mediaType === "video" ? "block" : "none",
                top: 0,
                left: `${50 - 50 / scale}vw`,
                zIndex: isTeachingPlaying ? 1 : 0,
                position: isTeachingPlaying ? "fixed" : "static"
            }}>
                <SentenceYoutubePlayer videoUrl={word?.videoUrl}
                    width={isTeachingPlaying ? `${100 / scale}vw` : 636}
                    height={isTeachingPlaying ? `${100 / scale}vh` : 358}
                    controlPosition="start"
                    initialMuted={mode === "show_media"}
                    play={mediaVisible && mediaType === "video"}
                    onMutedPlay={() => setIsTeachingPlaying(true)}
                    onUnmutedPlay={() => setIsTeachingPlaying(true)}
                    onPlayFinished={() => setIsTeachingPlaying(false)} />
            </div>}

            {!!word?.imageUrl && !!word?.videoUrl && mediaVisible && <IconButton
                sx={{
                    position: "absolute",
                    bottom: 0,
                    backgroundColor: "white"
                }}
                onClick={() => setMediaType(mediaType === "image" ? "video" : "image")}>
                {mediaType === "image" ? <VideoCameraBackIcon /> : <ImageIcon />}
            </IconButton>}

            {!mediaVisible && <ProgressTimer ref={timer}
                mode="seconds"
                maxValue={15}
                onTimeup={handleTimeup} />}
        </div>

        <div style={{
            display: "flex",
            flexDirection: "row"
        }}>
            {wordVisible ? <>
                <Chip key={word?.id}
                    label={word?.value}
                    clickable
                    color="primary"
                    sx={{
                        fontSize: 50,
                        p: 4,
                        marginLeft: 5.6
                    }}
                    onClick={handleWordClick} />
            </> : (
                <ProgressTimer ref={timer}
                    mode="seconds"
                    maxValue={videoDuration}
                    onTimeup={handleTimeup}
                    onDoubleClick={handleTimeup} />
            )}

            <div style={{
                alignSelf: "center",
                marginLeft: 3,
                display: wordVisible ? "block" : "none"
            }}>
                <BingTranslateReader text={word?.value} />
            </div>
        </div>
    </>;
}