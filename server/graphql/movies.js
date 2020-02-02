const { movies } = require('./data');

// Note that we can use types defined in other files
const movieSchema = `
  type Movie {
    name: String!
    heroes: [Hero!]!
    villains: [Villain!]!
  }

  type Query {
    movies(name: String, castMemberName: String): [Movie!]!
    randomMovie: Movie!
  }
`;

const getCastMembers = movie => movie.heroes.concat(movie.villains);

class Query {
  movies = ({ name, castMemberName } = {}) => {
    const movieByName = name && movies.filter(m => m.name.match(new RegExp(name, 'i')));
    const movieByCastMember =
      castMemberName &&
      movies.filter(m =>
        getCastMembers(m).some(c => c.name.match(new RegExp(castMemberName, 'i')))
      );

    return movieByName || movieByCastMember || movies;
  };

  randomMovie = () => {
    return movies[Math.floor(Math.random() * movies.length)];
  };
}

module.exports = {
  movieRoot: new Query(),
  movieSchema,
};
