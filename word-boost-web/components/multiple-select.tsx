import { Checkbox, FormControl, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, SelectChangeEvent, SxProps, Theme } from "@mui/material";
import { SyntheticEvent, useId, useState } from "react";

type MultipleSelectProps = {
    label: string;
    formControllSx?: SxProps<Theme>;
    options: string[];
    onChange: (selectedValue: string[]) => void;
}

export function MultipleSelect({ label, formControllSx, options, onChange }: MultipleSelectProps) {
    const [selectedValue, setSelectedValue] = useState<string[]>([]);
    const labelId = useId();

    const handleChange = (event: SelectChangeEvent<typeof selectedValue>) => {
        const { target: { value } } = event;
        const v = typeof value === 'string' ? value.split(',') : value;
        onChange(v);
        setSelectedValue(v);
    };

    return (
        <FormControl size="small" sx={formControllSx} fullWidth>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                multiple
                value={selectedValue}
                onChange={handleChange}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => selected.join(', ')}
            >
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        <Checkbox checked={selectedValue.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}


export type GroupOptions = {
    group: string;
    options: string[]
};

export type SelectionType = {
    group: string;
    option: string;
}

type MultipleSMultipleGroupedSelectProps = {
    label: string;
    formControllSx?: SxProps<Theme>;
    groupOptions: GroupOptions[];
    onCloseWithChanges: (selectedValue: SelectionType[]) => void;
}

export function MultipleGroupedSelect({ label, formControllSx, groupOptions, onCloseWithChanges }: MultipleSMultipleGroupedSelectProps) {
    const [selectedValue, setSelectedValue] = useState<SelectionType[]>([]);
    const [isChanged, setIsChanged] = useState(false);
    const labelId = useId();

    function handleChange(event: SelectChangeEvent<string[]>) {
        const { target: { value } } = event;
        const selectedStrings = typeof value === 'string' ? value.split(',') : value;
        const selectedOptions = selectedStrings.map(optionString => JSON.parse(optionString) as SelectionType);
        setSelectedValue(selectedOptions);
        setIsChanged(true);
    };

    function handleClose(event: SyntheticEvent<Element, Event>): void {
        if (!isChanged) {
            return;
        }

        onCloseWithChanges(selectedValue);
        setIsChanged(false);
    }

    function createItems() {
        return groupOptions.flatMap((go) => [
            <ListSubheader key={go.group}>{go.group}</ListSubheader>,
            ...go.options.flatMap(o =>
                <MenuItem key={`${go.group}|${o}`} value={JSON.stringify({ group: go.group, option: o })}>
                    <Checkbox checked={selectedValue.some(v => v.group === go.group && v.option === o)} />
                    <ListItemText primary={o} />
                </MenuItem >)
        ]);
    }

    return (
        <FormControl size="small" sx={formControllSx} fullWidth>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                multiple
                value={selectedValue.map(v => JSON.stringify(v))}
                onChange={handleChange}
                onClose={handleClose}
                input={<OutlinedInput label={label} />}
                renderValue={(selected) => selected.map(v => (JSON.parse(v) as SelectionType).option).join(", ")}
            >
                {createItems()}
            </Select>
        </FormControl>
    );
}