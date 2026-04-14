// Minecraft Bedrock biome IDs → warna
export const BIOME_COLORS = {
  0:   [106, 127,  75, 255], // ocean
  1:   [106, 127,  75, 255], // plains
  2:   [219, 207, 163, 255], // desert
  3:   [100, 115,  60, 255], // windswept hills
  4:   [ 89, 118,  51, 255], // forest
  5:   [ 54,  78,  37, 255], // taiga
  6:   [ 99,  84,  74, 255], // swamp
  7:   [ 63, 118, 228, 255], // river
  10:  [ 30,  60, 120, 255], // frozen ocean
  11:  [ 80, 110, 180, 255], // frozen river
  12:  [235, 240, 245, 255], // snowy plains
  21:  [ 67, 136,  47, 255], // jungle
  23:  [ 67, 136,  47, 255], // sparse jungle
  24:  [ 50, 100, 180, 255], // deep ocean
  25:  [219, 207, 163, 255], // stony shore
  26:  [220, 230, 240, 255], // snowy beach
  27:  [128, 167,  85, 255], // birch forest
  29:  [ 60,  88,  30, 255], // dark forest
  30:  [ 54,  78,  37, 255], // snowy taiga
  35:  [190, 180, 100, 255], // savanna
  37:  [200, 120,  50, 255], // badlands
  46:  [148, 196, 228, 255], // stony peaks
  177: [ 97,  36,  35, 255], // nether wastes
  178: [ 78,  62,  50, 255], // soul sand valley
  179: [143,  28,  28, 255], // crimson forest
  180: [ 22, 119, 104, 255], // warped forest
  181: [ 71,  71,  78, 255], // basalt deltas
  182: [207, 200, 120, 255], // the end
}

export function biomeColor(biomeId) {
  return BIOME_COLORS[biomeId] ?? FALLBACK
}