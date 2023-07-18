import { useDrag, useDragLayer, useDrop } from "react-dnd";
import { Word } from "../main";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Chip, Stack } from "@mui/material";

const wordDraggingType = "word-chip";

export function DraggableWordChip({ word }: { word: Word }) {
    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: wordDraggingType,
        item: { word },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [word]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    });

    return (
        <Chip
            label={word.value}
            color="info"
            variant={isDragging ? "outlined" : "filled"}
            sx={{
                fontSize: 40,
                padding: 2.7,
                cursor: "move",
                userSelect: "none"
            }}
            ref={dragRef}
        ></Chip>
    );
}

type DroppableBlankProps = {
    position: number;
    word?: Word;
    onDrop: (position: number, word: Word) => void;
}
export function DroppableBlank({ position, word, onDrop }: DroppableBlankProps) {
    const [{ canDrop }, dropRef] = useDrop(() => ({
        accept: wordDraggingType,
        collect: (monitor) => ({
            canDrop: monitor.canDrop()
        }),
        drop: (item: { word: Word }) => {
            onDrop(position, item.word);
        }
    }), [position]);

    return <div ref={dropRef}
        style={{
            width: "100%",
            height: 45,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            backgroundColor: canDrop ? "lightblue" : "whitesmoke"
        }}>
        {word && <DraggableWordChip word={word}></DraggableWordChip>}
    </div>;
}

type DroppableWordPoolProps = {
    remainingWords: Word[];
    onDrop: (word: Word) => void;
}
export function DroppableWordPool({ remainingWords, onDrop }: DroppableWordPoolProps) {
    const [{ canDrop }, dropRef] = useDrop(() => ({
        accept: wordDraggingType,
        collect: (monitor) => ({
            canDrop: monitor.canDrop()
        }),
        drop: (item: { word: Word }) => { onDrop(item.word); }
    }));

    return <Stack ref={dropRef}
        direction={"row"}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
        sx={{
            backgroundColor: canDrop ? "lightblue" : "whitesmoke",
            borderRadius: 2,
            minHeight: 35,
            padding: 3
        }}
    >
        {remainingWords.map((w) => <DraggableWordChip key={w.id} word={w} />)}
    </Stack>
}

export function DraggingWordLayer() {
    const { isDragging, item, sourceClientOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        sourceClientOffset: monitor.getSourceClientOffset()
    }));

    if (!isDragging) {
        return null;
    }

    return (
        <Chip
            label={item.word.value}
            color="info"
            variant="filled"
            sx={{
                fontSize: 40,
                padding: 2.7,
                cursor: "move",
                userSelect: "none",
                pointerEvents: "none",
                position: "fixed",
                left: sourceClientOffset?.x,
                top: sourceClientOffset?.y,
                zIndex: 100
            }}
        ></Chip>
    );
}