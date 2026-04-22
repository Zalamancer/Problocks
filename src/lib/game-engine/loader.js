/**
 * Playdemy Asset Loader
 * Loads glTF models with caching. Requires THREE.GLTFLoader from CDN.
 */
export function createLoader() {
  let gltfLoader = null;
  const cache = {}; // url → Promise<THREE.Group>

  function getLoader() {
    if (!gltfLoader) {
      gltfLoader = new THREE.GLTFLoader();
    }
    return gltfLoader;
  }

  return {
    /**
     * Load a glTF model. Returns a promise that resolves to a cloned THREE.Group.
     * Results are cached — subsequent loads of the same URL return clones.
     * @param {string} url — e.g. '/assets/medieval/Wall_Plaster_Straight.gltf'
     */
    loadModel(url) {
      if (!cache[url]) {
        cache[url] = new Promise((resolve, reject) => {
          getLoader().load(
            url,
            (gltf) => {
              // Enable shadows on all meshes
              gltf.scene.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              resolve(gltf.scene);
            },
            undefined,
            reject,
          );
        });
      }
      // Always return a clone so each instance is independent
      return cache[url].then((original) => original.clone());
    },

    /**
     * Preload multiple models in parallel
     * @param {string[]} urls
     */
    preload(urls) {
      return Promise.all(urls.map(url => this.loadModel(url)));
    },

    /**
     * Convenience: load a medieval village model by name
     * @param {string} name — e.g. 'Wall_Plaster_Straight' (without path/extension)
     */
    medieval(name) {
      return this.loadModel('/assets/medieval/' + name + '.gltf');
    },
  };
}
