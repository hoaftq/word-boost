import { IconButtonProps, IconButton, Card, CardActions, Stack, Collapse, styled } from "@mui/material";
import { BingTranslateReader } from "@wb/components/common/bing-translate-reader";
import { SentenceYoutubePlayer } from "@wb/components/common/sentence-youtube-player";
import { LoadingImage } from "@wb/components/loading-image";
import { Word } from "@wb/components/main";
import { useSelectionTranslator } from "@wb/utils/use-selection-translator";
import { useState } from "react";
import { SentenceTypography } from "../sentence-typography";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

export function SentenceCard({ word }: { word: Word }) {
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