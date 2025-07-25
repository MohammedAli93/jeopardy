export function projection3DTo2D(
  point: { x: number; y: number; z: number },
  camera: { x: number; y: number; z: number },
  screenWidth: number,
  screenHeight: number
) {
  const x3D = point.x - camera.x;
  const y3D = point.y - camera.y;
  const z3D = point.z - camera.z;

  if (z3D <= 0.1) return null;

  const focalLength = 1.0;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  // const xScreen = centerX + (x3D / z3D) * focalLength * centerX;
  // const yScreen = centerY - (y3D / z3D) * focalLength * centerX;

  const aspect = screenWidth / screenHeight;
  const xScreen = centerX + (x3D / z3D) * focalLength * centerX;
  const yScreen = centerY - ((y3D / z3D) * focalLength * centerX) / aspect;

  return { x: xScreen, y: yScreen };
}

type PhaserGameObject = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.Visible;
type Point3D = { x: number; y: number; z: number };
export function update3DGameObject(
  gameObject: PhaserGameObject,
  point: Point3D,
  camera: Point3D
) {
  const screenPos = projection3DTo2D(
    point,
    camera,
    gameObject.scene.scale.width,
    gameObject.scene.scale.height
  );
  gameObject.setVisible(!!screenPos);
  if (screenPos) {
    gameObject.setPosition(screenPos.x, screenPos.y);
    const z = point.z - camera.z;
    gameObject.setScale(1 / z);
  }
}

export function convert2DTo3D(
  point2D: { x: number; y: number },
  screenWidth: number,
  screenHeight: number
): { x: number; y: number; z: number } {
  const xNormalized = (point2D.x / screenWidth) * 2 - 1;
  const yNormalized = 1 - (point2D.y / screenHeight) * 2;
  const z = 0;

  return { x: xNormalized, y: yNormalized, z };
}
