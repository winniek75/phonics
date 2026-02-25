export interface TrickyWord {
  word: string;
  group: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  audioFile: string;
}

export const trickyWords: TrickyWord[] = [
  // Group 1
  { word: "the", group: 1, audioFile: "/audio/tricky/the.mp3" },
  { word: "I", group: 1, audioFile: "/audio/tricky/I.mp3" },
  { word: "go", group: 1, audioFile: "/audio/tricky/go.mp3" },
  { word: "no", group: 1, audioFile: "/audio/tricky/no.mp3" },
  { word: "to", group: 1, audioFile: "/audio/tricky/to.mp3" },
  { word: "into", group: 1, audioFile: "/audio/tricky/into.mp3" },

  // Group 2
  { word: "he", group: 2, audioFile: "/audio/tricky/he.mp3" },
  { word: "she", group: 2, audioFile: "/audio/tricky/she.mp3" },
  { word: "we", group: 2, audioFile: "/audio/tricky/we.mp3" },
  { word: "me", group: 2, audioFile: "/audio/tricky/me.mp3" },
  { word: "be", group: 2, audioFile: "/audio/tricky/be.mp3" },
  { word: "was", group: 2, audioFile: "/audio/tricky/was.mp3" },
  { word: "my", group: 2, audioFile: "/audio/tricky/my.mp3" },
  { word: "you", group: 2, audioFile: "/audio/tricky/you.mp3" },
  { word: "they", group: 2, audioFile: "/audio/tricky/they.mp3" },
  { word: "her", group: 2, audioFile: "/audio/tricky/her.mp3" },
  { word: "all", group: 2, audioFile: "/audio/tricky/all.mp3" },
  { word: "are", group: 2, audioFile: "/audio/tricky/are.mp3" },

  // Group 3
  { word: "come", group: 3, audioFile: "/audio/tricky/come.mp3" },
  { word: "some", group: 3, audioFile: "/audio/tricky/some.mp3" },
  { word: "said", group: 3, audioFile: "/audio/tricky/said.mp3" },
  { word: "here", group: 3, audioFile: "/audio/tricky/here.mp3" },
  { word: "there", group: 3, audioFile: "/audio/tricky/there.mp3" },
  { word: "where", group: 3, audioFile: "/audio/tricky/where.mp3" },
  { word: "love", group: 3, audioFile: "/audio/tricky/love.mp3" },
  { word: "live", group: 3, audioFile: "/audio/tricky/live.mp3" },
  { word: "give", group: 3, audioFile: "/audio/tricky/give.mp3" },
  { word: "little", group: 3, audioFile: "/audio/tricky/little.mp3" },
  { word: "down", group: 3, audioFile: "/audio/tricky/down.mp3" },
  { word: "what", group: 3, audioFile: "/audio/tricky/what.mp3" },

  // Group 4
  { word: "when", group: 4, audioFile: "/audio/tricky/when.mp3" },
  { word: "why", group: 4, audioFile: "/audio/tricky/why.mp3" },
  { word: "who", group: 4, audioFile: "/audio/tricky/who.mp3" },
  { word: "which", group: 4, audioFile: "/audio/tricky/which.mp3" },
  { word: "one", group: 4, audioFile: "/audio/tricky/one.mp3" },
  { word: "once", group: 4, audioFile: "/audio/tricky/once.mp3" },
  { word: "have", group: 4, audioFile: "/audio/tricky/have.mp3" },
  { word: "like", group: 4, audioFile: "/audio/tricky/like.mp3" },
  { word: "time", group: 4, audioFile: "/audio/tricky/time.mp3" },
  { word: "could", group: 4, audioFile: "/audio/tricky/could.mp3" },
  { word: "would", group: 4, audioFile: "/audio/tricky/would.mp3" },
  { word: "should", group: 4, audioFile: "/audio/tricky/should.mp3" },

  // Group 5
  { word: "right", group: 5, audioFile: "/audio/tricky/right.mp3" },
  { word: "two", group: 5, audioFile: "/audio/tricky/two.mp3" },
  { word: "four", group: 5, audioFile: "/audio/tricky/four.mp3" },
  { word: "eight", group: 5, audioFile: "/audio/tricky/eight.mp3" },
  { word: "people", group: 5, audioFile: "/audio/tricky/people.mp3" },
  { word: "water", group: 5, audioFile: "/audio/tricky/water.mp3" },
  { word: "called", group: 5, audioFile: "/audio/tricky/called.mp3" },
  { word: "looked", group: 5, audioFile: "/audio/tricky/looked.mp3" },
  { word: "asked", group: 5, audioFile: "/audio/tricky/asked.mp3" },
  { word: "their", group: 5, audioFile: "/audio/tricky/their.mp3" },
  { word: "oh", group: 5, audioFile: "/audio/tricky/oh.mp3" },
  { word: "your", group: 5, audioFile: "/audio/tricky/your.mp3" },

  // Group 6
  { word: "Mr", group: 6, audioFile: "/audio/tricky/Mr.mp3" },
  { word: "Mrs", group: 6, audioFile: "/audio/tricky/Mrs.mp3" },
  { word: "Ms", group: 6, audioFile: "/audio/tricky/Ms.mp3" },
  { word: "laughed", group: 6, audioFile: "/audio/tricky/laughed.mp3" },
  { word: "because", group: 6, audioFile: "/audio/tricky/because.mp3" },
  { word: "different", group: 6, audioFile: "/audio/tricky/different.mp3" },
  { word: "through", group: 6, audioFile: "/audio/tricky/through.mp3" },
  { word: "thought", group: 6, audioFile: "/audio/tricky/thought.mp3" },
  { word: "many", group: 6, audioFile: "/audio/tricky/many.mp3" },
  { word: "another", group: 6, audioFile: "/audio/tricky/another.mp3" },
  { word: "again", group: 6, audioFile: "/audio/tricky/again.mp3" },
  { word: "around", group: 6, audioFile: "/audio/tricky/around.mp3" },

  // Group 7
  { word: "always", group: 7, audioFile: "/audio/tricky/always.mp3" },
  { word: "also", group: 7, audioFile: "/audio/tricky/also.mp3" },
  { word: "after", group: 7, audioFile: "/audio/tricky/after.mp3" },
  { word: "every", group: 7, audioFile: "/audio/tricky/every.mp3" },
  { word: "every", group: 7, audioFile: "/audio/tricky/every.mp3" },
  { word: "father", group: 7, audioFile: "/audio/tricky/father.mp3" },
  { word: "class", group: 7, audioFile: "/audio/tricky/class.mp3" },
  { word: "plant", group: 7, audioFile: "/audio/tricky/plant.mp3" },
  { word: "path", group: 7, audioFile: "/audio/tricky/path.mp3" },
  { word: "bath", group: 7, audioFile: "/audio/tricky/bath.mp3" },
  { word: "hour", group: 7, audioFile: "/audio/tricky/hour.mp3" },
  { word: "money", group: 7, audioFile: "/audio/tricky/money.mp3" },
];

export function getTrickyWordsByGroup(group: number): TrickyWord[] {
  return trickyWords.filter((w) => w.group === group);
}

export function getTrickyWordsUpToGroup(maxGroup: number): TrickyWord[] {
  return trickyWords.filter((w) => w.group <= maxGroup);
}
