import { Word } from "../main";
import { IconButton, Popover, TextField, Typography, useTheme } from "@mui/material";
import { useState, KeyboardEvent, useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Sentence } from "@wb/pages/add-word";
import InfoIcon from '@mui/icons-material/Info';
import { Cheerleader, CheerleaderStatus } from "./cheerleader";
import { AudioPlayer } from "../common/sentence-audio-player";
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { Navigator } from "../common/navigator";
import { useSelectionTranslator } from "@wb/utils/use-selection-translator";
import { BingTranslateReader } from "../common/bing-translate-reader";

export type CombinedSentence = {
    sentence: Sentence;
    words: Word[]
}

export function FillBlankTest({ words }: { words: Word[] }) {
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [cheerleaderStatus, setCheerleaderStatus] = useState<CheerleaderStatus>("doing");

    const sentences = useMemo(() => {
        return words
            .filter(w => w.value)
            .flatMap(w => w.sentences.filter(s => s.value).map(s => ({
                sentence: s,
                words: [w]
            })));
    }, [words]);

    const handlePrevSentenceClick = () => {
        setSentenceIndex(sentenceIndex - 1);
        setCheerleaderStatus("doing");
    }

    const handleNextSentenceClick = () => {
        setSentenceIndex(sentenceIndex + 1);
        setCheerleaderStatus("doing");
    }

    const restart = () => {
        setSentenceIndex(0);
        setCheerleaderStatus("doing");
    }

    const handleBlankChange = (isAllCorrect: boolean, isCurrentCorrect?: boolean) => {
        let status: CheerleaderStatus = "doing";
        if (isAllCorrect) {
            status = "success"
        } else if (isCurrentCorrect) {
            status = "correct";
        } else if (isCurrentCorrect === false) {
            status = "wrong"
        }

        setCheerleaderStatus(status);
    }

    useEffect(() => {
        restart();
    }, [words]);

    return sentences && sentences[sentenceIndex] &&
        <>
            <FillBlanks key={sentenceIndex}
                combinedSentence={sentences[sentenceIndex]}
                onBlankChange={handleBlankChange}
            />
            <div style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end"
            }}>
                <Navigator index={sentenceIndex}
                    total={sentences.length}
                    onPrev={handlePrevSentenceClick}
                    onNext={handleNextSentenceClick}
                    onRestart={restart} />
                <Cheerleader status={cheerleaderStatus} />
            </div>
        </>;
}

type FillBlanksProps = {
    combinedSentence: CombinedSentence;
    onBlankChange: (isAllCorrect: boolean, isCurrentCorrect?: boolean) => void;
}

function FillBlanks({ combinedSentence: { words, sentence }, onBlankChange }: FillBlanksProps) {
    const theme = useTheme();
    const { onMouseUpCapture, TranslatorPopover } = useSelectionTranslator();

    const wordsRegex = new RegExp(`(${words.map(w => w.value).join("|")})`, "gi");
    const splittedParts = sentence.value.split(wordsRegex);
    return (<div onMouseUpCapture={onMouseUpCapture}>
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 3
        }}>
            <HeadphonesIcon fontSize="large" color="info" />
            <Typography variant="h4" marginRight={2}>Listen:</Typography>
            {sentence.mediaUrl && <AudioPlayer videoUrl={sentence.mediaUrl} />}
            <BingTranslateReader text={sentence.value} />
        </div>
        <div style={{
            fontSize: 50,
            lineHeight: "100px",
            marginTop: 40,
            color: theme.palette.primary.main
        }}>
            {splittedParts.map((p, i) => {
                if (words.some(w => w.value.toLowerCase() === p.toLowerCase())) {
                    return <Blanks key={p + i}
                        word={p}
                        onChange={(isAllCorrect, isCurrentCorrect) => onBlankChange(isAllCorrect, isCurrentCorrect)}
                    />
                }

                return <span key={p + i}>{p}</span>
            })}
        </div>
        <Cheerleader status="not_started" />
        <TranslatorPopover />
    </div>
    );
}

type BlanksProps = {
    word: string;
    onChange: (isAllCorrect: boolean, isCurrentCorrect?: boolean) => void
}

function Blanks({ word, onChange }: BlanksProps) {
    const theme = useTheme();
    const { control, setValue, setFocus, watch } = useForm({
        defaultValues: {
            letters: Array.from(word).map(_ => ({ letter: "" }))
        }
    });

    const { fields } = useFieldArray({ control, name: "letters" });
    const letters = watch("letters");

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // Override the current letter without caring about the cursor position or whether the text is selected
    const handleLetterKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
        if (e.key.length === 1) {
            setValue(`letters.${i}.letter`, i === 0 ? e.key : e.key.toLocaleLowerCase());
        } else if (e.key == "Backspace") {
            setValue(`letters.${i}.letter`, "");
        }
    }

    const handleLetterKeyUp = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
        onChange(letters.map(l => l.letter).join("") === word,
            !letters[i].letter ? undefined : letters[i].letter === word[i]);

        if (e.key.length === 1) {
            while (++i < word.length && isSpecialLetter(word[i])) { }
            if (i < word.length) {
                setFocus(`letters.${i}.letter`, { shouldSelect: false });
            }
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
                                    fontSize: 50,
                                    caretColor: "transparent",
                                    cursor: "pointer",
                                    backgroundColor: getBackgroundAt(i),
                                    color: theme.palette.primary.main,
                                }
                            }}
                            style={{
                                width: 70
                            }}
                            onKeyDown={(e) => handleLetterKeyDown(e, i)}
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
                        fontSize: 50,
                        color: theme.palette.info.light
                    }}>{word}</Typography>
                </Popover>
            </span>
        </form>
    );
}