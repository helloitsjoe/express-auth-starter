const MOVIE = {
  RAIDERS: 'Raiders of the Lost Ark',
  TEMPLE: 'Temple of Doom',
  CRUSADE: 'The Last Crusade',
  INCREDIBLES: 'The Incredibles',
  BATMAN: 'Batman',
  X_MEN: 'X-Men',
};

const heroes = [
  { name: 'Mr. Incredible', powers: ['strength', 'invulnerability'], movies: [MOVIE.INCREDIBLES] },
  { name: 'Mrs. Incredible', powers: ['stretch', 'strength'], movies: [MOVIE.INCREDIBLES] },
  { name: 'Dash', powers: ['speed'], movies: [MOVIE.INCREDIBLES] },
  { name: 'Violet', powers: ['invisibility'], movies: [MOVIE.INCREDIBLES] },
  {
    name: 'Jack-Jack',
    powers: ['fire', 'transformation', 'teleportation', 'strength', 'stretch'],
    movies: [MOVIE.INCREDIBLES],
  },
  {
    name: 'Indiana Jones',
    powers: ['whip', 'intelligence'],
    movies: [MOVIE.RAIDERS, MOVIE.TEMPLE, MOVIE.CRUSADE],
  },
  { name: 'Batman', powers: ['technology'], movies: [MOVIE.BATMAN] },
  { name: 'Wolverine', powers: ['adamantium', 'healing'], movies: [MOVIE.X_MEN] },
];

const villains = [
  { name: 'Bane', powers: ['strength', 'invulnerability'], movies: [MOVIE.BATMAN] },
  { name: 'The Joker', powers: ['psychology', 'chaos'], movies: [MOVIE.BATMAN] },
  { name: 'Magneto', powers: ['magnetism'], movies: [MOVIE.X_MEN] },
  { name: 'Syndrome', powers: ['technology'], movies: [MOVIE.INCREDIBLES] },
];

const createMovie = name => {
  const isInMovie = character => character.movies.includes(name);
  return {
    name,
    heroes: heroes.filter(isInMovie),
    villains: villains.filter(isInMovie),
  };
};

const movies = [createMovie(MOVIE.INCREDIBLES), createMovie(MOVIE.BATMAN)];

module.exports = {
  heroes,
  villains,
  movies,
};
