import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ConvertStatus = "idle" | "selected" | "converting" | "done";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCompleteCreate: () => Promise<void> | void;
};

export default function CustomIconTabPanel({
  visible,
  onClose,
  onCompleteCreate,
}: Props) {
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

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("done");
    } catch (e) {
      console.error("[CustomIconTabPanel] create custom icon error:", e);
      setStatus("selected");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setStatus("idle");
  };

  const handleCancelConverted = () => {
    setStatus("selected");
  };

  const renderPreviewContent = () => {
    if (status === "idle") {
      return (
        <Pressable style={styles.previewInner} onPress={handlePasteMock}>
          <Text style={styles.placeholderText}>더블 클릭 후 붙여넣기</Text>
        </Pressable>
      );
    }

    if (status === "selected" || status === "converting") {
      return (
        <View style={styles.previewInner}>
          <Text style={styles.starIcon}>★</Text>

          {status === "selected" && (
            <Pressable style={styles.deleteTooltipWrap} onPress={handleDelete}>
              <View style={styles.deleteTooltip}>
                <Text style={styles.deleteTooltipText}>삭제</Text>
              </View>
              <View style={styles.deleteTooltipTail} />
            </Pressable>
          )}
        </View>
      );
    }

    return (
      <View style={styles.previewInner}>
        {/* 임시 아이콘 */}
        <Text style={styles.doneIcon}>⭐️</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerSide}></View>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>커스텀 아이콘 추가</Text>
            </View>
            <View style={styles.headerSide}></View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contentArea}>
  
            <View style={styles.previewBox}>
              {renderPreviewContent()}
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
                <Text style={styles.primaryButtonTextDisabled}>그림체 변환하기</Text>
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

            {status === "idle" && (
              <View style={{ height: 56, marginTop: 24 }} />
            )}
          </View>
        </View>
      </View>

    
      {status === "converting" && (
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
  sheetContainer: {
    backgroundColor: "#F7F7F5",
    height: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E0D8",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerSide: {
    width: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#827765",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
    fontWeight: "400",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5DED2",
    marginBottom: 24,
  },

  contentArea: {
    flex: 1,
    justifyContent: "space-between",
  },

  previewBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  previewInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  placeholderText: {
    color: "#6D665A",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
  },

  starIcon: {
    fontSize: 120,
    color: "#DAD7D0",
  },
  doneIcon: {
    fontSize: 120,
  },

  deleteTooltipWrap: {
    position: "absolute",
    top: "30%",
    alignItems: "center",
    zIndex: 10,
  },
  deleteTooltip: {
    minWidth: 69,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#C6B9A5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  deleteTooltipText: {
    color: "#3E372D",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 26,
  },
  deleteTooltipTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#CFC0A7",
    marginTop: -1,
  },

  fullScreenLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.70)", 
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

  primaryButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#544C3F",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    marginTop: 24,
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
  primaryButtonTextDisabled: {
    color: "#FFFFFF",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
  },

  secondaryButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#AFA38F",
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#9E927C",
    fontFamily: "Nanum NeuRisNeuRisCe",
    fontSize: 24,
  },
});