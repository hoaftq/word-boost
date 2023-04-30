import { Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:3000";

interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
}

export function WordList() {

    const [units, setUnits] = useState([] as string[]);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [words, setWords] = useState([] as Word[]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/units`)
            .then(rsp => rsp.json())
            .then((units: string[]) => { setUnits(units); })
    }, []);

    const handleUnitChange = (e: SelectChangeEvent) => {
        const unit = e.target.value;
        setSelectedUnit(unit);

        fetch(`${API_BASE_URL}/words?unit=${unit}`)
            .then(rsp => rsp.json())
            .then((words: Word[]) => { setWords(words); });
    }

    return (
        <>
            <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="unit">Unit</InputLabel>
                <Select
                    labelId="unit"
                    value={selectedUnit}
                    label="Unit"
                    onChange={handleUnitChange}
                >
                    {units.map(u => (
                        <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}

                </Select>
            </FormControl>
            <Stack direction={"row"} spacing={5} marginTop={5} flexWrap={"wrap"}>
                {words.map((w, i) => (
                    <Chip key={w.id}
                        label={`${i + 1}. ${w.value}`}
                        sx={{ height: 'auto', color: 'red', fontSize: 30, padding: 2 }} />
                ))}
            </Stack>
        </>
    );
}