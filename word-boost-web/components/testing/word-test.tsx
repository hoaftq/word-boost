import { useBlockingFetch } from "@wb/utils/blocking-fetch";
import getConfig from "next/config";
import { useEffect } from "react";
import { Word } from "../word-list";
import { Badge, Card, CardContent, CardMedia, Grid, useTheme } from "@mui/material";
import { useImmerReducer } from "use-immer";
import { DroppableBlank, DroppableWordPool, DraggingWordLayer } from "./word-dnd-components";
import { getRandomArray, shuffleArray } from "@wb/utils/utils";
import { initialState, testingReducer } from "./word-test-reducer";

type WordTestProps = {
    unit: string;
}
export function WordTest({ unit }: WordTestProps) {
    const { publicRuntimeConfig: { apiUrl } } = getConfig();
    const { blockingFetch, FetchingBackdrop } = useBlockingFetch();
    const [state, dispatch] = useImmerReducer(testingReducer, initialState);
    const theme = useTheme();

    let remainingWords = state.words.filter(w => state.blankWordIds.findIndex(wid => wid === w.id) < 0);
    remainingWords = shuffleArray(remainingWords);

    const getBlankWordAt = (position: number) => {
        const wordId = state.blankWordIds[position];
        return wordId ? state.words.find(w => w.id === wordId) : undefined;
    }

    useEffect(() => {
        blockingFetch(`${apiUrl}/words?unit=${unit}`)
            .then((rsp: Response) => rsp.json())
            .then((words: Word[]) => {
                dispatch({
                    type: "load-words",
                    payload: getRandomArray(words.filter(w => w.imageUrl), 6)
                });
            });
    }, []);

    const handleDropOnBank = (position: number, word: Word) => {
        dispatch({
            type: 'drop-on-blank',
            payload: {
                position,
                word
            }
        });
    }

    const handleDropOnPool = (word: Word) => {
        dispatch({
            type: 'drop-on-pool',
            payload: word
        });
    }

    const getStatusColor = (position: number, word: Word, forBadge: boolean) => {
        const droppedWordId = state.blankWordIds[position];
        if (!droppedWordId) {
            return forBadge ? theme.palette.secondary.light : "whitesmoke";
        }

        if (word.id == droppedWordId) {
            return theme.palette.success.light;
        }

        return theme.palette.error.light;
    }

    return <>
        <Grid container spacing={2} marginBottom={3}>
            {state.words.map((w, i) => <Grid key={w.id} item xs={4}>
                <Card sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    borderStyle: "solid",
                    borderWidth: 3,
                    borderColor: getStatusColor(i, w, false),
                }}>
                    <CardMedia image={w.imageUrl}
                        sx={{
                            width: "100%",
                            height: 150,
                            backgroundPosition: "center",
                            backgroundSize: "contain"
                        }} >
                    </CardMedia>
                    <CardContent sx={{ alignSelf: "stretch", padding: 0.5 }}>
                        <DroppableBlank
                            position={i}
                            word={getBlankWordAt(i)}
                            onDrop={handleDropOnBank} />
                    </CardContent>
                    <Badge badgeContent={i + 1}
                        sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            userSelect: "none",
                            "& .MuiBadge-badge": {
                                backgroundColor: getStatusColor(i, w, true),
                                fontWeight: "bold"
                            }
                        }}
                    ></Badge>
                </Card>
            </Grid>)}
        </Grid >
        <DroppableWordPool remainingWords={remainingWords} onDrop={handleDropOnPool} />
        <DraggingWordLayer />
        <FetchingBackdrop />
    </>;
}

