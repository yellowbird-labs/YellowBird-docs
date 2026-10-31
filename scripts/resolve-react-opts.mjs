export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'astro:react:opts') {
    return {
      shortCircuit: true,
      url: new URL('./react-opts-stub.mjs', import.meta.url).href,
    };
  }
  return nextResolve(specifier, context);
}
