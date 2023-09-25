const fetcher = async (url: string) => {
  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.error.message || 'An error occurred while fetching the data'
    );
  }

  return json;
};

export default fetcher;
