const { movies } = require('./data');

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

const getName = ({ name }) => name;
const getCastMembers = movie => movie.heroes.map(getName).concat(movie.villains.map(getName));

const movieRoot = {
  movies: ({ castMemberName }) =>
    movies.filter(m => (castMemberName ? getCastMembers(m).includes(castMemberName) : true)),
  randomMovie: () => movies[Math.floor(Math.random() * movies.length)],
};

module.exports = {
  movieRoot,
  movieSchema,
};
