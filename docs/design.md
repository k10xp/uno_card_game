# Uno card game design

This card game is built from a web dev's perspective. Future revisions may include rewrite to C# Unity or similar game engines with option to build web-based games.

## Frontend and UI

Graphics

Card images can be obtained as royalty-free images or create ourselves from template. Same for background and any menu items. UI components can be a text-only button in initial stages.

Game UI

![game board](https://heartsfreegame.com/images/uploads/screen2.jpg?1616423511383)

Player's cards are shown. Everyone else cards are hidden. 4 players total to keep things simple. Names are chosen at random from predefined list.

Frontend framework

We will use Vue for its simplicity (state management, code logic...). Open to consider other frontend frameworks or vanilla JavaScript.

## Game modes

There will be 3 game modes. Vs computer, Vs friends, Test hand. Vs computer will have 3 levels of difficulty.

1. Easy mode. The computer plays 1 number card at random (within ruleset, plays non-number card when necessary).
2. Intermediate mode. The computer picks 1 pre-programmed (not necessary optimized) strategy at random each turn.
3. Expert mode. Select strategies from intermediate mode. To be determined.

Vs friends is all human players. No players can join once game starts. Losing connection is automatic forfeit. A player has 15 seconds to make a move otherwise their turn is skipped. 3 skipped turns is automatic forfeit.

Test hand is player vs 1 computer opponent. This mode is for testing strategies. Player can have random hand or pick own cards.

## Game state

1. player hand: card count, cards
   - player wins if hand card count is 0 aka all cards played
2. cards in deck: automatically shuffle played cards into draw pile when needed
   - easier logic is have infinite draw pile, played cards are not tracked
     - downside of this being not realistic simulation
3. connected players: automatically declare last connected player as winner
4. winning score: each game won is 1 point
