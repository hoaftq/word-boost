import { Stack, Button, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { Word } from "../../main";
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import AbcIcon from '@mui/icons-material/Abc';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { WordCard, WordCardMode } from "./word-card";
import { SentenceCard } from "./sentence-card";

export function FlashCard({ words, initialShowAll, mode }: { words: Word[], initialShowAll: boolean, mode: WordCardMode }) {
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
