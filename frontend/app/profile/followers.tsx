import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockFollowers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    isFollowing: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
    isFollowing: false,
  },
];

export default function FollowersScreen() {
  const router = useRouter();

  const handleToggleFollow = (id: string) => {
    // Disabled: Requires authentication
  };

  const renderItem = ({ item }: { item: typeof mockFollowers[0] }) => (
    <View style={styles.userRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
      <TouchableOpacity
        style={[styles.button, item.isFollowing ? styles.unfollowButton : styles.followButton]}
        onPress={() => handleToggleFollow(item.id)}
      >
        <Text style={[styles.buttonText, item.isFollowing ? styles.unfollowButtonText : styles.followButtonText]}>
          {item.isFollowing ? "Unfollow" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followers</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={mockFollowers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No followers yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.heading3,
  },
  listContainer: {
    padding: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    ...typography.body,
    flex: 1,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unfollowButton: {
    backgroundColor: colors.white,
    borderColor: colors.gray,
  },
  buttonText: {
    ...typography.body,
    fontWeight: "bold",
  },
  followButtonText: {
    color: colors.white,
  },
  unfollowButtonText: {
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
  },
});
