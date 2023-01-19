import axios from 'axios';

const fetcher = async (url: string) =>
  await axios.get(url).then((res) => res.data);

export default fetcher;
