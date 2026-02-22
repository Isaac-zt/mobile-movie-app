import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "react-native";
import { FavouritesProvider } from "@/context/FavouritesContext";

export default function RootLayout() {
  return (
    <FavouritesProvider>
      <StatusBar hidden={true} />

      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="movies/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </FavouritesProvider>
  );
}
