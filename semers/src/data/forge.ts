/**
 * The five silhouettes an apple passes through on its way to being a bar.
 *
 * They are ordinary hand-drawn SVG outlines, not a morph format: each one
 * starts at top-centre and runs clockwise, which is the only thing the morph
 * needs of them. At load the browser resamples all five to the same number of
 * equally spaced points with getPointAtLength, and after that a stage is just a
 * pair of point arrays to interpolate — no matching, no path-command algebra,
 * and a shape can be redrawn in any editor without touching the code.
 *
 * Shared between the page and its script so the markup can render the last
 * frame as its static `d`: with no JavaScript, or with reduced motion asked
 * for, the reader still sees the bar rather than an empty box.
 */
export const FORGE_SHAPES = [
  /* whole apple, with the dimple at the top */
  'M 100 44 C 116 24 150 30 164 62 C 176 90 172 130 150 156 C 132 178 112 176 100 170 C 88 176 68 178 50 156 C 28 130 24 90 36 62 C 50 30 84 24 100 44 Z',
  /* baked: wider, slumped, the shoulders gone soft */
  'M 100 66 C 126 54 164 62 174 86 C 184 106 176 134 152 148 C 132 160 112 158 100 154 C 88 158 68 160 48 148 C 24 134 16 106 26 86 C 36 62 74 54 100 66 Z',
  /* whipped: tripled in volume, a cloud of soft peaks */
  'M 100 26 C 118 18 138 30 140 48 C 158 44 176 58 172 78 C 186 88 186 112 170 122 C 172 142 154 156 136 150 C 126 166 102 168 92 154 C 74 164 52 154 52 136 C 32 132 24 110 36 94 C 26 76 40 54 60 56 C 64 34 84 24 100 26 Z',
  /* dried: a thin sheet, still hand-spread rather than machined */
  'M 101 84 C 130 80 166 86 178 88 C 180 100 180 106 178 116 C 156 118 130 112 104 116 C 78 120 48 116 24 118 C 22 106 22 96 24 84 C 48 78 76 88 101 84 Z',
  /* cut: the bar */
  'M 100 80 L 172 80 A 10 10 0 0 1 182 90 L 182 110 A 10 10 0 0 1 172 120 L 28 120 A 10 10 0 0 1 18 110 L 18 90 A 10 10 0 0 1 28 80 Z',
];

/**
 * The colour under each silhouette, as [top, bottom] of the body gradient:
 * apple red, oven caramel, whipped foam, dried pastila, cut crumb. Kept as
 * triples rather than hex so a frame between two stages can be mixed.
 */
export const FORGE_COLOURS: [number, number, number][][] = [
  [[226, 69, 47], [158, 38, 23]],
  [[201, 116, 45], [138, 66, 24]],
  [[247, 226, 196], [226, 186, 140]],
  [[236, 196, 143], [190, 132, 74]],
  [[208, 138, 69], [136, 74, 32]],
];

/** What the page renders before — or instead of — any of the above moving. */
export const FORGE_LAST = FORGE_SHAPES[FORGE_SHAPES.length - 1];
