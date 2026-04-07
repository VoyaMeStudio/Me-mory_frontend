import { addBoardSticker, createAiSticker } from "@/api/boardSticker";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ConvertStatus = "idle" | "selected" | "converting" | "done";

type Props = {
  visible: boolean;
  onClose: () => void;
  boardId: number;
  onComplete: () => Promise<void> | void;
};

const saveBase64ToFile = async (base64: string) => {
  const safeBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
  const fileUri = `${FileSystem.cacheDirectory}sticker_${Date.now()}.png`;

  await FileSystem.writeAsStringAsync(fileUri, safeBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

export default function CustomIconTabPanel({
  visible,
  onClose,
  boardId,
  onComplete,
}: Props) {
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(
    null
  );
  const [isImageSelected, setIsImageSelected] = useState(false);

  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    }
  }, [visible, translateY]);

  const handleReset = () => {
    setSelectedImageUri(null);
    setConvertedImageUrl(null);
    setStatus("idle");
    setIsImageSelected(false);
    translateY.setValue(0);
  };

  const closeWithAnim = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      handleReset();
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeWithAnim();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handlePasteImage = async () => {
    try {
      const hasImage = await Clipboard.hasImageAsync();

      if (!hasImage) {
        Alert.alert("알림", "클립보드에 복사된 이미지가 없습니다.");
        return;
      }

      const image = await Clipboard.getImageAsync({ format: "png" });

      if (image && image.data) {
        const finalUri = image.data.startsWith("data:image")
          ? image.data
          : `data:image/png;base64,${image.data}`;

        setSelectedImageUri(finalUri);
        setStatus("selected");
        setIsImageSelected(false);
      }
    } catch (error) {
      console.error("Paste Error:", error);
      Alert.alert("오류", "이미지를 불러오지 못했습니다.");
    }
  };

  const handleConvertAndAddToCanvas = async () => {
    if (!selectedImageUri || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setStatus("converting");

      const pureBase64 = selectedImageUri.split(",")[1] || selectedImageUri;
      const fileUri = await saveBase64ToFile(pureBase64);

      const result = (await createAiSticker(fileUri)) as any;

      const sId = result?.stickerId;
      const iUrl = result?.imageUrl;

      if (!sId) {
        throw new Error("서버 응답 데이터 형식이 올바르지 않습니다.");
      }

      await addBoardSticker(boardId, sId, {
        posX: 150,
        posY: 150,
        rotation: 0,
      });

      await onComplete();

      setConvertedImageUrl(iUrl ?? null);
      setStatus("done");

      setTimeout(() => {
        closeWithAnim();
      }, 800);
    } catch (e: any) {
  const errorMessage =
    e?.response?.data?.message ||
    e?.response?.data ||
    e?.message ||
    JSON.stringify(e);

  console.log("=== AI 변환 에러 시작 ===");
  console.log("e:", e);
  console.log("e.message:", e?.message);
  console.log("e.response:", e?.response);
  console.log("e.response?.data:", e?.response?.data);
  console.log("e.response?.status:", e?.response?.status);
  console.log("=== AI 변환 에러 끝 ===");

  Alert.alert("변환 실패", String(errorMessage));
  setStatus("selected");
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeWithAnim}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.outsideClose} onPress={closeWithAnim} />

        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitleText}>커스텀 아이콘 추가</Text>
            <View style={styles.titleDivider} />
          </View>

          <View style={styles.contentArea}>
            <View style={styles.previewBox}>
              {status === "idle" ? (
                <Pressable
                  style={styles.previewInner}
                  onPress={handlePasteImage}
                >
                  <Text style={styles.placeholderText}>
                    더블 클릭 후 붙여넣기
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.centerContainer}>
                  {status === "selected" && isImageSelected && (
                    <Pressable
                      style={styles.deleteTooltipWrap}
                      onPress={handleReset}
                    >
                      <View style={styles.deleteTooltip}>
                        <Text style={styles.deleteTooltipText}>삭제</Text>
                      </View>
                      <View style={styles.deleteTooltipTail} />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => setIsImageSelected(!isImageSelected)}
                    style={styles.imagePressable}
                  >
                    <Image
                      source={{
                        uri:
                          status === "done"
                            ? convertedImageUrl || selectedImageUri || undefined
                            : selectedImageUri || undefined,
                      }}
                      style={styles.imagePreview}
                    />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.buttonArea}>
              {status === "selected" && (
                <Pressable
                  style={styles.primaryButton}
                  onPress={handleConvertAndAddToCanvas}
                >
                  <Text style={styles.primaryButtonText}>그림체 변환하기</Text>
                </Pressable>
              )}

              {status === "done" && (
                <Text style={styles.completeText}>
                  변환 완료! 보드에 추가되었습니다.
                </Text>
              )}

              {status === "idle" && <View style={{ height: 56 }} />}
            </View>
          </View>
        </Animated.View>
      </View>

      {isSubmitting && (
        <View style={styles.fullScreenLoadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>변환중</Text>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  outsideClose: { flex: 1 },
  sheetContainer: {
    backgroundColor: "#F7F7F5",
    height: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E0D8",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  headerTitleArea: { alignItems: "center", marginBottom: 10 },
  headerTitleText: {
    color: "#6D665A",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
    marginBottom: 12,
  },
  titleDivider: { width: "100%", height: 1, backgroundColor: "#E5E0D8" },
  contentArea: { flex: 1, justifyContent: "space-between" },
  previewBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6D665A",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  imagePressable: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  deleteTooltipWrap: {
    position: "absolute",
    top: -20,
    zIndex: 99,
    alignItems: "center",
  },
  deleteTooltip: {
    minWidth: 60,
    height: 36,
    backgroundColor: "#C6B9A5",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTooltipText: {
    color: "#3E372D",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 22,
  },
  deleteTooltipTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",   // ✅ 추가
    borderRightColor: "transparent",  // ✅ 추가
    borderBottomWidth: 0,             // ✅ 추가
    borderTopColor: "#C6B9A5",        // ✅ tooltip 색이랑 통일
    alignSelf: "center",
    marginTop: -1,
  },
  buttonArea: { marginBottom: 30 },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#544C3F",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
  },
  completeText: {
    textAlign: "center",
    color: "#827765",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 20,
  },
  fullScreenLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    color: "#FFF",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 26,
  },
});