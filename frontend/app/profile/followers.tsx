import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { User } from "@/types/auth";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, UserCheck, UserPlus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FollowersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchFollowers, followers, isLoading, followUser, unfollowUser, isFollowing } = useProfileStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, [id]);

  const loadFollowers = async () => {
    if (id) {
      await fetchFollowers(id);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFollowers();
    setRefreshing(false);
  };

  const handleFollowToggle = async (followerId: string) => {
    if (isFollowing(followerId)) {
      await unfollowUser(followerId);
    } else {
      await followUser(followerId);
    }
  };

  const renderFollowerItem = ({ item }: { item: User }) => {
    const isCurrentUser = user?.id === item.id;
    const following = isFollowing(item.id);

    return (
      <TouchableOpacity
        style={styles.followerItem}
        onPress={() => router.push(`/profile/${item.id}`)}
      >
        <Image
          source={{ uri: item.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.followerInfo}>
          <Text style={styles.followerName}>{item.name}</Text>
          <Text style={styles.followerBio}>{item.bio || "No bio"}</Text>
        </View>
        {!isCurrentUser && (
          <TouchableOpacity
            style={[
              styles.followButton,
              following && styles.followingButton,
            ]}
            onPress={() => handleFollowToggle(item.id)}
          >
            {following ? (
              <UserCheck size={16} color={colors.primary} />
            ) : (
              <UserPlus size={16} color={colors.white} />
            )}
            <Text
              style={[
                styles.followButtonText,
                following && styles.followingButtonText,
              ]}
            >
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Followers</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollowerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No followers yet</Text>
            </View>
          }
        />
      )}
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
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  followerInfo: {
    flex: 1,
  },
  followerName: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  followerBio: {
    ...typography.bodySmall,
    color: colors.lightText,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followingButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
    marginLeft: 4,
  },
  followingButtonText: {
    color: colors.primary,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.lightText,
  },
});
