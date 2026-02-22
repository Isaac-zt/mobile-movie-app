import {
  Text,
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";
import type { Movie } from "@/types";

interface MovieCardProps extends Movie {
  isSaved?: boolean;
  onSavePress?: () => void;
}

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  isSaved = false,
  onSavePress,
}: MovieCardProps) => {
  return (
    <View className="w-[30%] relative">
      <Link href={`/movies/${id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "https://placehold.co/600x400/1a1a1a/ffffff.png",
            }}
            className="w-full h-52 rounded-lg"
            resizeMode="cover"
          />
          <Text
            className="text-sm font-bold text-white mt-2"
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className='flex-row items-center justify-start gap-x-1'>
            <Image source={icons.star} className='size-4' />

            <Text className='text-xs text-white font-bold uppercase'>{Math.round(vote_average / 2)}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-light-300 font-medium mt-1">
              {release_date?.split("-")[0]}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>

      {onSavePress && (
        <TouchableOpacity
          onPress={onSavePress}
          className="absolute top-2 right-2 size-9 rounded-full bg-black/50 flex items-center justify-center"
          style={styles.heartButton}
        >
          <Image
            source={icons.save}
            className="size-5"
            tintColor={isSaved ? "#E50914" : "#fff"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heartButton: {
    zIndex: 10,
  },
});

export default MovieCard