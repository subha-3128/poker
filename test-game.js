const PokerGame = require('./lib/pokerGame');
const assert = require('assert');

function runTests() {
  console.log('--- Running PokerGame Tests ---');

  // Test 1: Room setup & 2 players
  {
    console.log('Test 1: Heads-up start and fold');
    const game = new PokerGame('1234', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    assert.strictEqual(game.players.length, 2);

    game.startGame();
    assert.strictEqual(game.stage, 'playing');
    assert.strictEqual(game.street, 'preflop');
    // Blinds posted: Alice (dealer/SB) = 10, Bob (BB) = 20
    const alice = game.players.find(p => p.id === 'p1');
    const bob = game.players.find(p => p.id === 'p2');
    assert.strictEqual(alice.chips, 990);
    assert.strictEqual(bob.chips, 980);
    assert.strictEqual(game.pot, 30);
    assert.strictEqual(game.highestBet, 20);

    // In heads-up preflop, Dealer (Alice) acts first
    assert.strictEqual(game.currentTurnPlayerId, 'p1');

    // Alice calls 20 (adds 10)
    game.handleAction('p1', 'call');
    assert.strictEqual(alice.chips, 980);
    assert.strictEqual(game.pot, 40);

    // Bob has option in BB, Bob checks
    assert.strictEqual(game.currentTurnPlayerId, 'p2');
    game.handleAction('p2', 'check');

    // Betting round complete! Should advance to flop
    assert.strictEqual(game.street, 'flop');
    assert.strictEqual(game.highestBet, 0);

    // In heads-up post-flop, non-dealer (Bob) acts first
    assert.strictEqual(game.currentTurnPlayerId, 'p2');

    // Bob bets 50 (raises to 50)
    game.handleAction('p2', 'raise', 50);
    assert.strictEqual(bob.chips, 930);
    assert.strictEqual(game.highestBet, 50);

    // Alice folds
    assert.strictEqual(game.currentTurnPlayerId, 'p1');
    game.handleAction('p1', 'fold');

    // Bob should win pot (40 + 50 = 90)
    assert.strictEqual(game.street, 'hand_ended');
    assert.strictEqual(bob.chips, 930 + 90); // 1020
    assert.strictEqual(alice.chips, 980);
    console.log('✅ Test 1 Passed!');
  }

  // Test 2: 3-Player Side Pot
  {
    console.log('Test 2: 3-Player Side Pot calculation');
    const game = new PokerGame('5678', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    game.addPlayer('p3', 'Charlie', 's3');

    // Set chips manually to test side pots
    game.players[0].chips = 100; // Alice has 100
    game.players[1].chips = 300; // Bob has 300
    game.players[2].chips = 1000; // Charlie has 1000

    game.startGame();
    // Alice dealer, Bob SB (10), Charlie BB (20)
    // Alice has 100 chips. Let's make Alice go All-In
    assert.strictEqual(game.currentTurnPlayerId, 'p1');
    game.handleAction('p1', 'allin'); // Alice all-in for 100
    assert.strictEqual(game.players[0].isAllIn, true);

    // Bob raises to 300 (All-in)
    assert.strictEqual(game.currentTurnPlayerId, 'p2');
    game.handleAction('p2', 'allin'); // Bob all-in for 300
    assert.strictEqual(game.players[1].isAllIn, true);

    // Charlie calls 300
    assert.strictEqual(game.currentTurnPlayerId, 'p3');
    game.handleAction('p3', 'call'); // Charlie calls 300

    // Everyone all in or matched, should reach showdown
    assert.strictEqual(game.street, 'showdown');

    // Pots calculation:
    // Alice: 100
    // Bob: 300
    // Charlie: 300
    // Main Pot: 100 * 3 = 300 (eligible: Alice, Bob, Charlie)
    // Side Pot: (300 - 100) * 2 = 400 (eligible: Bob, Charlie)
    const pots = game.pots;
    assert.strictEqual(pots.length, 2);
    assert.strictEqual(pots[0].amount, 300);
    assert.deepStrictEqual(pots[0].eligiblePlayerIds.sort(), ['p1', 'p2', 'p3'].sort());
    assert.strictEqual(pots[1].amount, 400);
    assert.deepStrictEqual(pots[1].eligiblePlayerIds.sort(), ['p2', 'p3'].sort());

    // Host awards main pot to Alice, side pot to Bob
    game.awardPots({
      pots: [
        { potId: 'main', winnerIds: ['p1'] },
        { potId: 'side_1', winnerIds: ['p2'] }
      ]
    });

    assert.strictEqual(game.players[0].chips, 300);
    assert.strictEqual(game.players[1].chips, 400);
    assert.strictEqual(game.players[2].chips, 700);
    console.log('✅ Test 2 Passed!');
  }

  // Test 3: Rebuy and End of Game Summary
  {
    console.log('Test 3: Rebuy and Leaderboard');
    const game = new PokerGame('9999', 'p1', { startingChips: 1000 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');

    game.rebuy('p2', 500); // Bob buys in 500 more chips
    const bob = game.players.find(p => p.id === 'p2');
    assert.strictEqual(bob.chips, 1500);
    assert.strictEqual(bob.totalRebuys, 500);

    const leaderboard = game.endGame();
    assert.strictEqual(leaderboard.length, 2);
    const bobSummary = leaderboard.find(l => l.name === 'Bob');
    // Bob totalBuyIn = 1000 + 500 = 1500, chips = 1500, profit = 0
    assert.strictEqual(bobSummary.totalBuyIn, 1500);
    assert.strictEqual(bobSummary.profitLoss, 0);

    console.log('✅ Test 3 Passed!');
  }

  console.log('🎉 All PokerGame Unit Tests Passed Successfully!');
}

runTests();
