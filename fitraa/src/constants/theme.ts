/**
 * Fitraa design tokens.
 *
 * Dark, athletic, premium: near-black surfaces, one volt accent, a flame accent
 * reserved for streaks, and a muted colour per routine task so the Today screen
 * reads at a glance.
 */

export const colors = {
  /** App background — near black, very slightly blue. */
  bg: '#08090C',
  /** Cards and rows. */
  surface: '#12141A',
  /** Raised elements: modals, pressed states, tab bar. */
  surfaceRaised: '#181B23',
  surfaceSunken: '#0C0E13',
  border: '#22262F',
  borderStrong: '#31363F',

  text: '#F4F6FA',
  textMuted: '#9AA1AC',
  textFaint: '#666D78',
  /** Text that sits on top of the volt accent. */
  onAccent: '#0A0C05',

  /** Primary accent — volt. Used for progress, primary actions, focus. */
  accent: '#CCF34A',
  accentDim: '#8CA82F',
  accentSoft: 'rgba(204, 243, 74, 0.13)',

  /** Streaks and milestones only. */
  flame: '#FF6B35',
  flameSoft: 'rgba(255, 107, 53, 0.14)',

  water: '#38BDF8',
  workout: '#CCF34A',
  nutrition: '#34D399',
  sleep: '#A78BFA',

  success: '#34D399',
  danger: '#F87171',
  overlay: 'rgba(4, 5, 7, 0.78)',
} as const

export const taskColors = {
  water: colors.water,
  workout: colors.workout,
  nutrition: colors.nutrition,
  sleep: colors.sleep,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const

/** Strong, tight display type; generous body line height. */
export const type = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: '800', letterSpacing: -1.2 },
  title: { fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.7 },
  heading: { fontSize: 19, lineHeight: 24, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500', letterSpacing: 0 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.2 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.4 },
  /** Big tabular numbers for targets and percentages. */
  metric: { fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -1 },
} as const

export const layout = {
  screenPadding: spacing.xl,
  tabBarHeight: 72,
} as const
