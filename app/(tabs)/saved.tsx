import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getSavedMovies } from "@/services/appwrite";
import { useFavourites } from "@/context/FavouritesContext";
import MovieCard from "@/components/MovieCard";
import type { SavedMovie } from "@/types";

const Saved = () => {
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const { savedMovieIds, toggleSave, refetch } = useFavourites();

  const loadSaved = useCallback(async () => {
    try {
      const movies = await getSavedMovies();
      setSavedMovies(movies);
    } catch {
      setSavedMovies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnce.current) setLoading(true);
      hasLoadedOnce.current = true;
      loadSaved();
      refetch();
    }, [loadSaved, refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await loadSaved();
  }, [loadSaved, refetch]);

  if (loading && savedMovies.length === 0) {
    return (
      <View className="bg-primary flex-1 px-10">
        <View className="flex justify-center items-center flex-1">
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      </View>
    );
  }

  if (savedMovies.length === 0) {
    return (
      <View className="bg-primary flex-1">
        <Image
          source={images.bg}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        <View className="flex justify-center items-center flex-1 flex-col gap-5 px-10">
          <Image
            source={icons.save}
            className="size-16"
            tintColor="#666"
          />
          <Text className="text-gray-400 text-center text-base">
            No saved movies yet
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Tap the heart on any movie to add it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="absolute w-full h-full"
        resizeMode="cover"
      />
      <View className="px-5 pt-20 pb-32">
        <Text className="text-white font-bold text-xl mb-4">Saved Movies</Text>
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.$id}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            paddingRight: 5,
            marginBottom: 10,
          }}
          renderItem={({ item }) => (
            <MovieCard
              id={item.movie_id}
              title={item.title}
              poster_path={item.poster_path}
              vote_average={item.vote_average}
              release_date={item.release_date}
              isSaved={savedMovieIds.has(item.movie_id)}
              onSavePress={() =>
                toggleSave({
                  id: item.movie_id,
                  title: item.title,
                  poster_path: item.poster_path,
                  vote_average: item.vote_average,
                  release_date: item.release_date,
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E50914"
            />
          }
        />
      </View>
    </View>
  );
};

export default Saved;
