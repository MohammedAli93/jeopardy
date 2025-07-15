export function fitToSize(
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
  options: { max: boolean } = { max: false }
) {
  let scale: number;
  if (options.max) {
    scale = Math.max(containerWidth / width, containerHeight / height);
  } else {
    scale = Math.min(containerWidth / width, containerHeight / height);
  }
  return {
    scale,
    width: width * scale,
    height: height * scale,
  };
}
