import {parse} from 'csv-parse/sync';
import * as fs from 'node:fs';

type Input = {
    inputFilePath: string;
};

type Output = { prompt: string }[];

export const readInput = ({inputFilePath}: Input): Output => {
    const input = fs.readFileSync(inputFilePath, 'utf8');
    const records = parse(input, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        encoding: 'utf8',
    });

    console.log({records})
    if (!records.every(r => r.prompt)) {
        throw new Error("Input validation error. Missing 'prompt' cell value.")
    }

    return records;
};
