Simple nodejs script to read prompts from csv file, create images from these prompts using [Imagine API](https://www.imagineapi.dev/), and log the results to an output file.

Usage:

1. Create `.env` file in project root.
2. Add all variables from `.env.example` with real values.
3. Build and the script `pnpm run restart`
4. Wait for the process to finish (follow console logs) and check the output log for urls of the images.

[Prompt CSV](./data/prompts.csv)

[Example Output JSON](./data/280920242002.json)
