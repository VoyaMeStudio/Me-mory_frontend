import { getTimeline } from '@/api/timeline';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BoardThemeSelector from '@/components/features/board/BoardThemeSelector';
import DatePickerOverlay from '@/components/features/modals/DatePickerModal';
import EmotionPickerOverlay from '@/components/features/modals/EmotionPickerModal';
import WeatherPickerOverlay, {
  WeatherIcon,
  type RecordWeather,
} from '@/components/features/modals/WeatherPickerModal';
import type { TripEmotion } from '@/components/features/stack.types';
import type { BoardThemeId } from '@/types/board';
import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

const RECORD_BG = require('@/assets/images/record_bg.jpg');

/**
 * Head 1 — color/size/weight from design. Line height must be ≥ font size so Hangul is not
 * clipped (design export `line-height: 17` with `font-size: 26` is invalid for RN).
 */
const HEAD1_RECORD = {
  color: '#1F1C17',
  fontFamily: 'Nanum',
  fontSize: 26,
  fontStyle: 'normal' as const,
  fontWeight: '400' as const,
  lineHeight: 32,
  letterSpacing: -0.26,
  ...(Platform.OS === 'android' && { includeFontPadding: false }),
};

type TripChoice = 'existing' | 'new';

const H_PADDING = 20;
const PLACE_MAX = 16;
const TRIP_TITLE_MAX = 14;
const TRIP_DESC_MAX = 54;
const WEEK_KR = ['일', '월', '화', '수', '목', '금', '토'];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTripPeriodLine(start: Date, end: Date) {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const w = WEEK_KR[d.getDay()];
    return `${y}.${m}.${day}(${w})`;
  };
  return `${fmt(start)} ~ ${fmt(end)}`;
}
/** Notebook rules below the first line of text (mockup: two light horizontal lines). */
const NOTE_RULES_COUNT = 2;
/** Diary-entry phase (일기 저장) — three ruled lines per design */
const DIARY_NOTE_RULES_COUNT = 3;
/** Space between the two ruled lines. */
const NOTE_RULE_GAP = 28;
/** First rule sits just under the first text row (placeholder baseline ~above the line). */
const NOTE_FIRST_RULE_TOP = 32;

