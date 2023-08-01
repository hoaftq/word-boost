import { Box, Chip, Popover, Stack } from "@mui/material";
import { Word } from "@wb/components/main";
import { useState, MouseEvent } from "react";
import { LoadingImage } from "../loading-image";
import { BingTranslateReader } from "../common/bing-translate-reader";

export function AllWords({ words }: { words: Word[] }) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = !!anchorEl;

    const [selectedWord, setSelectedWord] = useState<Word>();
    const [focusWordId, setFocusWordId] = useState<string | null>(null);

    const handleChipClick = (e: MouseEvent<HTMLDivElement>, word: Word) => {
        setAnchorEl(e.currentTarget);
        setSelectedWord(word);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleMouseOver = (wordId: string) => {
        setFocusWordId(wordId);
    }

    return (
        <Stack direction={"row"} flexWrap={"wrap"}>
            {words.map((w, i) => (
                <Stack key={w.id} direction="row" padding={2}>
                    <Chip label={`${i + 1}. ${w.value}`}
                        clickable
                        sx={{ fontSize: 50, p: 4 }}
                        color="primary"
                        onMouseOver={() => handleMouseOver(w.id)}
                        onClick={(e) => handleChipClick(e, w)}
                    />
                    {w.id === focusWordId && <div style={{
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <BingTranslateReader text={w.value} />
                    </div>}
                </Stack>
            ))}
            {selectedWord?.imageUrl && <Popover
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                onClose={handleClose}
                onClick={handleClose}
            >
                <Box sx={{
                    width: "min(450px, 100vw)",
                    height: 300,
                    paddingY: 1
                }}>
                    <LoadingImage imageUrl={selectedWord.imageUrl} />
                </Box>
            </Popover>}
        </Stack>
    );
}