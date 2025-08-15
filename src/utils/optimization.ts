const SKIP_TEXTURES = ["__DEFAULT", "__MISSING", "__NORMAL", "__WHITE"];

export function releaseTextures(
  texturesManager: Phaser.Textures.TextureManager,
  prefix?: string | string[]
) {
  const textures = Object.keys(texturesManager.list);
  let count = 0;
  for (const texture of textures) {
    if (SKIP_TEXTURES.includes(texture)) continue;
    if (prefix) {
      if (Array.isArray(prefix)) {
        if (!prefix.some((p) => texture.startsWith(p))) continue;
      } else {
        if (!texture.startsWith(prefix)) continue;
      }
    }
    texturesManager.remove(texture);
    count++;
    console.log(`Removed texture '${texture}'`);
  }
  return count;
}

export function attachAutoReleaseTexturesEventToScene(
  scene: Phaser.Scene,
  prefix?: string | string[]
) {
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    const count = releaseTextures(scene.textures, prefix);
    console.log(`Released ${count} textures from scene '${scene.scene.key}'`);
    console.log(scene.textures.list);
  });
}
