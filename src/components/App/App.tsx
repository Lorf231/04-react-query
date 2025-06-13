import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar.tsx";
import MovieGrid from "../MovieGrid/MovieGrid.tsx";
import { fetchMovies } from "../../services/movieService.ts";
import type { Movie, MoviesResponse } from "../../types/movie.ts";
import MovieModal from "../MovieModal/MovieModal.tsx";
import Loader from "../Loader/Loader.tsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.tsx";
import styles from "./App.module.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";

type MovieObj = Movie | null;

export default function App() {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<MovieObj>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isError, isLoading, isSuccess } = useQuery<MoviesResponse>({
    queryKey: ["myQueryKey", searchValue, currentPage],
    queryFn: () => fetchMovies(searchValue, currentPage),
    enabled: !!searchValue && searchValue.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  function handleGet(value: string): void {
    setSearchValue(value);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (isSuccess && data?.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [data, isSuccess]);

  function openModal(movie: Movie): void {
    setSelectedMovie(movie);
  }

  function closeModal(): void {
    setSelectedMovie(null);
  }

  const shouldShowPagination =
    typeof data?.total_pages === "number" &&
    data.total_pages > 1 &&
    !isError &&
    !isLoading;

  return (
    <div className={styles.app}>
      <Toaster />
      <SearchBar onSubmit={handleGet} />
      {isError && <ErrorMessage />}
      {isLoading && <Loader />}
      {isSuccess && data?.results && (
        <MovieGrid onSelect={openModal} movies={data.results} />
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
      {shouldShowPagination && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setCurrentPage(selected + 1)}
          containerClassName={styles.pagination}
          activeClassName={styles.active}
          nextLabel="→"
          previousLabel="←"
          forcePage={currentPage - 1}
        />
      )}
    </div>
  );
}
