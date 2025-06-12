import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar.tsx";
import MovieGrid from "../MovieGrid/MovieGrid.tsx";
import { getMovies } from "../../services/movieService.ts";
import type { Movie } from "../../types/movie.ts";
import MovieModal from "../MovieModal/MovieModal.tsx";
import Loader from "../Loader/Loader.tsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.tsx";
import styles from "./App.module.css";

export default function App() {
  const [movie, setMovie] = useState<Movie[]>([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const notifyError = () =>
    toast.error("No movies found for your request.", {
      style: { background: "rgba(125, 183, 255, 0.8)" },
      icon: "ℹ️",
    });

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleSearch = async (topic: string) => {
    try {
      setMovie([]);
      setError(false);
      setIsLoading(true);
      const newMovie = await getMovies(topic);
      if (newMovie.length === 0) {
        notifyError();
      } else {
        setMovie(newMovie);
      }
    } catch {
      setError(true);
      setMovie([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={handleSearch} />
      <Toaster />
      {isLoading && <Loader />}
      {error && <ErrorMessage />}
      {movie.length > 0 && <MovieGrid onSelect={openModal} movies={movie} />}
      {selectedMovie !== null && (
        <MovieModal onClose={closeModal} movie={selectedMovie} />
      )}
    </div>
  );
}
