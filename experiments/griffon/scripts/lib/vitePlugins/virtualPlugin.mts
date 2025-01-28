import { Plugin } from "vite";

// port(justinvdm, 3 Dec 2024): From https://github.com/hi-ogawa/vite-environment-examples/blob/440212b4208fc66a14d69a1bcbc7c5254b7daa91/examples/react-server/src/features/utils/plugin.ts#L37
export function virtualPlugin(name: string, load: Plugin["load"]) {
  name = "virtual:" + name;
  return {
    name: `virtual-${name}`,
    resolveId(source, _importer, _options) {
      if (source === name || source.startsWith(`${name}?`)) {
        return `\0${source}`;
      }
      return;
    },
    load(id, options) {
      if (id === `\0${name}` || id.startsWith(`\0${name}?`)) {
        return (load as any).apply(this, [id, options]);
      }
    },
  } satisfies Plugin;
}
