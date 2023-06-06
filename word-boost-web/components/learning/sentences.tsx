import { Paper } from "@mui/material";
import { Word } from "../word-list";
import { SentenceTypography } from "./sentence-typography";

export function Sentences({ words }: { words: Word[] }) {
    return (<>
        {words.filter(w => w.sentences.length).map(w => <Paper key={w.id}
            elevation={3}
            sx={{
                marginBottom: 2,
                padding: 1
            }}
        >
            {w.sentences.map((s, i) => <SentenceTypography key={s.value}
                word={w}
                sentenceIndex={i}
                variant="h4"
                color="primary"
                fontWeight="bold"
                sx={{ marginBottom: 1 }}
            />)}
        </Paper>)}
    </>);
}