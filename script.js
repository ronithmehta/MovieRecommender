const API_KEY = "api_key=1cf50e6248dc270629e802686245c2c8";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;
const recommendationsHeader = document.getElementById("recommendations-header");
const main = document.getElementById("main");
const recommendations = document.getElementById("recommendations");
const form = document.getElementById("form");
const search = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const genreSelect = document.getElementById("genre");
const moodSelect = document.getElementById("mood");

// Initial API URL to fetch movies sorted by popularity
let API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;

getMovies(API_URL);

function getMovies(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      showMovies(data.results);
    });
}

function showMovies(data) {
  main.innerHTML = "";
  const genrePromises = [];

  data.forEach((movie) => {
    const { id, title, poster_path, vote_average, overview } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    const genrePromise = fetch(`${BASE_URL}/movie/${id}?${API_KEY}&language=en-US`)
      .then((res) => res.json())
      .then((data) => {
        const genres = data.genres.map((genre) => genre.name).join(", ");
        return genres;
      });

    genrePromises.push(genrePromise);

    movieEl.innerHTML = `
      <img src="${IMG_URL + poster_path}" alt="${title}" class="movie-image">
      <div class="movie-info">
        <h3>${title}</h3>
        <p class="genre">Loading...</p>
        <span class="${getColor(vote_average)}">${Math.round(vote_average * 10) / 10}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        <p>${overview}</p>
      </div>
      <button class="watch-btn" onclick="watchMovie('${title}')">Watch Movie</button>
    `;

    main.appendChild(movieEl);

    const movieImage = movieEl.querySelector(".movie-image");
    movieImage.addEventListener("click", () => {
      const overview = movieEl.querySelector(".overview");
      overview.classList.toggle("show");
    });
  });

  Promise.all(genrePromises).then((genres) => {
    const genreElements = main.querySelectorAll(".genre");
    genreElements.forEach((genreElement, index) => {
      genreElement.textContent = genres[index];
    });
  });
}

function getColor(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

function watchMovie(movieName) {
  const searchQuery = encodeURIComponent(movieName);
  const googleUrl = `https://www.google.com/search?q=${searchQuery}`;
  window.open(googleUrl, "_blank");
}

// Event listener for form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  const filter = filterSelect.value;
  const genre = genreSelect.value;
  const mood = moodSelect.value;

  let sortBy;

  switch (filter) {
    case "popularity":
      sortBy = "popularity.desc";
      break;
    case "rating":
      sortBy = "vote_average.desc";
      break;
    case "release":
      sortBy = "release_date.desc";
      break;
    default:
      sortBy = "popularity.desc";
      break;
  }

  if (searchTerm) {
    const searchQuery = searchURL + "&query=" + searchTerm;
    const filterParam = filter ? "&sort_by=" + sortBy : "";
    const genreParam = genre ? "&with_genres=" + genre : "";
    getMovies(searchQuery + filterParam + genreParam);
    recommendationsHeader.hidden = false;
  } else if (mood) {
    applyMoodFilter(mood, sortBy);
    recommendationsHeader.hidden = false;
  } else {
    const filterParam = filter ? "&sort_by=" + sortBy : "";
    const genreParam = genre ? "&with_genres=" + genre : "";
    getMovies(BASE_URL + "/discover/movie?" + filterParam + genreParam + "&" + API_KEY);
    recommendationsHeader.hidden = true;
  }
});

// Event listener for mood selection
moodSelect.addEventListener("change", () => {
  const selectedMood = moodSelect.value;
  if (selectedMood !== "") {
    applyMoodFilter(selectedMood);
  }
});

// Function to apply mood filter
function applyMoodFilter(mood) {
  let genreId;

  switch (mood) {
    case "happy":
      genreId = 35; // Comedy genre ID
      break;
    case "sad":
      genreId = 18; // Drama genre ID
      break;
    case "angry":
      genreId = 28; // Action genre ID
      break;
    default:
      genreId = "";
      break;
  }

  if (genreId !== "") {
    const genreParam = "&with_genres=" + genreId;
    getMovies(BASE_URL + "/discover/movie?" + genreParam + "&" + API_KEY);
  }
}

// Event listener for logo click
document.getElementById("logo").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "index.html";
});
