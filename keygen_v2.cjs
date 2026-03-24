const crypto = require('crypto');

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

    console.log("---PRIVATE_KEY---");
    console.log(privateKeyPem);
    console.log("---JWKS---");
    console.log(jwks);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
