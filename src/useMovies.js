import { useState, useEffect } from "react";
const KEY = "ef73260b";
export function useMoives(Query) {
  const [movies, setMovies] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      //for not fecthing everytimes
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setError("");
          setIsloading(true);

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${Query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);

          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);

            setError(err.message);
          }
        } finally {
          setIsloading(false);
        }
      }
      if (Query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      //when fetch new than close old movie details
      //   handleCloseMovie();
      fetchMovies();
      return function () {
        //not evrytime fetch
        controller.abort();
      };
    },
    [Query]
  );
  return { movies, isloading, error };
}
