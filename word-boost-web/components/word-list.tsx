import { Chip, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import getConfig from "next/config";
import { useEffect, useState } from "react";


interface Word {
    id: string;
    value: string;
    unit: string;
    course: string;
}

export function WordList() {
    const { publicRuntimeConfig: { apiUrl } } = getConfig();

    const [units, setUnits] = useState([] as string[]);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [words, setWords] = useState([] as Word[]);

    useEffect(() => {
        fetch(`${apiUrl}/units`)
            .then(rsp => rsp.json())
            .then((units: string[]) => { setUnits(units); })
    }, [apiUrl]);

    const handleUnitChange = (e: SelectChangeEvent) => {
        const unit = e.target.value;
        setSelectedUnit(unit);

        fetch(`${apiUrl}/words?unit=${unit}`)
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