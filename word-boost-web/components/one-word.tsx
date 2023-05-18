import { Stack, Chip, Button, Accordion as MuiAccordion, AccordionDetails, AccordionSummary, Typography, Tabs, Tab, styled, AccordionProps, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Word } from "./word-list";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { ProgressTimer, ProgressTimerRef } from "./progress-timer";
import { LoadingImage } from "./loading-image";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AbcIcon from '@mui/icons-material/Abc';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';

export function OneWord({ words, initialImageVisible }: { words: Word[], initialImageVisible: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0);

    const isFirstWord = currentIndex == 0;
    const isLastWord = currentIndex == words.length - 1;
    const currentWord = words[currentIndex];

    const handleNext = () => {
        if (isLastWord) {
            return;
        }

        setCurrentIndex(currentIndex + 1);
        setSelectedTab(0);
    }

    const handlePrevious = () => {
        if (isFirstWord) {
            return;
        }

        setCurrentIndex(currentIndex - 1);
        setSelectedTab(0);
    }

    useEffect(() => {
        setCurrentIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    return (
        <Stack direction={"column"} alignItems={"center"}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab icon={<AbcIcon />} />
                <Tab icon={<FormatListBulletedIcon />} />
            </Tabs>
            {selectedTab === 0 && <WordCard word={currentWord} initialImageVisible={initialImageVisible} />}
            {selectedTab === 1 && <SentenceCard word={currentWord} />}

            <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
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

function WordCard({ word, initialImageVisible }: { word: Word, initialImageVisible: boolean }) {
    const [imageVisible, setImageVisible] = useState(initialImageVisible);
    const timer = useRef<ProgressTimerRef>(null);

    const handleWordClick = () => {
        setImageVisible(!imageVisible);
    }

    const handleTimeup = () => {
        setTimeout(() => {
            setImageVisible(true);
        });
    }

    useEffect(() => {
        timer.current?.resetTimer();
        setImageVisible(initialImageVisible);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [word]);

    return (
        <>
            <div style={{
                width: "100%",
                height: 300,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                {imageVisible ?
                    <LoadingImage imageUrl={word?.imageUrl} /> :
                    <ProgressTimer ref={timer} maxValue={10} onTimeup={handleTimeup} />}
            </div>
            <Chip key={word?.id}
                label={word?.value}
                clickable
                color="primary"
                sx={{ marginTop: 1, fontSize: 30, p: 3 }}
                onClick={handleWordClick}
            />
        </>
    );
}

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

function EmbbebedYoutube({ videoUrl }: { videoUrl: string }) {
    const iframeRef = useRef(null);
    const autoplayQueryString = "autoplay=1";

    const handleReplayClick = () => {
        if (videoUrl.indexOf(autoplayQueryString) < 0) {
            if (videoUrl.indexOf(".") > 0) {
                videoUrl = `${videoUrl}&${autoplayQueryString}`;
            } else {
                videoUrl = `${videoUrl}?${autoplayQueryString}`
            }
        }

        (iframeRef.current as any).src = videoUrl;
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <iframe ref={iframeRef}
                    src={videoUrl}
                    title="YouTube video player"
                    style={{ border: 0, width: "min(560px, 100vw - 4px)", height: 315 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen></iframe>
                <IconButton onClick={handleReplayClick}>
                    <ReplayCircleFilledIcon />
                </IconButton>
            </div>
        </>
    )
}

function SentenceCard({ word }: { word: Word }) {
    const [expandedIndex, setExpandedIndex] = useState(-1);

    const handleChange = (index: number, isExpanded: boolean) => {
        setExpandedIndex(isExpanded ? index : -1);
    };

    const highlightWord = (sentence: string) => {
        const regex = new RegExp(`(${word.value})`, "gi")
        const styledSentence = sentence.replace(regex, (match, group) => `<span style="background-color: yellow">${group}</span>`);
        return styledSentence;
    }

    const isYoutubeLink = (medialUrl: string) => medialUrl.startsWith("https://youtu.be") || medialUrl.startsWith("https://www.youtube");

    return (
        <div style={{ width: "100%" }}>
            {word.sentences.map((s, i) => (
                <Accordion key={s.value} expanded={expandedIndex == i} onChange={(_, isExpanded) => handleChange(i, isExpanded)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h5"
                            component="div"
                            color={expandedIndex === i || expandedIndex === -1 ? "primary" : "gray"}
                            fontWeight="bold"
                            dangerouslySetInnerHTML={{ __html: highlightWord(s.value) }} />
                    </AccordionSummary>
                    <AccordionDetails>
                        {isYoutubeLink(s.mediaUrl) ?
                            <EmbbebedYoutube videoUrl={s.mediaUrl} /> :
                            <div style={{ width: "100%", height: 300 }}>
                                <LoadingImage imageUrl={s.mediaUrl} />
                            </div>
                        }
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
}