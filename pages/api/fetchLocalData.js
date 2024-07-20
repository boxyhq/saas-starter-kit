import { localApi } from '../../Utils/axios.config';

export default async function handler(req, res) {
  try {
    const { data } = await localApi.get('http://localhost:4002');
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