export default function RecordDestinationScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<TripChoice | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [recordNote, setRecordNote] = useState('');
  const [emotionPickerVisible, setEmotionPickerVisible] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<TripEmotion | undefined>(undefined);
  const [weatherPickerVisible, setWeatherPickerVisible] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<RecordWeather | undefined>(undefined);

  const [tripsLoading, setTripsLoading] = useState(true);
  const [hasExistingTrips, setHasExistingTrips] = useState(false);

  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripStart, setNewTripStart] = useState<Date | null>(null);
  const [newTripEnd, setNewTripEnd] = useState<Date | null>(null);
  const [newTripDesc, setNewTripDesc] = useState('');
  const [newTripThemeId, setNewTripThemeId] = useState<BoardThemeId | null>(null);
  const [newTripDatePickerVisible, setNewTripDatePickerVisible] = useState(false);
  /** After "다음", same screen shows 일기 form (장소명·감정·날씨·기록) + "일기 저장". */
  const [diaryEntryPhase, setDiaryEntryPhase] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setTripsLoading(true);
      (async () => {
        try {
          const { trips } = await getTimeline();
          if (!cancelled) {
            setHasExistingTrips((trips?.length ?? 0) > 0);
          }
        } catch {
          if (!cancelled) setHasExistingTrips(false);
        } finally {
          if (!cancelled) setTripsLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const existingTripDisabled = tripsLoading || !hasExistingTrips;

  useEffect(() => {
    if (tripsLoading) return;
    if (!hasExistingTrips && choice === 'existing') {
      setChoice(null);
    }
  }, [tripsLoading, hasExistingTrips, choice]);

  useEffect(() => {
    if (choice !== 'new') {
      setNewTripTitle('');
      setNewTripStart(null);
      setNewTripEnd(null);
      setNewTripDesc('');
      setNewTripThemeId(null);
      setNewTripDatePickerVisible(false);
    }
  }, [choice]);

  useEffect(() => {
    if (choice !== 'new') return;
    if (newTripTitle.trim().length === 0) {
      setNewTripStart(null);
      setNewTripEnd(null);
      setNewTripDesc('');
      setNewTripThemeId(null);
    }
  }, [choice, newTripTitle]);

  useEffect(() => {
    setDiaryEntryPhase(false);
  }, [choice]);

  const newTripNameOk = newTripTitle.trim().length > 0;
  const newTripPeriodOk =
    newTripStart != null &&
    newTripEnd != null &&
    newTripEnd.getTime() >= newTripStart.getTime();
  const showNewTripPeriod = choice === 'new' && newTripNameOk;
  const showNewTripDescTheme = choice === 'new' && newTripNameOk && newTripPeriodOk;

  const onNext = useCallback(() => {
    if (choice == null) return;
    setDiaryEntryPhase(true);
  }, [choice]);

  const onSaveDiary = useCallback(() => {
    // TODO: submit diary + trip context
  }, []);

  const canProceedTripSetup =
    choice === 'existing' ||
    (choice === 'new' && newTripNameOk && newTripPeriodOk);

  const onHeaderBack = useCallback(() => {
    if (diaryEntryPhase) {
      setDiaryEntryPhase(false);
      return;
    }
    router.back();
  }, [diaryEntryPhase, router]);

  return (
    <View style={styles.screenRoot}>
      <Image
        source={RECORD_BG}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onHeaderBack} style={styles.backBtn} hitSlop={12}>
              <Feather name="chevron-left" size={24} color={Colors.primary800} />
            </Pressable>
            <Text style={styles.title}>기록하기</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.question}>일기를 어디에 담을까요?</Text>

            <View style={styles.choiceRow}>
              <Pressable
                onPress={() => setChoice('existing')}
                disabled={existingTripDisabled || diaryEntryPhase}
                accessibilityState={{ disabled: existingTripDisabled || diaryEntryPhase }}
                style={[
                  styles.choiceCardExisting,
                  choice === 'existing' ? styles.choiceCardSelected : styles.choiceCardUnselected,
                  existingTripDisabled && styles.choiceCardExistingDisabled,
                ]}
              >
                <Text style={styles.choiceTitle}>기존 여행에 추가</Text>
                <Text style={styles.choiceSub}>&lt; 여행명 &gt;</Text>
              </Pressable>

              <Pressable
                onPress={() => setChoice('new')}
                disabled={diaryEntryPhase}
                accessibilityState={{ disabled: diaryEntryPhase }}
                style={[
                  styles.choiceCardNew,
                  choice === 'new' ? styles.choiceCardSelected : styles.choiceCardUnselected,
                ]}
              >
                <Text style={styles.choiceTitle} numberOfLines={2}>
                  새로운 여행 기록 시작
                </Text>
              </Pressable>
            </View>

            {diaryEntryPhase && (
              <View style={styles.existingForm}>
                <View style={styles.newTripFieldBlock}>
                  <Text style={styles.fieldLabel}>장소명</Text>
                  <View style={styles.placeInputRow}>
                    <TextInput
                      value={placeName}
                      onChangeText={(t) => setPlaceName(t.slice(0, PLACE_MAX))}
                      placeholder="방문한 장소를 입력해보세요."
                      placeholderTextColor={Colors.grey550}
                      style={styles.placeInput}
                      maxLength={PLACE_MAX}
                    />
                    <Text style={styles.placeCounter}>
                      ({placeName.length}/{PLACE_MAX})
                    </Text>
                  </View>
                </View>

                <View style={styles.emotionWeatherRow}>
                  <Pressable
                    style={[styles.emotionWeatherHalf, styles.emotionWeatherHalfStretch]}
                    onPress={() => setEmotionPickerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="감정색 선택"
                    hitSlop={{ top: 6, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text style={styles.fieldLabel}>감정색</Text>
                    <View style={styles.pickerRowInline}>
                      <View
                        style={[
                          styles.pickerDot,
                          selectedEmotion != null && {
                            backgroundColor: selectedEmotion.color,
                            borderColor: selectedEmotion.color,
                          },
                        ]}
                      />
                      <Text style={styles.pickerValueInline} numberOfLines={1}>
                        {selectedEmotion?.label ?? '기본'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[styles.emotionWeatherHalf, styles.emotionWeatherHalfStretch]}
                    onPress={() => setWeatherPickerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="날씨 선택"
                    hitSlop={{ top: 6, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text style={styles.fieldLabel}>날씨</Text>
                    <View style={styles.pickerRowInline}>
                      <View style={styles.pickerDot}>
                        {selectedWeather != null ? (
                          <WeatherIcon weatherKey={selectedWeather.key} size={14} />
                        ) : null}
                      </View>
                      <Text style={styles.pickerValueInline} numberOfLines={1}>
                        {selectedWeather?.label ?? '선택 안 함'}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                <View style={styles.newTripFieldBlock}>
                  <Text style={[styles.fieldLabel, styles.noteFieldLabel]}>기록</Text>
                  <View style={styles.diaryNoteWrap}>
                    <View style={styles.noteLines} pointerEvents="none">
                      {Array.from({ length: DIARY_NOTE_RULES_COUNT }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.noteLine,
                            { top: NOTE_FIRST_RULE_TOP + i * NOTE_RULE_GAP },
                          ]}
                        />
                      ))}
                    </View>
                    <TextInput
                      value={recordNote}
                      onChangeText={setRecordNote}
                      placeholder="여행의 순간을 기록해보세요."
                      placeholderTextColor={Colors.grey550}
                      style={styles.diaryNoteInput}
                      multiline
                      textAlignVertical="top"
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>
              </View>
            )}

            {!diaryEntryPhase && choice === 'new' && (
              <View style={styles.newTripForm}>
                <View style={styles.newTripFieldBlock}>
                  <Text style={styles.fieldLabel}>이름</Text>
                  <View style={styles.placeInputRow}>
                    <TextInput
                      value={newTripTitle}
                      onChangeText={(t) => setNewTripTitle(t.slice(0, TRIP_TITLE_MAX))}
                      placeholder="여행명을 입력하세요."
                      placeholderTextColor={Colors.grey550}
                      style={styles.placeInput}
                      maxLength={TRIP_TITLE_MAX}
                    />
                    <Text style={styles.placeCounter}>
                      ({newTripTitle.length}/{TRIP_TITLE_MAX})
                    </Text>
                  </View>
                </View>

                {showNewTripPeriod && (
                  <View style={styles.newTripFieldBlock}>
                    <Text style={styles.fieldLabel}>여행 기간</Text>
                    <Pressable
                      style={styles.periodRow}
                      onPress={() => setNewTripDatePickerVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel="여행 기간 선택"
                    >
                      <Text
                        style={[
                          styles.periodText,
                          !(newTripStart && newTripEnd) && styles.periodPlaceholder,
                        ]}
                        numberOfLines={2}
                      >
                        {newTripStart && newTripEnd
                          ? formatTripPeriodLine(newTripStart, newTripEnd)
                          : '날짜를 선택해주세요'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {showNewTripDescTheme && (
                  <>
                    <View style={styles.newTripFieldBlock}>
                      <Text style={styles.fieldLabel}>여행 설명</Text>
                      <View style={styles.descBox}>
                        <TextInput
                          value={newTripDesc}
                          onChangeText={(t) => setNewTripDesc(t.slice(0, TRIP_DESC_MAX))}
                          placeholder="여행에 대한 설명을 기록하세요."
                          placeholderTextColor={Colors.grey550}
                          style={styles.descInput}
                          multiline
                          textAlignVertical="top"
                          underlineColorAndroid="transparent"
                        />
                      </View>
                      <Text style={styles.descCounter}>
                        ({newTripDesc.length}/{TRIP_DESC_MAX})
                      </Text>
                    </View>
                    <View style={styles.newTripFieldBlock}>
                      <Text style={styles.fieldLabel}>카드 테마 설정</Text>
                      <BoardThemeSelector
                        selectedThemeId={newTripThemeId}
                        onSelect={setNewTripThemeId}
                      />
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {(diaryEntryPhase || choice === 'existing') && (
              <Text style={styles.footerHint}>기록은 선택으로 나중에 추가해도 됩니다 :)</Text>
            )}
            {!diaryEntryPhase && choice === 'new' && (
              <Text style={styles.footerHint}>
                {showNewTripDescTheme
                  ? '여행 설명 및 테마는 선택으로 나중에 수정 가능합니다 :)'
                  : '여행명 및 여행 기간은 나중에 수정 가능합니다 :)'}
              </Text>
            )}
            {diaryEntryPhase ? (
              <Pressable style={styles.nextBtn} onPress={onSaveDiary}>
                <Text style={styles.nextBtnText}>일기 저장</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.nextBtn, !canProceedTripSetup && styles.nextBtnDisabled]}
                onPress={onNext}
                disabled={!canProceedTripSetup}
              >
                <Text
                  style={[styles.nextBtnText, !canProceedTripSetup && styles.nextBtnTextDisabled]}
                >
                  다음
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <EmotionPickerOverlay
        visible={emotionPickerVisible}
        value={selectedEmotion}
        onClose={() => setEmotionPickerVisible(false)}
        onConfirm={(e) => {
          setSelectedEmotion(e);
          setEmotionPickerVisible(false);
        }}
      />
      <WeatherPickerOverlay
        visible={weatherPickerVisible}
        value={selectedWeather}
        onClose={() => setWeatherPickerVisible(false)}
        onConfirm={(w) => {
          setSelectedWeather(w);
          setWeatherPickerVisible(false);
        }}
      />
      <DatePickerOverlay
        visible={newTripDatePickerVisible}
        initialStartDate={newTripStart ?? new Date()}
        initialEndDate={newTripEnd ?? newTripStart ?? new Date()}
        onClose={() => setNewTripDatePickerVisible(false)}
        onConfirmRange={(start, end) => {
          setNewTripStart(start);
          setNewTripEnd(end);
          setNewTripDatePickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: H_PADDING,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
    paddingTop: 10,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CECBC6',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...typography.head4_22_regular,
    color: Colors.primary900,
  },
  headerRight: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 34,
    paddingBottom: 16,
    alignItems: 'center',
  },
  question: {
    ...HEAD1_RECORD,
    textAlign: 'center',
    marginBottom: 28,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  /** ‘기존 여행에 추가’ — padding 16 41 10 41; unselected: radius 24, border #D8CAB1, primary-100 (choiceCardUnselected) */
  choiceCardExisting: {
    flex: 1,
    paddingTop: 16,
    paddingRight: 41,
    paddingBottom: 10,
    paddingLeft: 41,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: Colors.primary100,
  },
  choiceCardUnselected: {
    borderWidth: 1,
    borderColor: '#D8CAB1',
  },
  choiceCardSelected: {
    borderWidth: 1,
    borderColor: '#827763',
  },
  choiceCardExistingDisabled: {
    opacity: 0.45,
  },
  /** “새로운 여행 기록 시작” — 62px height, asymmetric padding; idle border via choiceCardUnselected */
  choiceCardNew: {
    height: 62,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 30,
    paddingRight: 29,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 24,
    backgroundColor: Colors.primary100,
  },
  choiceTitle: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Nanum',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 26,
    textTransform: 'capitalize',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  choiceSub: {
    ...typography.sub2_12_regular,
    color: Colors.grey600,
    marginTop: 8,
    textAlign: 'center',
  },
  existingForm: {
    width: '100%',
    marginTop: 28,
    alignSelf: 'stretch',
  },
  newTripForm: {
    width: '100%',
    marginTop: 28,
    alignSelf: 'stretch',
  },
  periodRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary300,
    paddingBottom: 8,
    paddingTop: 4,
  },
  periodText: {
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.18,
    color: Colors.primary900,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  periodPlaceholder: {
    color: Colors.grey550,
  },
  descBox: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.grey550,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 240, 234, 0)',
    paddingTop: 8,
    paddingRight: 15,
    paddingBottom: 5,
    paddingLeft: 13,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  descInput: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    color: Colors.primary900,
    padding: 0,
    margin: 0,
    minHeight: 96,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  descCounter: {
    marginTop: 8,
    alignSelf: 'flex-end',
    color: Colors.grey550,
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  /** Vertical gap (15px) between 이름 / 여행 기간 / 여행 설명 / 카드 테마 설정 */
  newTripFieldBlock: {
    marginBottom: 15,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    ...HEAD1_RECORD,
    marginBottom: 8,
  },
  /** Tighter gap between title "기록" and the notebook block (design mockup). */
  noteFieldLabel: {
    marginBottom: 6,
  },
  placeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary300,
    paddingBottom: 6,
    gap: 8,
  },
  placeInput: {
    flex: 1,
    minWidth: 0,
    maxWidth: 282,
    minHeight: 21,
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    color: Colors.primary900,
    paddingVertical: 0,
    paddingHorizontal: 0,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  placeCounter: {
    color: Colors.grey550,
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  emotionWeatherRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  emotionWeatherHalf: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  emotionWeatherHalfStretch: {
    alignItems: 'stretch',
  },
  /** Diary phase — underline row (mockup) */
  pickerRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary300,
    paddingBottom: 8,
    paddingTop: 4,
    gap: 6,
  },
  pickerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.grey200,
    borderWidth: 0.5,
    borderColor: Colors.grey300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValueInline: {
    flex: 1,
    minWidth: 0,
    color: Colors.grey550,
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  diaryNoteWrap: {
    position: 'relative',
    minHeight:
      NOTE_FIRST_RULE_TOP + (DIARY_NOTE_RULES_COUNT - 1) * NOTE_RULE_GAP + 56,
  },
  diaryNoteInput: {
    flex: 1,
    flexShrink: 0,
    alignSelf: 'stretch',
    minHeight:
      NOTE_FIRST_RULE_TOP + (DIARY_NOTE_RULES_COUNT - 1) * NOTE_RULE_GAP + 56,
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    color: Colors.primary900,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  noteWrap: {
    position: 'relative',
    minHeight:
      NOTE_FIRST_RULE_TOP + (NOTE_RULES_COUNT - 1) * NOTE_RULE_GAP + 56,
  },
  noteLines: {
    ...StyleSheet.absoluteFillObject,
  },
  noteLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#CECBC6',
  },
  noteInput: {
    flex: 1,
    flexShrink: 0,
    alignSelf: 'stretch',
    minHeight:
      NOTE_FIRST_RULE_TOP + (NOTE_RULES_COUNT - 1) * NOTE_RULE_GAP + 56,
    paddingHorizontal: 0,
    /** Align first line of placeholder so its baseline sits just above the first rule (~NOTE_FIRST_RULE_TOP). */
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    color: Colors.primary900,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  footer: {
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerHint: {
    color: '#000',
    fontFamily: 'Nanum',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.18,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  nextBtn: {
    width: 339,
    height: 54,
    paddingTop: 18,
    paddingBottom: 19,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#625B4F',
  },
  nextBtnDisabled: {
    width: 337,
    backgroundColor: '#F1F1EF',
    borderWidth: 1,
    borderColor: '#D2D2D2',
  },
  nextBtnText: {
    ...typography.body3_16_regular,
    color: Colors.primary50,
    fontWeight: '600',
  },
  nextBtnTextDisabled: {
    color: Colors.grey500,
  },
});
