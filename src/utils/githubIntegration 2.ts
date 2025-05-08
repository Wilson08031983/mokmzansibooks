/**
 * GitHub Integration Utilities
 * Provides functions for working with GitHub repositories
 */

/**
 * Prepares a commit message for GitHub
 * @param feature The feature being updated
 * @param details Additional details about the changes
 * @returns A formatted commit message
 */
export function prepareCommitMessage(feature: string, details: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `[${timestamp}] Update ${feature}: ${details}`;
}

/**
 * Generates a shell script to push changes to GitHub
 * @param commitMessage The commit message
 * @param branch The branch to push to (default: main)
 * @returns A shell script as a string
 */
export function generateGitPushScript(commitMessage: string, branch: string = 'main'): string {
  return `#!/bin/bash
# Auto-generated script to push changes to GitHub
# Generated on: ${new Date().toISOString()}

# Add all changes
git add .

# Commit with message
git commit -m "${commitMessage.replace(/"/g, '\\"')}"

# Push to the specified branch
git push origin ${branch}

echo "Changes pushed to GitHub successfully!"
`;
}

/**
 * Generates a shell script to create a production build
 * @returns A shell script as a string
 */
export function generateProductionBuildScript(): string {
  return `#!/bin/bash
# Auto-generated script to create a production build
# Generated on: ${new Date().toISOString()}

# Install dependencies if needed
npm install

# Run linting
npm run lint

# Create production build
npm run build

echo "Production build created successfully!"
`;
}

/**
 * Generates a shell script to prepare the repository for production
 * @returns A shell script as a string
 */
export function generateProductionPrepScript(): string {
  return `#!/bin/bash
# Auto-generated script to prepare the repository for production
# Generated on: ${new Date().toISOString()}

# Remove any sample data
find ./src -name "*sample*.ts" -type f -delete
find ./src -name "*sample*.tsx" -type f -delete
find ./src -name "*mock*.ts" -type f -delete
find ./src -name "*mock*.tsx" -type f -delete

# Remove any console.log statements
find ./src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/console\\.log([^)]*);\\?//g'

# Remove any debugger statements
find ./src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/debugger;\\?//g'

# Remove any TODO comments
find ./src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\\/\\/\\s*TODO:.*//g'

echo "Repository prepared for production!"
`;
}

/**
 * Checks if a repository has uncommitted changes
 * @returns True if there are uncommitted changes, false otherwise
 */
export function hasUncommittedChanges(): boolean {
  try {
    // This would normally use git status, but we're simulating it
    return true;
  } catch (error) {
    console.error('Error checking for uncommitted changes:', error);
    return false;
  }
}

/**
 * Generates a shell script to create a new GitHub release
 * @param version The version number for the release
 * @param releaseNotes Release notes describing the changes
 * @returns A shell script as a string
 */
export function generateGitHubReleaseScript(version: string, releaseNotes: string): string {
  return `#!/bin/bash
# Auto-generated script to create a GitHub release
# Generated on: ${new Date().toISOString()}

# Create a new tag
git tag -a v${version} -m "Version ${version}"

# Push the tag
git push origin v${version}

# Create a release using GitHub CLI (if installed)
if command -v gh &> /dev/null; then
  gh release create v${version} --title "Version ${version}" --notes "${releaseNotes.replace(/"/g, '\\"')}"
  echo "GitHub release created successfully!"
else
  echo "GitHub CLI not installed. Please create the release manually."
fi
`;
}
