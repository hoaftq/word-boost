import { Stack, Chip, Button, Tabs, Tab, styled, IconButton, Tooltip, Card, CardActions, Collapse, IconButtonProps, Checkbox, FormControlLabel } from "@mui/material";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Word } from "../main";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { ProgressTimer, ProgressTimerRef } from "../progress-timer";
import { LoadingImage } from "../loading-image";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AbcIcon from '@mui/icons-material/Abc';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { SentenceTypography } from "./sentence-typography";
import dynamic from "next/dynamic";
import ReactPlayer from "react-player";
import { BingTranslateReader } from "../common/bing-translate-reader";
const YoutubePlayer = dynamic(() => import("../youtube-player"), { ssr: false });

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
                height: 349,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                {imageVisible ?
                    <LoadingImage imageUrl={word?.imageUrl} /> :
                    <ProgressTimer ref={timer}
                        mode="seconds"
                        maxValue={15}
                        onTimeup={handleTimeup} />}
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                marginTop: 1,
                marginBottom: 3,
                paddingLeft: 45,
            }}>
                <Chip key={word?.id}
                    label={word?.value}
                    clickable
                    color="primary"
                    sx={{
                        fontSize: 50,
                        p: 4
                    }}
                    onClick={handleWordClick} />
                <div style={{
                    alignSelf: "center",
                    marginLeft: 3
                }}>
                    <BingTranslateReader text={word?.value} />
                </div>
            </div>
        </>
    );
}

function SentenceYoutubePlayer({ videoUrl, play }: { videoUrl: string, play: boolean }) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlayingWholeVideo, setIsPlayingWholeVideo] = useState(false);
    const [hasControl, setHasControl] = useState(false);

    const handleReplayClick = () => {
        setIsPlayingWholeVideo(false);
        playAt(startEnd.start);
    }

    const handlePlayAllClick = () => {
        setIsPlayingWholeVideo(true);
        playAt(0);
    }

    const startEnd: { [key: string]: number } = { start: 0 };
    const splittedUrlParts = videoUrl.split(/[?|&]/g);
    for (let i = 1; i < splittedUrlParts.length; i++) {
        const query = splittedUrlParts[i].split("=");
        startEnd[query[0]] = parseFloat(query[1]);
    }

    const handleCustomProgress = (duration: number) => {
        if (isPlayingWholeVideo) {
            return;
        }

        if (startEnd.end && duration > startEnd.end) {
            playerRef.current?.getInternalPlayer().pauseVideo();
        }
    }

    const handleHasControlChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setHasControl(checked);
    }

    useEffect(() => {
        if (play) {
            const timerId = setTimeout(() => {
                playAt(startEnd.start);
            }, 500);

            return () => {
                clearTimeout(timerId);
            }
        }
    }, [startEnd.start, play]);

    const playAt = (pos: number) => {
        playerRef.current?.seekTo(pos, "seconds");
        playerRef.current?.getInternalPlayer().playVideo();
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <YoutubePlayer playerRef={playerRef}
                    key={hasControl ? "yp_1" : "yp_0"}
                    width="min(560px, 100vw - 4px)"
                    height="315px"
                    controls={hasControl}
                    url={splittedUrlParts[0]}
                    onCustomProgress={handleCustomProgress} />
                <div>
                    <Tooltip title="Replay with time range">
                        <IconButton sx={{ marginRight: 1 }} onClick={handleReplayClick}>
                            <ReplayCircleFilledIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Play the whole video">
                        <IconButton sx={{ marginRight: 5 }} onClick={handlePlayAllClick}>
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>
                    <FormControlLabel label="Control"
                        control={<Checkbox checked={hasControl} onChange={handleHasControlChange} />} />
                </div>
            </div>
        </>
    )
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
        <div style={{ width: "100%", minHeight: 445 }}>
            {word.sentences.map((s, i) => {
                const isCardExpanded = expandedIndex === i;
                const isCardFocused = focusIndex == i;
                return (
                    <Card key={s.value} variant="outlined" sx={{ marginBottom: 1, border: 0 }}>
                        <CardActions sx={{ justifyContent: "space-between" }}>
                            <IconButton sx={{ marginRight: 1 }} onClick={() => handleFocusChange(i)}>
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
                            <ExpandMore expand={isCardExpanded} onClick={() => handleExpandedChange(i)}>
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
        </div>
    );
}