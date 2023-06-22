import { Paper } from "@mui/material";
import { Word } from "../word-list";
import { CombinedSentenceTypography } from "./sentence-typography";
import { combineSentences } from "@wb/utils/utils";

export function Sentences({ words }: { words: Word[] }) {
    const combinedSentences = combineSentences(words);

    return (
        <Paper elevation={3}
            sx={{
                padding: 1
            }}>
            {combinedSentences.map((s, i) => <CombinedSentenceTypography key={s.sentence.value}
                combinedSentence={s}
                variant="h4"
                component="div"
                color="primary"
                fontSize={50}
                fontWeight="bold"
                sx={{
                    marginX: 1,
                    marginY: 3
                }} />)}
        </Paper>
    );
}