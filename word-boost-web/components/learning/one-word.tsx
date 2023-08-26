import { Stack, Chip, Button, Tabs, Tab, styled, IconButton, Card, CardActions, Collapse, IconButtonProps } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Word } from "../main";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";
import { LoadingImage } from "../loading-image";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AbcIcon from '@mui/icons-material/Abc';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { SentenceTypography } from "./sentence-typography";
import { BingTranslateReader } from "../common/bing-translate-reader";
import { SentenceYoutubePlayer } from "../common/sentence-youtube-player";
import { useSelectionTranslator } from "@wb/utils/use-selection-translator";
import ImageIcon from '@mui/icons-material/Image';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import { parseVideoUrl } from "../common/player-utils";

export function OneWord({ words, initialShowAll, mode }: { words: Word[], initialShowAll: boolean, mode: WordCardMode }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0);

    const isFirstWord = currentIndex == 0;
    const isLastWord = currentIndex == words.length - 1;
    const currentWord = words[currentIndex];

    const handleNext = () => {
        if (isLastWord) {
            return;
        }

        moveTo(currentIndex + 1);
    }

    const handlePrevious = () => {
        if (isFirstWord) {
            return;
        }

        moveTo(currentIndex - 1);
    }

    const moveTo = (wordIndex: number) => {
        setCurrentIndex(wordIndex);
        setSelectedTab(words[wordIndex].value ? 0 : 1);
    }

    useEffect(() => {
        setCurrentIndex(0);
    }, [words]);

    return (
        <Stack direction={"column"} alignItems={"center"} gap={1}>
            {selectedTab === 0 && <WordCard word={currentWord} initialShowAll={initialShowAll} mode={mode} />}
            {selectedTab === 1 && <SentenceCard word={currentWord} />}
            <Tabs value={selectedTab}
                TabIndicatorProps={{
                    sx: {
                        top: 0
                    }
                }}
                sx={{ marginTop: 1 }}
                onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab icon={<AbcIcon />} disabled={!currentWord.value} />
                <Tab icon={<FormatListBulletedIcon />} disabled={!currentWord.sentences.length} />
            </Tabs>
            <div style={{ marginTop: 5, marginBottom: 5, fontWeight: 'bold' }}>
                {currentIndex + 1}/{words.length}
            </div>
            <div>
                <Button onClick={handlePrevious}
                    variant="outlined"
                    disabled={isFirstWord}
                    sx={{ marginRight: 5 }}
                    startIcon={<SkipPreviousIcon />}
                    color="secondary"
                >Prev</Button>
                <Button onClick={handleNext}
                    variant="outlined"
                    disabled={isLastWord}
                    endIcon={<SkipNextIcon />}
                    color="secondary"
                >Next</Button>
            </div>
        </Stack>
    );
}

export type WordCardMode = "show_word" | "show_media";

function WordCard({ word, initialShowAll, mode }: { word: Word, initialShowAll: boolean, mode: WordCardMode }) {
    const [mediaVisible, setMediaVisible] = useState(initialShowAll);
    const [wordVisible, setWordVisible] = useState(initialShowAll);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const timer = useRef<ProgressTimerRef>(null);
    const [prevWord, setPrevWord] = useState(word);

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
            {word?.videoUrl && <div style={{ display: mediaVisible && mediaType === "video" ? "block" : "none" }}>
                <SentenceYoutubePlayer videoUrl={word?.videoUrl}
                    width={636}
                    height={358}
                    controlPosition="start"
                    initialMuted={mode === "show_media"}
                    play={mediaVisible && mediaType === "video"} />
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

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

function SentenceCard({ word }: { word: Word }) {
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [focusIndex, setFocusIndex] = useState(0);
    const { onMouseUpCapture, TranslatorPopover } = useSelectionTranslator();

    const handleExpandedChange = (index: number) => {
        setExpandedIndex(expandedIndex === index ? -1 : index)
        if (focusIndex !== index) {
            setFocusIndex(index);
        }
    };

    const handleFocusChange = (index: number) => {
        setFocusIndex(index);
        if (index !== expandedIndex) {
            setExpandedIndex(-1);
        }
    }

    const isYoutubeLink = (medialUrl: string) => medialUrl.startsWith("https://www.youtube.com/");

    return (
        <div style={{ width: "100%", minHeight: 467 }}
            onMouseUpCapture={onMouseUpCapture}>
            {word.sentences.map((s, i) => {
                const isCardExpanded = expandedIndex === i;
                const isCardFocused = focusIndex == i;
                return (
                    <Card key={s.value} variant="outlined" sx={{ marginBottom: 1, border: 0 }}>
                        <CardActions sx={{ justifyContent: "space-between" }}>
                            <Stack direction={"row"} alignItems={"center"} gap={1}>
                                <IconButton onClick={() => handleFocusChange(i)}>
                                    <ArrowRightIcon />
                                </IconButton>
                                <SentenceTypography variant={isCardFocused ? "h4" : "h5"}
                                    component="div"
                                    color={isCardFocused ? "primary" : "gray"}
                                    fontSize={isCardFocused ? 50 : 40}
                                    fontWeight={isCardFocused ? "bold" : "normal"}
                                    sx={{ flexGrow: 1 }}
                                    word={word}
                                    sentenceIndex={i} />
                                <div>
                                    <BingTranslateReader text={s.value} />
                                </div>
                            </Stack>
                            <ExpandMore expand={isCardExpanded}
                                disabled={!s.mediaUrl}
                                onClick={() => handleExpandedChange(i)}>
                                <ExpandMoreIcon />
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={isCardExpanded}>
                            {isYoutubeLink(s.mediaUrl) ?
                                <SentenceYoutubePlayer videoUrl={s.mediaUrl} play={isCardExpanded} /> :
                                <div style={{ width: "100%", height: 300 }}>
                                    <LoadingImage imageUrl={s.mediaUrl} />
                                </div>
                            }
                        </Collapse>
                    </Card>
                )
            })}
            <TranslatorPopover />
        </div>
    );
}