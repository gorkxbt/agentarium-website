const { execSync } = require('child_process');

// Function to execute shell commands
function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Main function to push changes
function pushChanges() {
  console.log('Starting auto-push script...');
  
  // Add files
  console.log('Adding files to git...');
  runCommand('git add vercel.json public/');
  
  // Commit changes
  console.log('Committing changes...');
  runCommand('git commit -m "Fix 404 error with improved Vercel configuration and static fallback"');
  
  // Push to GitHub
  console.log('Pushing to GitHub...');
  runCommand('git push origin master');
  
  console.log('Auto-push completed!');
}

// Run the function
pushChanges(); 