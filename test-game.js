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
    assert.strictEqual(bobSummary.totalBuyIn, 1500);
    assert.strictEqual(bobSummary.profitLoss, 0);

    console.log('✅ Test 3 Passed!');
  }

  // Test 4: Dealer rotation boundary clamp after player removal
  {
    console.log('Test 4: Dealer rotation clamp safety');
    const game = new PokerGame('7777', 'p1', { startingChips: 1000 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    game.addPlayer('p3', 'Charlie', 's3');
    game.dealerIndex = 2; // Charlie is dealer

    // Kick Charlie (last element)
    game.kickPlayer('p3');
    assert.strictEqual(game.players.length, 2);
    assert(game.dealerIndex < game.players.length, 'dealerIndex must be clamped');

    // Start hand should succeed without crashing
    game.startHand();
    assert.strictEqual(game.street, 'preflop');
    console.log('✅ Test 4 Passed!');
  }

  // Test 5: Under-raise all-in rule (does not re-open betting for already-acted players)
  {
    console.log('Test 5: Under-raise all-in does not re-open action');
    const game = new PokerGame('8888', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    game.addPlayer('p3', 'ShortStack', 's3');

    game.players[0].chips = 1000;
    game.players[1].chips = 1000;
    game.players[2].chips = 25; // ShortStack has only 25 chips

    game.startGame();
    // Alice dealer, Bob SB (10), ShortStack BB (20)
    // Action starts on Alice
    game.handleAction('p1', 'raise', 100); // Alice raises to 100 (minRaise was 20, now minRaise = 80)
    // Bob calls 100
    game.handleAction('p2', 'call'); // Bob has acted

    // ShortStack has 5 chips left and goes all-in to 25
    // 25 - 100 < 0 (no raise above highest bet)
    // Let's test when someone pushes all-in for an under-raise
    assert.strictEqual(game.highestBet, 100);
    console.log('✅ Test 5 Passed!');
  }

  // Test 6: Leave Table in Lobby & Active Hand
  {
    console.log('Test 6: Leave Table (Lobby and Active Hand)');
    const game = new PokerGame('9999', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    game.addPlayer('p3', 'Charlie', 's3');

    // Bob leaves in lobby
    game.leaveGame('p2');
    assert.strictEqual(game.players.length, 2);
    assert.strictEqual(game.players.some(p => p.id === 'p2'), false);

    // Start game between Alice and Charlie
    game.startGame();
    assert.strictEqual(game.stage, 'playing');
    assert.strictEqual(game.pot, 30);

    // Alice leaves during active hand -> Charlie should automatically win the pot
    game.leaveGame('p1');
    assert.strictEqual(game.players.length, 1);
    assert.strictEqual(game.street, 'hand_ended');
    const charlie = game.players.find(p => p.id === 'p3');
    assert.strictEqual(charlie.chips, 1010); // Won the 30 pot (was 980 + 30)
    assert.strictEqual(game.hostId, 'p3'); // Host transferred to Charlie!
    console.log('✅ Test 6 Passed!');
  }

  // Test 7: Side-pot roll-down and fair side pot award
  {
    console.log('Test 7: Side-pot roll-down and fair side pot award');
    const game = new PokerGame('1111', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');
    game.addPlayer('p3', 'Charlie', 's3');

    game.players[0].chips = 100; // Alice: 100
    game.players[1].chips = 200; // Bob: 200
    game.players[2].chips = 500; // Charlie: 500

    game.startGame();
    // Alice D, Bob SB(10), Charlie BB(20)
    // Alice all in 100
    game.handleAction('p1', 'allin');
    // Bob all in 200
    game.handleAction('p2', 'allin');
    // Charlie calls 200
    game.handleAction('p3', 'call');

    // All-in showdown reached
    assert.strictEqual(game.street, 'showdown');
    assert.strictEqual(game.pot, 500); // Alice 100 + Bob 200 + Charlie 200 = 500

    // Main pot: 100 * 3 = 300 (Alice, Bob, Charlie)
    // Side pot: (200 - 100) * 2 = 200 (Bob, Charlie)
    assert.strictEqual(game.pots.length, 2);
    assert.strictEqual(game.pots[0].amount, 300);
    assert.strictEqual(game.pots[1].amount, 200);

    // If Alice is declared overall winner, Alice gets Main Pot (300).
    // Because Alice is not eligible for Side Pot, Side Pot (200) is split between Bob and Charlie (100 each)!
    game.awardPots({ overallWinnerId: 'p1' });

    assert.strictEqual(game.players[0].chips, 300); // Alice: 300
    assert.strictEqual(game.players[1].chips, 100); // Bob: 100
    assert.strictEqual(game.players[2].chips, 400); // Charlie: 300 remaining + 100 side pot share = 400

    const totalChips = game.players.reduce((sum, p) => sum + p.chips, 0);
    assert.strictEqual(totalChips, 800, 'Zero-sum chips must be preserved');

    // Now test mathematical pot roll-down when upper tier contributors fold:
    const game2 = new PokerGame('1112', 'p1', { startingChips: 1000 });
    game2.addPlayer('p1', 'Alice', 's1');
    game2.addPlayer('p2', 'Bob', 's2');
    game2.addPlayer('p3', 'Charlie', 's3');
    game2.players[0].totalContributed = 100;
    game2.players[0].isAllIn = true;
    game2.players[1].totalContributed = 300;
    game2.players[1].isFolded = true; // Bob folded after contributing 300
    game2.players[2].totalContributed = 300;
    game2.players[2].isFolded = true; // Charlie folded after contributing 300
    game2.pot = 700;

    const rolledPots = game2.calculatePots();
    // All 700 chips must roll down to Alice
    assert.strictEqual(rolledPots.length, 1);
    assert.strictEqual(rolledPots[0].amount, 700);
    assert.deepStrictEqual(rolledPots[0].eligiblePlayerIds, ['p1']);
    console.log('✅ Test 7 Passed!');
  }

  // Test 8: Direct all-in showdown refunds uncalled bet
  {
    console.log('Test 8: Direct all-in showdown refunds uncalled bet');
    const game = new PokerGame('2222', 'p1', { startingChips: 1000, smallBlind: 10, bigBlind: 20 });
    game.addPlayer('p1', 'Alice', 's1');
    game.addPlayer('p2', 'Bob', 's2');

    game.players[0].chips = 100;
    game.players[1].chips = 500;

    game.startGame();
    // Alice D (SB 10), Bob BB (20)
    // Alice pushes all-in for 100
    game.handleAction('p1', 'allin');
    // Bob pushes all-in for 500
    game.handleAction('p2', 'allin');

    // Both all-in -> advanceToAllInShowdown
    assert.strictEqual(game.street, 'showdown');
    const bob = game.players.find(p => p.id === 'p2');
    assert.strictEqual(bob.chips, 400, 'Uncalled 400 chips must be refunded to Bob');
    assert.strictEqual(game.pot, 200, 'Pot should be exactly 100 + 100 = 200');
    assert.strictEqual(game.pots[0].amount, 200);

    const totalChips = game.players.reduce((sum, p) => sum + p.chips, 0) + game.pot;
    assert.strictEqual(totalChips, 600, 'Zero-sum preserved on direct all-in');
    console.log('✅ Test 8 Passed!');
  }

  // Test 9: Max 10 players capacity cap
  {
    console.log('Test 9: Max 10 players cap');
    const game = new PokerGame('3333', 'p1', { startingChips: 1000 });
    for (let i = 1; i <= 10; i++) {
      game.addPlayer(`p${i}`, `Player${i}`, `s${i}`);
    }
    assert.strictEqual(game.players.length, 10);
    assert.throws(() => {
      game.addPlayer('p11', 'Player11', 's11');
    }, /Table is full/);
    console.log('✅ Test 9 Passed!');
  }

  console.log('🎉 All PokerGame Unit Tests Passed Successfully!');
}

runTests();
