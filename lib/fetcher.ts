import axios from 'axios';

const fetcher = async (url: string) => {
  try {
    const { data } = await axios.get(url);

    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.error?.message || 'Something went wrong';

    throw new Error(message);
  }
};

export default fetcher;
