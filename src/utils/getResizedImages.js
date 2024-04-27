export default async (imageFiles) => {
  const resizedImages = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const bitmap = await createImageBitmap(imageFiles[i]);
    let maxwidth = bitmap.width;
    let maxheight = bitmap.height;

    if (bitmap.width > 300 || bitmap.height > 300) {
      maxwidth = 300;
      const scaleSize = maxwidth / bitmap.width;
      maxheight = bitmap.height * scaleSize;
    }
    const canvas = document.createElement("canvas");
    canvas.width = maxwidth;
    canvas.height = maxheight;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const base64Str = ctx.canvas.toDataURL("image/jpeg", 0.8);
    resizedImages.push(base64Str);
  }

  return resizedImages;
};

export const embeddedResized = async (imageFiles) => {
  const resizedImages = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const bitmap = await createImageBitmap(imageFiles[i]);
    let maxwidth = bitmap.width;
    let maxheight = bitmap.height;

    if (bitmap.height > 400) {
      maxheight = 400;
      const scaleSize = maxheight / bitmap.height;
      maxwidth = bitmap.width * scaleSize;
    }

    const canvas = document.createElement("canvas");
    canvas.width = maxwidth;
    canvas.height = maxheight;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const base64Str = ctx.canvas.toDataURL("image/jpeg", 0.8);
    resizedImages.push(base64Str);
  }

  return resizedImages;
};
