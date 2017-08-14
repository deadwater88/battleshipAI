[BattleshipAI LIVE]:https://deadwater88.github.io/battleshipAI/

## Instructions:

On prompt, enter "h" for a human vs AI game or
enter anything else to start computer cycles.

For AI vs AI games, enter the amount of game cycles to run. (Each cycle takes about 2 seconds to complete)

Computer targeting heurestics will essentially be relatively dumb initially. After many games, it will be biased towards
squares that it has fired successfully on.


## Future Notes:
Game component kind of suffered from scope creep. Would be better to partition out some of its functions to another file. Game.js maybe.

Hunting heuristics can probably be enhanced. Currently will check EVERY square that is adjacent to a hit square, before returning to blind mode.
Better heuristics should disengage hunting after the ship has successfully been sunk.

Candidate coordinate spacing should also be adjusted depending on the smallest-sized ship.
Will force recalculation of candidates. Could be messy.
