export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview?: string;
}

export interface SavedMovie {
  $id: string;
  movie_id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}
