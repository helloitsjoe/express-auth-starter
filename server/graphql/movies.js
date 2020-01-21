const { movies } = require('./data');

// Note that we can use types defined in other files
const movieSchema = `
  type Movie {
    name: String!
    heroes: [Hero!]!
    villains: [Villain!]!
  }

  type MovieQuery {
    movies(castMemberName: String): [Movie!]!
    randomMovie: Movie!
  }

  type Query {
    movie: MovieQuery!
  }
`;

const getCastMembers = movie => movie.heroes.concat(movie.villains);

const movieRoot = {
  movies: ({ castMemberName }) =>
    movies.filter(m =>
      castMemberName ? getCastMembers(m).some(({ name }) => name === castMemberName) : true
    ),
  randomMovie: () => movies[Math.floor(Math.random() * movies.length)],
};

module.exports = {
  movieRoot,
  movieSchema,
};
