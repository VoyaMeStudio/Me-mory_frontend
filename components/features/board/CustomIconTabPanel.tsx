import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ConvertStatus = "idle" | "selected" | "converting" | "done";

type Props = {
  onCompleteCreate: () => Promise<void> | void;
};

export default function CustomIconTabPanel({ onCompleteCreate }: Props) {
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasteMock = () => {
    if (status === "idle") {
      setStatus("selected");
    }
  };

  const handleConvert = async () => {
    if (status !== "selected" || isSubmitting) return;

    try {
      setStatus("converting");
      setIsSubmitting(true);

      // 여기서 실제 AI 생성이 이미 백엔드에서 처리된다고 했으니
      // 부모가 넘겨준 onCompleteCreate() 호출만 하면 됨
      await onCompleteCreate();

      setStatus("done");
    } catch (e) {
      console.error("[CustomIconTabPanel] create custom icon error:", e);
      setStatus("selected");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStatus("idle");
  };

  const handleCancelConverted = () => {
    setStatus("selected");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLabelWrap}>
        <Text style={styles.topLabel}>커스텀 아이콘 추가</Text>
      </View>

      <View style={styles.previewBox}>
        {status === "idle" && (
          <Pressable style={styles.fullCenter} onPress={handlePasteMock}>
            <Text style={styles.placeholder}>더블 클릭 후 붙여넣기</Text>
          </Pressable>
        )}

        {status === "selected" && (
          <View style={styles.fullCenter}>
            <Text style={styles.previewIcon}>★</Text>

            <View style={styles.deleteBubbleWrap}>
              <View style={styles.deleteBubble}>
                <Text style={styles.deleteBubbleText}>삭제</Text>
              </View>
              <View style={styles.deleteBubbleTail} />
            </View>

            <Pressable style={styles.deleteHotspot} onPress={handleReset} />
          </View>
        )}

        {status === "converting" && (
          <View style={styles.fullCenter}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.convertingText}>변환중</Text>
          </View>
        )}

        {status === "done" && (
          <View style={styles.fullCenter}>
            <Text style={styles.previewIcon}>★</Text>
          </View>
        )}
      </View>

      {status === "selected" && (
        <Pressable
          style={styles.primaryButton}
          onPress={handleConvert}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>그림체 변환하기</Text>
        </Pressable>
      )}

      {status === "converting" && (
        <View style={styles.primaryButtonDisabled}>
          <Text style={styles.primaryButtonText}>그림체 변환하기</Text>
        </View>
      )}

      {status === "done" && (
        <Pressable
          style={styles.secondaryButton}
          onPress={handleCancelConverted}
        >
          <Text style={styles.secondaryButtonText}>그림체 변환 취소하기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  topLabelWrap: {
    alignItems: "center",
    marginBottom: 10,
  },

  topLabel: {
    color: "#827765",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: -0.24,
  },

  previewBox: {
    height: 420,
    borderRadius: 20,
    backgroundColor: "#F8F6F1",
    borderWidth: 1,
    borderColor: "#EEE8DE",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  fullCenter: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholder: {
    color: "#1A1A1A",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: -0.22,
  },

  previewIcon: {
    fontSize: 96,
    color: "#DDD7CE",
  },

  deleteBubbleWrap: {
    position: "absolute",
    top: 112,
    alignItems: "center",
  },

  deleteBubble: {
    minWidth: 58,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#CCB595",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBubbleText: {
    color: "#4F473B",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 18,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: -0.18,
  },

  deleteBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#CCB595",
    marginTop: -1,
  },

  deleteHotspot: {
    position: "absolute",
    top: 98,
    width: 90,
    height: 60,
  },

  convertingText: {
    marginTop: 12,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: -0.22,
  },

  primaryButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#5F5848",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonDisabled: {
    marginTop: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: -0.22,
  },

  secondaryButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#D8D1C7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#827765",
    textAlign: "center",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: -0.22,
  },
});