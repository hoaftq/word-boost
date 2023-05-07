import { Box, Chip, Stack } from "@mui/material";
import { Word } from "@wb/components/word-list";

export function AllWords({ words }: { words: Word[] }) {
    return (
        <Stack direction={"row"} flexWrap={"wrap"}>
            {words.map((w, i) => (
                <Box key={w.id} padding={2}>
                    <Chip label={`${i + 1}. ${w.value}`}
                        clickable
                        sx={{ fontSize: 30, p: 4 }}
                        color="primary"
                    />
                </Box>
            ))}
        </Stack>
    );
}