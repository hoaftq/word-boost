import { Word } from "../word-list";
import { Button, IconButton, Popover, TextField, Typography, useTheme } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useRef, useState, KeyboardEvent, useEffect } from "react";
import ReactPlayer from "react-player";
import YoutubePlayer from "../youtube-player";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Sentence } from "@wb/pages/add-word";
import { shuffleArray } from "@wb/utils/utils";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import InfoIcon from '@mui/icons-material/Info';

type CombinedSentence = {
    sentence: Sentence;
    words: Word[]
}

export function FillBlankTest({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [randomSentences, setRandomSentences] = useState<CombinedSentence[] | null>(null);

    if (!randomSentences) {
        const sentences = words.flatMap(w => w.sentences.map(s => ({
            sentence: s,
            words: [w]
        })));
        const randomSentences = shuffleArray(sentences);
        setRandomSentences(randomSentences);
    }

    const isLastSentence = () => sentenceIndex >= randomSentences!.length - 1;

    const handleNextSentenceClick = () => {
        if (isLastSentence()) {
            return;
        }

        setSentenceIndex(sentenceIndex + 1);
    }

    const restart = () => {
        setRandomSentences(null);
        setSentenceIndex(0);
    }

    useEffect(() => {
        restart();
    }, [words]);

    return randomSentences && randomSentences[sentenceIndex] &&
        <>
            <FillBlank key={sentenceIndex} combinedSentence={randomSentences[sentenceIndex]} />
            <div style={{ marginTop: 30 }}>
                <Button variant="outlined"
                    sx={{ marginRight: 1 }}
                    startIcon={<ArrowRightIcon />}
                    color="secondary"
                    disabled={isLastSentence()}
                    onClick={handleNextSentenceClick}>
                    Next
                </Button>
                <span style={{ fontWeight: "bold", marginRight: 6 }}>{sentenceIndex + 1}/{randomSentences.length}</span>
                <IconButton color="secondary"
                    onClick={restart}>
                    <RestartAltIcon />
                </IconButton>
            </div>
        </>;
}

function FillBlank({ combinedSentence: { words, sentence } }: { combinedSentence: CombinedSentence }) {
    const theme = useTheme();

    const wordsRegex = new RegExp(`(${words.map(w => w.value).join("|")})`, "gi");
    const splittedParts = sentence.value.split(wordsRegex);
    return (<div>
        <AudioPlayer mediaUrl={sentence.mediaUrl} />
        <div style={{
            fontSize: 30,
            lineHeight: "75px",
            marginTop: 40,
            color: theme.palette.primary.main
        }}>
            {splittedParts.map((p, i) => {
                if (words.some(w => w.value.toLowerCase() === p.toLowerCase())) {
                    return <Blank key={p + i} word={p} />
                }

                return <span key={p + i}>{p}</span>
            })}
        </div>
    </div>
    );
}

function Blank({ word }: { word: string }) {
    const theme = useTheme();
    const { control, setValue, setFocus, watch } = useForm({
        defaultValues: {
            letters: Array.from(word).map(_ => ({ letter: "" }))
        }
    });

    const { fields } = useFieldArray({ control, name: "letters" });
    const letters = watch("letters");

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);


    const handleLetterKeyUp = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
        if (i >= word.length || e.key.length > 1) {
            return;
        }

        setValue(`letters.${i}.letter`, e.key)

        while (++i < word.length && isSpecialLetter(word[i])) {
        }

        if (i < word.length) {
            setFocus(`letters.${i}.letter`, { shouldSelect: false });
        }
    }

    const getBackgroundAt = (i: number) => {
        if (letters[i].letter) {
            return letters[i].letter === word[i] ? "darkseagreen" : "pink";
        }

        return "";
    }

    const isSpecialLetter = (c: string) => c === " " || c === "-" || c === "'";

    return (
        <form style={{ display: "inline-block" }}>
            {fields.map((v, i) => (
                isSpecialLetter(word[i])
                    ? <span key={i}
                        style={{ marginLeft: 5, marginRight: 5 }}>{word[i]}</span>
                    : <Controller
                        key={i}
                        control={control}
                        name={`letters.${i}.letter`}
                        render={({ field: { ref, ...f } }) => <TextField
                            inputRef={ref}
                            {...f}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            inputProps={{
                                maxLength: 1,
                                style: {
                                    fontSize: 30,
                                    caretColor: "transparent",
                                    cursor: "pointer",
                                    backgroundColor: getBackgroundAt(i),
                                    color: theme.palette.primary.main,
                                }
                            }}
                            style={{
                                width: 53
                            }}
                            onKeyUp={(e) => handleLetterKeyUp(e, i)}
                        ></TextField>}
                    />
            ))}
            <span style={{ position: "relative" }}>
                <IconButton style={{ position: "absolute", left: 0, top: -40 }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <InfoIcon />
                </IconButton>
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                >
                    <Typography sx={{
                        p: 2,
                        fontSize: 30,
                        color: theme.palette.info.light
                    }}>{word}</Typography>
                </Popover>
            </span>
        </form>
    );
}

function AudioPlayer({ mediaUrl }: { mediaUrl: string }) {
    const playerRef = useRef<ReactPlayer>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
    }

    const handlePause = () => {
        setIsPlaying(false);
    }

    const handleEnded = () => {
        setIsPlaying(false);
    }

    const handlePlayPauseButtonClick = () => {
        const internalPlayer = playerRef.current!.getInternalPlayer();
        if (isPlaying) {
            internalPlayer.pauseVideo();
        } else {
            internalPlayer.playVideo();
        }
    }

    return (<div style={{
        display: "flex",
        alignItems: "center",
        gap: 3
    }}>
        <div>Listen:</div>
        <YoutubePlayer playerRef={playerRef}
            url={mediaUrl}
            width={50}
            height={40}
            style={{ display: "inline-block", }}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
        />
        <IconButton color="error"
            size="large"
            onClick={handlePlayPauseButtonClick}>
            {isPlaying ? <PauseCircleIcon /> : <SmartDisplayIcon />}
        </IconButton>
    </div>);
}