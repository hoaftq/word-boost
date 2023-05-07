import { Stack, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Word } from "./word-list";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Image from "next/image";

export function OneWord({ words, initialImageVisible }: { words: Word[], initialImageVisible: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageVisible, setImageVisible] = useState(initialImageVisible);

    const isFirstWord = currentIndex == 0;
    const isLastWord = currentIndex == words.length - 1;
    const currentWord = words[currentIndex];

    const handleNext = () => {
        if (isLastWord) {
            return;
        }

        updateCurrentIndex(currentIndex + 1);
    }

    const handlePrevious = () => {
        if (isFirstWord) {
            return;
        }

        updateCurrentIndex(currentIndex - 1);
    }

    const handleWordClick = () => {
        setImageVisible(!imageVisible);
    }

    const updateCurrentIndex = (index: number) => {
        setCurrentIndex(index);
        setImageVisible(initialImageVisible);
    };

    useEffect(() => {
        updateCurrentIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    return (
        <Stack direction={"column"} alignItems={"center"}>
            <div style={{ width: "100%", height: 300, position: "relative" }}>
                {imageVisible && <Image src={currentWord?.imageUrl ?? ""}
                    alt=""
                    style={{ objectFit: 'contain' }}
                    fill={true}
                />}
            </div>
            <Chip key={currentWord?.id}
                label={currentWord?.value}
                clickable
                color="primary"
                sx={{ marginTop: 1, marginBottom: 3, fontSize: 30, p: 3 }}
                onClick={handleWordClick}
            />
            <div style={{ marginBottom: 10, fontWeight: 'bold' }}>{currentIndex + 1}/{words.length}
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