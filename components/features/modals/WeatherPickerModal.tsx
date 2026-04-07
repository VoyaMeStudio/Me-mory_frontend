import WeatherCloudRain from '@/assets/images/weather_cloud_rain.svg';
import WeatherCloudy from '@/assets/images/weather_cloudy.svg';
import WeatherSnowFlake from '@/assets/images/weather_snow-flake.svg';
import WeatherSunny from '@/assets/images/weather_sunny.svg';
import WeatherWind from '@/assets/images/weather_wind.svg';
import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

export type RecordWeather = {
  key: string;
  label: string;
};

type WeatherSvg = React.ComponentType<SvgProps>;

const WEATHER_SVG_BY_KEY: Record<string, WeatherSvg> = {
  sunny: WeatherSunny,
  partly_cloudy: WeatherCloudy,
  rain: WeatherCloudRain,
  wind: WeatherWind,
  snow: WeatherSnowFlake,
};

type WeatherDef = RecordWeather & {
  Icon: WeatherSvg;
};

const WEATHERS: WeatherDef[] = [
  { key: 'sunny', label: '맑음', Icon: WeatherSunny },
  { key: 'partly_cloudy', label: '구름 조금', Icon: WeatherCloudy },
  { key: 'rain', label: '비', Icon: WeatherCloudRain },
  { key: 'wind', label: '바람', Icon: WeatherWind },
  { key: 'snow', label: '눈', Icon: WeatherSnowFlake },
];

const MODAL_ICON_SIZE = 26;

/** Renders the `weather_*.svg` asset for a weather `key` (e.g. in form rows). */
export function WeatherIcon({
  weatherKey,
  size = MODAL_ICON_SIZE,
}: {
  weatherKey: string;
  size?: number;
}) {
  const Icon = WEATHER_SVG_BY_KEY[weatherKey];
  if (!Icon) return null;
  return <Icon width={size} height={size} />;
}

const PRIMARY_400 = Colors?.primary400 ?? '#D8CCB8';
const UNSELECTED_CIRCLE = '#F0F0F0';
const SELECTED_CIRCLE = '#EFE9E0';
const SELECTED_BORDER = '#827763';

type Props = {
  visible: boolean;
  value?: RecordWeather;
  onClose: () => void;
  onConfirm: (w: RecordWeather) => void;
};

export default function WeatherPickerOverlay({
  visible,
  value,
  onClose,
  onConfirm,
}: Props) {
  const [temp, setTemp] = useState<RecordWeather | undefined>(value);

  useEffect(() => {
    if (!visible) return;
    setTemp(value);
  }, [visible, value]);

  const canConfirm = useMemo(() => !!temp, [temp]);

  if (!visible) return null;

  return (
    <View style={styles.absoluteFill}>
      <Pressable style={styles.overlayBackdrop} onPress={onClose} />

      <View style={styles.popup}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.sideSlot} />
          <Text style={styles.title}>날씨 선택</Text>
          <View style={styles.sideSlot} />
        </View>

        <View style={styles.dividerLine} />

        <View style={styles.iconRow}>
          {WEATHERS.map((w) => {
            const selected = temp?.key === w.key;
            const Icon = w.Icon;
            return (
              <Pressable
                key={w.key}
                style={styles.iconCell}
                onPress={() => setTemp({ key: w.key, label: w.label })}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={w.label}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: UNSELECTED_CIRCLE },
                    selected && styles.iconCircleSelected,
                  ]}
                >
                  <Icon width={MODAL_ICON_SIZE} height={MODAL_ICON_SIZE} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          disabled={!canConfirm}
          onPress={() => temp && onConfirm(temp)}
        >
          <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>
            확인
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  popup: {
    width: 300,
    borderRadius: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PRIMARY_400,
    paddingTop: 6,
    paddingBottom: 14,
  },
  topBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 26,
    color: Colors?.grey500 ?? '#8C8578',
    marginTop: -2,
  },
  sideSlot: { width: 36 },
  title: {
    ...typography.sub1_14_medium,
    color: Colors?.grey900 ?? '#2E2A24',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    flexShrink: 0,
    fontFamily: 'Nanum',
  },
  dividerLine: {
    height: 1,
    backgroundColor: PRIMARY_400,
    marginHorizontal: 18,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  iconCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: SELECTED_CIRCLE,
    borderWidth: 1,
    borderColor: SELECTED_BORDER,
  },
  confirmBtn: {
    marginTop: 16,
    alignSelf: 'center',
    width: 226,
    height: 37,
    paddingVertical: 6,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#625B4F',
  },
  confirmText: {
    fontFamily: 'Nanum',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
    color: '#FFFFFF',
  },
  confirmBtnDisabled: {
    backgroundColor: '#F1F1EF',
    borderWidth: 0.5,
    borderColor: '#CECBC6',
  },
  confirmTextDisabled: {
    color: Colors.grey500,
  },
});
