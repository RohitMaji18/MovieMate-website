import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "ef73260b";

export default function App() {
  const [Query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [SelectedId, setSelectedId] = useState(null);

  function handleselectMovie(id) {
    setSelectedId((SelectedId) => (id === SelectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }
  //crete an array for watched movie
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

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
      handleCloseMovie();
      fetchMovies();
      return function () {
        //not evrytime fetch
        controller.abort();
      };
    },
    [Query]
  );

  return (
    <>
      <NavBar>
        <Logo />
        <Search Query={Query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isloading ? <Load /> : <MovieList movies={movies} />} */}
          {isloading && <Load />}
          {!isloading && !error && (
            <MovieList movies={movies} onSelectMovie={handleselectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {SelectedId ? (
            <MovieDetails
              SelectedId={SelectedId}
              oncloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function Load() {
  return <p className="loader">Loding...</p>;
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🎬</span>
      <h1>MovieMate</h1>
    </div>
  );
}
function Search({ Query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={Query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);

//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({ SelectedId, oncloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isloading, setIsloading] = useState(false);
  const [userRating, setuserRating] = useState("");

  //search movie which i watched and listed
  const isWatched = watched.map((movie) => movie.imdbID).includes(SelectedId);

  //for user rating
  const watchedUserrating = watched.find(
    (movie) => movie.imdbID === SelectedId
  )?.userRating;

  //like we are write movie.anything so dont write that

  //thats why movie===
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: SelectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      // countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);

    oncloseMovie();
  }
  //for keypress on movie details so we want close that
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          oncloseMovie();
        }
      }
      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [oncloseMovie]
  );
  //for movie deatils rating duration etc.
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsloading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${SelectedId}`
        );
        const data = await res.json();
        setMovie(data);

        setIsloading(false);
      }
      getMovieDetails();
    },
    [SelectedId]
  );
  //for page title
  useEffect(
    function () {
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "MovieMate";
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isloading ? (
        <Load />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={oncloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setuserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You listed and rated <span>⭐{watchedUserrating}</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
//if you push in git hub then use this code change name put App.js
