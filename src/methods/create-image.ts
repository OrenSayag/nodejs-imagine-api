import { AxiosInstance } from 'axios';

type Input = {
  prompt: string;
  apiInstance: AxiosInstance;
};

type Output = Promise<{ urls: string[]; imagineApiId: string }>;

const createImage = async ({ apiInstance, prompt }: Input): Output => {
  const res = await apiInstance.post('items/images/', {
    prompt,
  });
  const data = res.data;
  const id = data['data']['id'];
  console.log({ data, id });
  const urls = await pollImageCreationStatus({
    apiInstance,
    imageId: id,
  });
  return { urls, imagineApiId: id };
};

export default createImage;

enum ImageCreationStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
}

async function pollImageCreationStatus({
  apiInstance,
  imageId,
}: {
  imageId: string;
  apiInstance: AxiosInstance;
}): Promise<string[]> {
  console.log(`Polling for image creation status for id ${imageId}`);
  const res = await apiInstance.get(`items/images/${imageId}`);
  const status: ImageCreationStatus = res.data['data']['status'];
  const urls: string[] = res.data['data']['upscaled_urls'];
  switch (status) {
    case ImageCreationStatus.COMPLETED:
      console.log('Job is done!');
      console.log(urls);
      return urls;
    case ImageCreationStatus.PENDING:
    case ImageCreationStatus.IN_PROGRESS:
      console.log(`Job is ${status}. Waiting.`);
      await new Promise((res) => setTimeout(() => res('OK'), 10_000));
      console.log('Finished waiting.');
      return await pollImageCreationStatus({ apiInstance, imageId });
    case ImageCreationStatus.FAILED:
      console.log('Job failed.');
      console.log({
        data: res.data,
      });
      throw new Error(
        `Image creation job FAILED ${imageId}`
      );
    default:
      console.log({ data: res.data });
      throw new Error(
        `Image creation job FAILED ${imageId}`
      );
  }
}
