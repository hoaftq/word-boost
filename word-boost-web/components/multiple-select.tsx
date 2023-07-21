import { Checkbox, FormControl, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, SelectChangeEvent, SxProps, Theme } from "@mui/material";
import { SyntheticEvent, useId, useState } from "react";

type MultipleSelectProps = {
    label: string;
    formControllSx?: SxProps<Theme>;
    options: string[];
    onCloseWithChanges: (selectedValue: string[]) => void;
}

export function MultipleSelect({ label, formControllSx, options, onCloseWithChanges }: MultipleSelectProps) {
    const [selectedValue, setSelectedValue] = useState<string[]>([]);
    const [prevSelectedValue, setPrevSelectedValue] = useState<string[]>([]);
    const labelId = useId();

    const handleChange = (event: SelectChangeEvent<typeof selectedValue>) => {
        const { target: { value } } = event;
        const v = typeof value === 'string' ? value.split(',') : value;
        setSelectedValue(v);
    };

    function handleClose(event: SyntheticEvent<Element, Event>) {
        if (isEqual(selectedValue, prevSelectedValue, (t1, t2) => t1 === t2)) {
            return;
        }

        setPrevSelectedValue(selectedValue);
        onCloseWithChanges(selectedValue);
    }

    return (
        <FormControl size="small" sx={formControllSx} fullWidth>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
                labelId={labelId}
                multiple
                value={selectedValue}
                onChange={handleChange}
                onClose={handleClose}
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
    const [prevSelectedValue, setPrevSelectedValue] = useState<SelectionType[]>([]);
    const labelId = useId();

    function handleChange(event: SelectChangeEvent<string[]>) {
        const { target: { value } } = event;
        const selectedStrings = typeof value === 'string' ? value.split(',') : value;
        const selectedOptions = selectedStrings.map(optionString => JSON.parse(optionString) as SelectionType);
        setSelectedValue(selectedOptions);
    };

    function handleClose(event: SyntheticEvent<Element, Event>): void {
        if (isEqual(selectedValue, prevSelectedValue, (t1, t2) => t1.group === t2.group && t1.option === t2.option)) {
            return;
        }

        onCloseWithChanges(selectedValue);
        setPrevSelectedValue(selectedValue);
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

    // Reset selectedValue when groupOptions is changed
    const filteredSelectedValue = selectedValue.filter(v => groupOptions.some(go => go.group === v.group && go.options.indexOf(v.option) >= 0));
    if (!isEqual(filteredSelectedValue, selectedValue, (t1, t2) => t1.group == t2.group && t1.option === t2.option)) {
        setSelectedValue([]);
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

// There are no duplicated elements in each array
function isEqual<T>(arr1: T[], arr2: T[], isItemEqual: (t1: T, t2: T) => boolean) {
    return arr1.length === arr2.length
        && arr1.every(t1 => arr2.some(t2 => isItemEqual(t1, t2)));
}
