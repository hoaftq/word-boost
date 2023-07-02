import { Lesson } from "@wb/components/learning/lesson";
import lessonData from "./lesson-data.json";
import { Button, Dialog } from "@mui/material";
import { useState } from "react";

export default function Lessons() {
    const [open, setOpen] = useState(false);
    const [lesson, setLesson] = useState<Lesson>();

    const handleOpenDialogClick = (lesson: Lesson) => {
        setLesson(lesson);
        setOpen(true);
    }

    const handleEndClick = () => {
        setOpen(false);
    }

    return <>
        <h2>Lesson experiment</h2>
        {lessonData.lessons.map((l, i) => <Button key={l.name}
            style={{ display: "block" }}
            onClick={() => handleOpenDialogClick(l)}>{`${i + 1}. ${l.name}`}</Button>)}

        {lesson && <Dialog open={open} fullScreen>
            <Lesson lesson={lesson} onEnd={handleEndClick}></Lesson>
        </Dialog>}
    </>;
}