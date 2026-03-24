const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');

async function run() {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const privateKeyPem = privateKey.export({
      type: 'pkcs8',
      format: 'pem'
    });

    const publicKeyJwk = publicKey.export({
      format: 'jwk'
    });

    const jwks = JSON.stringify({ 
      keys: [ 
        { 
          ...publicKeyJwk, 
          kid: 'default', 
          alg: 'RS256', 
          use: 'sig' 
        } 
      ] 
    });

    console.log("Setting JWT_PRIVATE_KEY...");
    fs.writeFileSync('temp_priv.txt', privateKeyPem);
    execSync('npx convex env set JWT_PRIVATE_KEY < temp_priv.txt');
    fs.unlinkSync('temp_priv.txt');

    console.log("Setting JWKS...");
    fs.writeFileSync('temp_jwks.txt', jwks);
    execSync('npx convex env set JWKS < temp_jwks.txt');
    fs.unlinkSync('temp_jwks.txt');

    console.log("Setting SITE_URL...");
    execSync('npx convex env set SITE_URL http://localhost:5173');

    console.log("All environment variables set successfully.");
  } catch (err) {
    console.error("Error setting env vars:", err);
    process.exit(1);
  }
}

run();
