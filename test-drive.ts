import { initPayGrid } from './src/index';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

async function testDrive() {
  console.log('🏁 Starting PayGrid Test Drive...\n');

  // Generate a real temporary keypair for the test drive
  const testKeypair = Keypair.generate();
  
  // Set mock environment variables
  process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
  process.env.TREASURY_PRIVATE_KEY = bs58.encode(testKeypair.secretKey);
  process.env.API_SECRET = 'super_secret_test_key_at_least_32_chars_long';
  process.env.NETWORK = 'devnet';
  process.env.DB_PATH = './paygrid.db';

  try {
    // 1. Initialize PayGrid
    const paygrid = await initPayGrid();
    console.log('✅ PayGrid Initialized');
    console.log(`   - Network: ${process.env.NETWORK}`);
    console.log(`   - Treasury: ${testKeypair.publicKey.toBase58()}\n`);

    // 2. Create an API Key
    const { key, apiKey } = await paygrid.createApiKey('Test Drive Key');
    console.log('🔑 New API Key Generated:');
    console.log(`   - Name: ${apiKey.name}`);
    console.log(`   - Key:  ${key}`);
    console.log(`   - Hint: ${apiKey.keyHint}...\n`);

    // 3. Create a Payment Intent (Manual Transfer)
    console.log('💳 Creating Manual Transfer Intent...');
    const manualIntent = await paygrid.createPaymentIntent({
      amount: 0.1,
      tokenMint: 'SOL',
      method: 'manual-transfer',
      metadata: { customer: 'Testing User' }
    });
    console.log('✅ Intent Created:');
    console.log(`   - ID: ${manualIntent.id}`);
    console.log(`   - Wallet: ${manualIntent.walletAddress}`);
    console.log(`   - Expires: ${new Date(manualIntent.expiresAt).toLocaleTimeString()}\n`);

    // 4. Create a Payment Intent (Wallet Signing)
    console.log('💳 Creating Wallet Signing Intent...');
    const signingIntent = await paygrid.createPaymentIntent({
      amount: 0.5,
      tokenMint: 'SOL',
      method: 'wallet-signing'
    });
    console.log('✅ Intent Created:');
    console.log(`   - ID: ${signingIntent.id}`);
    console.log(`   - Status: ${signingIntent.status}\n`);

    // 5. Verify Database retrieval
    const retrieved = await paygrid.getPayment(manualIntent.id);
    console.log('🔍 Database Verification:');
    console.log(`   - Retrieved ID: ${retrieved?.id}`);
    console.log(`   - Retrieved Status: ${retrieved?.status}`);
    
    // Stop watcher so script can exit
    paygrid.stopWatcher();
    console.log('\n✨ Test Drive Complete! You can see the database at ./paygrid.db');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDrive();
