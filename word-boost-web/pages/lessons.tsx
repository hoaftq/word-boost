import { AutoLesson } from "@wb/components/learning/lesson/auto-lesson";
import lessonData from "./lesson-data.json";
import { Button, Dialog } from "@mui/material";
import { useState } from "react";

export default function Lessons() {
    const [open, setOpen] = useState(false);
    const [lesson, setLesson] = useState<AutoLesson>();

    const handleOpenDialogClick = (lesson: AutoLesson) => {
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
            <AutoLesson lesson={lesson} onEnd={handleEndClick}></AutoLesson>
        </Dialog>}
    </>;
}