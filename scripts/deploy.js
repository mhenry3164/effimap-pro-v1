const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const deploy = async () => {
  try {
    // Run tests and build
    console.log('Running tests and building...');
    execSync('npm run prepare-deploy', { stdio: 'inherit' });

    // Deploy to Firebase
    console.log('Deploying to Firebase...');
    execSync('firebase deploy', { stdio: 'inherit' });

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
};

deploy();
