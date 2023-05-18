import { Stack, Chip, Button, Accordion as MuiAccordion, AccordionDetails, AccordionSummary, Typography, Tabs, Tab, styled, AccordionProps, IconButton, Tooltip } from "@mui/material";
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
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import styles from "../styles/OneWord.module.css";

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
            {selectedTab === 0 && <WordCard word={currentWord} initialImageVisible={initialImageVisible} />}
            {selectedTab === 1 && <SentenceCard word={currentWord} />}
            <Tabs value={selectedTab}
                TabIndicatorProps={{
                    sx: {
                        top: 0
                    }
                }}
                sx={{ marginTop: 1 }}
                onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab icon={<AbcIcon />} />
                <Tab icon={<FormatListBulletedIcon />} />
            </Tabs>

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
                    <ProgressTimer ref={timer} maxValue={15} onTimeup={handleTimeup} />}
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

    const makeAutoPlayVideoUrl = (url: string) => {
        if (url.indexOf(autoplayQueryString) >= 0) {
            return url;
        }

        if (url.indexOf("?") > 0) {
            return `${url}&${autoplayQueryString}`;
        }

        return `${url}?${autoplayQueryString}`
    }

    const makeVideoUrlWithoutTimeRange = (url: string) => {
        const startOrEndRegex = new RegExp("(&*start=[\\w\\d]+)|(&*end=[\\w\\d]+)", "gi");
        return url.replace(startOrEndRegex, "");
    }

    const handleReplayClick = () => {
        (iframeRef.current as any).src = makeAutoPlayVideoUrl(videoUrl);
    }

    const handlePlayAllClick = () => {
        (iframeRef.current as any).src = makeAutoPlayVideoUrl(makeVideoUrlWithoutTimeRange(videoUrl));
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
                <div>
                    <Tooltip title="Replay with time range">
                        <IconButton sx={{ marginRight: 1 }} onClick={handleReplayClick}>
                            <ReplayCircleFilledIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Play the whole video">
                        <IconButton onClick={handlePlayAllClick}>
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>
                </div>
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
        const wordRegex = new RegExp(`(\\w*${word.value}\\w*|\\w+)`, "gi")
        return sentence.replace(wordRegex, (match, group: string) => {
            const exactWordRegex = new RegExp(`(${word.value})`, "gi");
            const styledExactWord = group.replace(exactWordRegex, (m, g) => `<span class="${styles['exact-word']}">${g}</span>`)
            return `<span class="${styles.word}">${styledExactWord}</span>`
        });
    }

    const isYoutubeLink = (medialUrl: string) => medialUrl.startsWith("https://www.youtube.com/");

    return (
        <div style={{ width: "100%", minHeight: 356 }}>
            {word.sentences.map((s, i) => {
                const isTabExpandedOrNoTabExpanded = expandedIndex === i || expandedIndex === -1;
                return (
                    <Accordion key={s.value} expanded={expandedIndex == i} onChange={(_, isExpanded) => handleChange(i, isExpanded)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant={isTabExpandedOrNoTabExpanded ? "h4" : "h5"}
                                component="div"
                                color={isTabExpandedOrNoTabExpanded ? "primary" : "gray"}
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
                )
            })}
        </div>
    );
}