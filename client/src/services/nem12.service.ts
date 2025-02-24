// ##TODO: TRPC does not support additional Content-Types that isn't JSON.
// Rely on a simple fetch request to accomodate this for now.
// https://github.com/trpc/trpc/issues/1937
export const uploadNEM12File = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("nem12", file);

  const response = await fetch(import.meta.env.VITE_BACKEND_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading file: " + response.statusText);
  }

  return response.json();
};
