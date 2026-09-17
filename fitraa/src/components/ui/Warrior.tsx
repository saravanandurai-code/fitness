import Svg, { Circle, Path, G } from 'react-native-svg'
import { colors } from '../../constants/theme'

/**
 * The Fitraa warrior mark — a helmeted figure inside a shield. Used sparingly:
 * onboarding, milestones, achievements and empty states only.
 */
export function Warrior({ size = 160, tone = colors.accent }: { size?: number; tone?: string }) {
  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 100 112" accessibilityLabel="Fitraa warrior">
      {/* Shield */}
      <Path
        d="M50 4 92 18v38c0 27-18 43-42 52C26 99 8 83 8 56V18L50 4z"
        fill="rgba(204, 243, 74, 0.08)"
        stroke={tone}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <G>
        {/* Helmet crest */}
        <Path
          d="M34 40c0-10 7-17 16-17s16 7 16 17v5H34v-5z"
          fill={tone}
          opacity={0.92}
        />
        <Path d="M50 16c4 4 5 8 5 11h-10c0-3 1-7 5-11z" fill={tone} />
        {/* Visor */}
        <Path d="M36 47h28v8H36z" fill={colors.bg} opacity={0.85} />
        <Path d="M40 49h6v4h-6zM54 49h6v4h-6z" fill={tone} />
        {/* Shoulders */}
        <Path
          d="M28 78c0-12 10-19 22-19s22 7 22 19v6H28v-6z"
          fill={tone}
          opacity={0.55}
        />
        <Circle cx={50} cy={68} r={5} fill={colors.bg} opacity={0.6} />
      </G>
    </Svg>
  )
}
