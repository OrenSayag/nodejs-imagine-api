import { config } from "dotenv";
import axios, { AxiosInstance } from "axios";
import { readInput } from "./methods/read-input";
import createImage from "./methods/create-image";
import * as fs from "node:fs";
import path from "node:path";

config();

const IMAGINE_API_BASE_URL = process.env["IMAGINE_API_BASE_URL"];
const IMAGINE_API_TOKEN = process.env["IMAGINE_API_TOKEN"];
const INPUT_FILE_PATH = process.env["INPUT_FILE_PATH"];
const OUTPUT_DIR_PATH = process.env["OUTPUT_DIR_PATH"];

const api: AxiosInstance = axios.create({
    baseURL: IMAGINE_API_BASE_URL,
    headers: {
        authorization: `Bearer ${IMAGINE_API_TOKEN}`,
    },
});

const main = async () => {
    try {
        const res: { prompt: string; urls: string[]; imagineApiId: string; createdAt: string }[] = [];
        const input = readInput({
            inputFilePath: INPUT_FILE_PATH,
        });
        console.log({ input });

        // Chunk the input data into batches of 10
        const chunks = chunkArray(input, 10);

        const {outputFilePath} = createOutputFile(OUTPUT_DIR_PATH)

        for (const chunk of chunks) {
            // Use Promise.all to send requests for the current batch in parallel
            const results = await Promise.all(
                chunk.map(async (record) => {
                    const urls = await createImage({
                        apiInstance: api,
                        prompt: record.prompt,
                    });
                    return {
                        prompt: record.prompt,
                        ...urls,
                        createdAt: new Date().toISOString(),
                    };
                })
            );

            // Add the results to the main response array and update the output file
            res.push(...results);
            updateOutputFile(outputFilePath, JSON.stringify(res, null, 2));
        }
    } catch (error) {
        console.log(error);
        console.log("FAILED");
        throw error;
    }
};

const formatDateTime = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}${month}${year}${hours}${minutes}`;
};

function createOutputFile(outputDirPath: string): {outputFilePath: string} {
    const outputFileName = `${formatDateTime(new Date())}.json`;
    const outputFilePath = path.join(outputDirPath, outputFileName)
    fs.writeFileSync(outputFilePath, '');
    return {
        outputFilePath
    }
}

function updateOutputFile(outputFilePath: string, data: string) {
    fs.writeFileSync(outputFilePath, data);
}

// Helper function to chunk the input array into smaller arrays of a specified size
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunkedArray: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
}

main();
