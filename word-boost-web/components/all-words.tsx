import { Box, Chip, Popover, Stack } from "@mui/material";
import { Word } from "@wb/components/word-list";
import { useState, MouseEvent } from "react";
import { LoadingImage } from "./loading-image";

export function AllWords({ words }: { words: Word[] }) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const open = !!anchorEl;

    const [selectedWord, setSelectedWord] = useState<Word>();

    const handleChipClick = (e: MouseEvent<HTMLDivElement>, word: Word) => {
        setAnchorEl(e.currentTarget);
        setSelectedWord(word);
    }

    const handleClose = () => {
        setAnchorEl(undefined);
    }

    return (
        <Stack direction={"row"} flexWrap={"wrap"}>
            {words.map((w, i) => (
                <Box key={w.id} padding={2}>
                    <Chip label={`${i + 1}. ${w.value}`}
                        clickable
                        sx={{ fontSize: 30, p: 4 }}
                        color="primary"
                        onClick={(e) => handleChipClick(e, w)}
                    />
                </Box>
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
                    width: 600,
                    height: 300,
                }}>
                    <LoadingImage imageUrl={selectedWord.imageUrl} />
                </Box>
            </Popover>}
        </Stack>
    );
}