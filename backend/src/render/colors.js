/**
 * colors.js — port of render/colors.go
 *
 * Maps Minecraft block names → RGBA for top-down map rendering.
 * [r, g, b, a]
 */

const BLOCK_COLORS = {
  // Terrain
  'minecraft:grass':              [106, 127,  75, 255],
  'minecraft:grass_block':        [106, 127,  75, 255],
  'minecraft:dirt':               [134,  96,  67, 255],
  'minecraft:stone':              [128, 128, 128, 255],
  'minecraft:deepslate':          [ 84,  84,  98, 255],
  'minecraft:gravel':             [162, 154, 148, 255],
  'minecraft:sand':               [219, 207, 163, 255],
  'minecraft:sandstone':          [210, 196, 152, 255],
  'minecraft:bedrock':            [ 50,  50,  50, 255],
  'minecraft:cobblestone':        [115, 115, 115, 255],

  // Water / Liquid
  'minecraft:water':              [ 63, 118, 228, 200],
  'minecraft:flowing_water':      [ 63, 118, 228, 200],
  'minecraft:lava':               [207,  87,  14, 255],
  'minecraft:flowing_lava':       [207,  87,  14, 255],

  // Wood / Logs
  'minecraft:oak_log':            [107,  85,  52, 255],
  'minecraft:birch_log':          [216, 208, 180, 255],
  'minecraft:spruce_log':         [ 75,  53,  31, 255],
  'minecraft:jungle_log':         [ 98,  77,  38, 255],
  'minecraft:acacia_log':         [168,  90,  50, 255],
  'minecraft:dark_oak_log':       [ 60,  40,  17, 255],
  'minecraft:mangrove_log':       [ 75,  35,  30, 255],
  'minecraft:cherry_log':         [ 90,  40,  50, 255],

  // Leaves
  'minecraft:oak_leaves':         [ 89, 118,  51, 200],
  'minecraft:birch_leaves':       [128, 167,  85, 200],
  'minecraft:spruce_leaves':      [ 54,  78,  37, 200],
  'minecraft:jungle_leaves':      [ 67, 136,  47, 200],
  'minecraft:acacia_leaves':      [ 84, 116,  43, 200],
  'minecraft:dark_oak_leaves':    [ 60,  88,  30, 200],
  'minecraft:mangrove_leaves':    [ 66, 100,  40, 200],
  'minecraft:cherry_leaves':      [220, 130, 160, 200],
  'minecraft:azalea_leaves':      [ 96, 130,  60, 200],

  // Snow / Ice
  'minecraft:snow':               [235, 240, 245, 255],
  'minecraft:snow_layer':         [220, 230, 240, 255],
  'minecraft:ice':                [165, 205, 230, 200],
  'minecraft:packed_ice':         [148, 196, 228, 255],
  'minecraft:blue_ice':           [118, 178, 230, 255],
  'minecraft:frosted_ice':        [155, 205, 235, 255],

  // Ocean floor
  'minecraft:clay':               [170, 173, 184, 255],
  'minecraft:mud':                [ 99,  84,  74, 255],
  'minecraft:muddy_mangrove_roots':[ 95,  76,  60, 255],

  // Ores
  'minecraft:coal_ore':           [ 80,  80,  80, 255],
  'minecraft:iron_ore':           [145, 116, 100, 255],
  'minecraft:gold_ore':           [200, 170,  50, 255],
  'minecraft:diamond_ore':        [ 80, 200, 210, 255],
  'minecraft:emerald_ore':        [ 50, 180,  90, 255],
  'minecraft:lapis_ore':          [ 50,  80, 170, 255],
  'minecraft:redstone_ore':       [180,  50,  50, 255],

  // Nether
  'minecraft:netherrack':         [ 97,  36,  35, 255],
  'minecraft:nether_brick':       [ 57,  21,  21, 255],
  'minecraft:soul_sand':          [ 78,  62,  50, 255],
  'minecraft:soul_soil':          [ 68,  55,  44, 255],
  'minecraft:basalt':             [ 71,  71,  78, 255],
  'minecraft:blackstone':         [ 42,  37,  45, 255],
  'minecraft:crimson_nylium':     [143,  28,  28, 255],
  'minecraft:warped_nylium':      [ 22, 119, 104, 255],
  'minecraft:glowstone':          [226, 196, 108, 255],
  'minecraft:shroomlight':        [234, 181, 100, 255],
  'minecraft:magma':              [151,  67,  14, 255],

  // End
  'minecraft:end_stone':          [219, 218, 162, 255],
  'minecraft:purpur_block':       [170, 122, 170, 255],
  'minecraft:obsidian':           [ 20,  15,  32, 255],

  // Plants / Vegetation
  'minecraft:tall_grass':         [ 90, 120,  55, 180],
  'minecraft:short_grass':        [ 90, 120,  55, 180],
  'minecraft:fern':               [ 78, 110,  48, 180],
  'minecraft:large_fern':         [ 78, 110,  48, 180],
  'minecraft:dead_bush':          [130, 100,  50, 200],
  'minecraft:cactus':             [ 82, 130,  55, 255],
  'minecraft:sugar_cane':         [130, 175,  80, 255],
  'minecraft:bamboo':             [110, 160,  40, 255],

  // Flowers
  'minecraft:dandelion':          [240, 220,  50, 255],
  'minecraft:poppy':              [220,  50,  50, 255],
  'minecraft:blue_orchid':        [ 50, 180, 220, 255],
  'minecraft:allium':             [180, 100, 210, 255],
  'minecraft:sunflower':          [230, 200,  50, 255],

  // Misc blocks
  'minecraft:mycelium':           [111,  93, 109, 255],
  'minecraft:podzol':             [104,  68,  34, 255],
  'minecraft:coarse_dirt':        [120,  84,  55, 255],
  'minecraft:rooted_dirt':        [125,  90,  60, 255],
  'minecraft:moss_block':         [ 90, 115,  50, 255],
  'minecraft:moss_carpet':        [ 90, 115,  50, 200],

  // Farmland / Path
  'minecraft:farmland':           [115,  75,  45, 255],
  'minecraft:grass_path':         [147, 123,  77, 255],

  // Planks
  'minecraft:oak_planks':         [165, 130,  77, 255],
  'minecraft:spruce_planks':      [110,  82,  45, 255],
  'minecraft:birch_planks':       [210, 195, 148, 255],
  'minecraft:jungle_planks':      [152, 112,  70, 255],
  'minecraft:acacia_planks':      [180, 100,  55, 255],
  'minecraft:dark_oak_planks':    [ 70,  44,  21, 255],
  'minecraft:mangrove_planks':    [ 95,  45,  35, 255],
  'minecraft:cherry_planks':      [220, 155, 160, 255],

  // Stone / Built
  'minecraft:stone_bricks':       [115, 115, 115, 255],
  'minecraft:bricks':             [158,  97,  82, 255],
  'minecraft:glass':              [175, 215, 230, 150],

  // Wool
  'minecraft:white_wool':         [230, 230, 230, 255],
  'minecraft:black_wool':         [ 25,  25,  25, 255],
  'minecraft:red_wool':           [180,  50,  50, 255],
  'minecraft:green_wool':         [ 70, 120,  50, 255],
  'minecraft:blue_wool':          [ 50,  70, 180, 255],
  'minecraft:yellow_wool':        [215, 195,  50, 255],
  'minecraft:orange_wool':        [210, 115,  40, 255],
  'minecraft:purple_wool':        [130,  50, 180, 255],

  // Concrete
  'minecraft:white_concrete':     [210, 214, 215, 255],
  'minecraft:gray_concrete':      [ 85,  90,  93, 255],
  'minecraft:black_concrete':     [ 15,  15,  20, 255],
  'minecraft:red_concrete':       [142,  32,  32, 255],
  'minecraft:green_concrete':     [ 73,  91,  36, 255],
  'minecraft:blue_concrete':      [ 44,  46, 143, 255],
  'minecraft:yellow_concrete':    [232, 175,  30, 255],
  'minecraft:orange_concrete':    [224,  97,   0, 255],
  'minecraft:purple_concrete':    [100,  32, 156, 255],
  'minecraft:cyan_concrete':      [ 21, 119, 136, 255],
  'minecraft:light_blue_concrete':[ 35, 137, 198, 255],
  'minecraft:lime_concrete':      [ 94, 168,  24, 255],
  'minecraft:magenta_concrete':   [169,  48, 159, 255],
  'minecraft:pink_concrete':      [213, 101, 143, 255],
  'minecraft:brown_concrete':     [ 96,  60,  32, 255],
  'minecraft:light_gray_concrete':[125, 125, 115, 255],
}

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

const AIR_NAMES = new Set([
  '', 'minecraft:air', 'minecraft:void_air', 'minecraft:cave_air',
])

const FALLBACK = [128, 128, 128, 255]
const AIR      = [  0,   0,   0,   0]

/**
 * @param {string} blockName
 * @returns {[number,number,number,number]} [r, g, b, a]
 */
export function blockColor(blockName) {
  if (AIR_NAMES.has(blockName)) return AIR
  return BLOCK_COLORS[blockName] ?? FALLBACK
}

export function biomeColor(biomeId) {
  return BIOME_COLORS[biomeId] ?? FALLBACK
}