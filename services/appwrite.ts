import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";
import type { Movie, SavedMovie } from "@/types";

interface SearchMovie {
  id: number;
  title: string;
  poster_path: string;
}

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const FAVOURITES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_FAVOURITES_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client);

/* =========================
   AUTH / SESSION
========================= */

const isAuthenticated = async (): Promise<boolean> => {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
};

export const ensureSession = async (): Promise<boolean> => {
  if (await isAuthenticated()) return true;

  try {
    await account.createAnonymousSession();
    return true;
  } catch (e) {
    console.warn("Could not create anonymous session:", e);
    return false;
  }
};

/* =========================
   SEARCH COUNT / TRENDING
========================= */

export const updateSearchCount = async (
  query: string,
  movie: SearchMovie
) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];

      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  { movie_id: number; title: string; poster_url: string }[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as {
      movie_id: number;
      title: string;
      poster_url: string;
    }[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

/* =========================
   SAVED / FAVOURITES
========================= */

export const saveMovie = async (movie: Movie): Promise<void> => {
  if (!FAVOURITES_COLLECTION_ID) {
    throw new Error("FAVOURITES_COLLECTION_ID is not configured");
  }

  const user = await account.get();

  try {
    // Prevent duplicate saves per user
    const existing = await database.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION_ID,
      [
        Query.equal("movie_id", movie.id),
        Query.equal("user_id", user.$id),
      ]
    );

    if (existing.documents.length > 0) return;

    await database.createDocument(
      DATABASE_ID,
      FAVOURITES_COLLECTION_ID,
      ID.unique(),
      {
        user_id: user.$id,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path ?? "",
        vote_average: movie.vote_average ?? 0,
        release_date: movie.release_date ?? "",
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const unsaveMovie = async (movieId: number): Promise<void> => {
  if (!FAVOURITES_COLLECTION_ID) {
    throw new Error("FAVOURITES_COLLECTION_ID is not configured");
  }

  const user = await account.get();

  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION_ID,
      [
        Query.equal("movie_id", movieId),
        Query.equal("user_id", user.$id),
      ]
    );

    if (result.documents.length > 0) {
      await database.deleteDocument(
        DATABASE_ID,
        FAVOURITES_COLLECTION_ID,
        result.documents[0].$id
      );
    }
  } catch (error) {
    console.error("Error unsaving movie:", error);
    throw error;
  }
};

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  if (!FAVOURITES_COLLECTION_ID) return [];

  const user = await account.get();

  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION_ID,
      [
        Query.equal("user_id", user.$id),
        Query.orderDesc("$createdAt"),
      ]
    );

    return result.documents as unknown as SavedMovie[];
  } catch (error) {
    console.error("Error fetching saved movies:", error);
    return [];
  }
};

export const getSavedMovieIds = async (): Promise<number[]> => {
  if (!FAVOURITES_COLLECTION_ID) return [];

  const user = await account.get();

  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVOURITES_COLLECTION_ID,
      [
        Query.equal("user_id", user.$id),
        Query.select(["movie_id"]),
      ]
    );

    return (result.documents as unknown as { movie_id: number }[]).map(
      (d) => d.movie_id
    );
  } catch (error) {
    console.error("Error fetching saved movie IDs:", error);
    return [];
  }
};
