import { execSync } from 'child_process';
import fs from 'fs';

try {
  const privateKey = fs.readFileSync('private.pem', 'utf8');
  fs.writeFileSync('temp_val.txt', privateKey);
  execSync('npx convex env set JWT_PRIVATE_KEY < temp_val.txt', { stdio: 'inherit' });
  console.log("Successfully set JWT_PRIVATE_KEY");
  fs.unlinkSync('temp_val.txt');
} catch (err) {
  console.error("Error setting env var:", err);
  process.exit(1);
}
