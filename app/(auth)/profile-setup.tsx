import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function ProfileSetup() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Text style={{ fontSize: 20 }}>Profile Setup (TEMP)</Text>
      <Text>여기 나중에 디자인 넣을 예정</Text>

      <Text
        style={{ color: "blue" }}
        onPress={() => router.replace("/(tabs)")}
      >
        Skip → Home
      </Text>
    </View>
  );
}
