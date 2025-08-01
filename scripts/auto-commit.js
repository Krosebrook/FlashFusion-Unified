#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoCommit {
    constructor(options = {}) {
        this.options = {
            push: options.push || false,
            message: options.message || null,
            interval: options.interval || null,
            watch: options.watch || false,
            ...options
        };
    }

    // Generate intelligent commit message based on changes
    generateCommitMessage() {
        if (this.options.message) {
            return this.options.message;
        }

        try {
            // Get list of changed files
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            const lines = status.trim().split('\n').filter(line => line.length > 0);
            
            if (lines.length === 0) {
                return null; // No changes
            }

            const changes = {
                added: [],
                modified: [],
                deleted: [],
                renamed: []
            };

            lines.forEach(line => {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                
                if (status.includes('A')) changes.added.push(file);
                else if (status.includes('M')) changes.modified.push(file);
                else if (status.includes('D')) changes.deleted.push(file);
                else if (status.includes('R')) changes.renamed.push(file);
            });

            // Generate descriptive message
            const parts = [];
            if (changes.added.length > 0) parts.push(`Add ${changes.added.length} file(s)`);
            if (changes.modified.length > 0) parts.push(`Update ${changes.modified.length} file(s)`);
            if (changes.deleted.length > 0) parts.push(`Delete ${changes.deleted.length} file(s)`);
            if (changes.renamed.length > 0) parts.push(`Rename ${changes.renamed.length} file(s)`);

            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            return `Auto-commit: ${parts.join(', ')} - ${timestamp}`;

        } catch (error) {
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            return `Auto-commit: ${timestamp}`;
        }
    }

    // Check if there are changes to commit
    hasChanges() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            return status.trim().length > 0;
        } catch (error) {
            console.error('Error checking git status:', error.message);
            return false;
        }
    }

    // Perform the auto-commit
    commit() {
        try {
            if (!this.hasChanges()) {
                console.log('No changes to commit');
                return false;
            }

            // Stage all changes
            execSync('git add -A');
            console.log('Staged all changes');

            // Generate commit message
            const message = this.generateCommitMessage();
            if (!message) {
                console.log('No changes detected after staging');
                return false;
            }

            // Commit changes
            execSync(`git commit -m "${message}"`);
            console.log(`Committed: ${message}`);

            // Push if requested
            if (this.options.push) {
                execSync('git push');
                console.log('Pushed to remote repository');
            }

            return true;
        } catch (error) {
            console.error('Error during auto-commit:', error.message);
            return false;
        }
    }

    // Watch for file changes and auto-commit
    watch() {
        console.log('Starting file watcher for auto-commit...');
        console.log('Press Ctrl+C to stop');

        const chokidar = require('chokidar');
        let timeout;

        const watcher = chokidar.watch('.', {
            ignored: [
                /(^|[\/\\])\../,  // ignore dotfiles
                'node_modules/**',
                '.git/**',
                'dist/**',
                'build/**'
            ],
            persistent: true
        });

        watcher.on('change', (path) => {
            console.log(`File changed: ${path}`);
            
            // Debounce commits (wait 5 seconds after last change)
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.commit();
            }, 5000);
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\nStopping file watcher...');
            watcher.close();
            process.exit(0);
        });
    }

    // Start interval-based auto-commit
    startInterval() {
        if (!this.options.interval) {
            console.error('Interval not specified');
            return;
        }

        console.log(`Starting auto-commit every ${this.options.interval} seconds`);
        console.log('Press Ctrl+C to stop');

        const intervalId = setInterval(() => {
            this.commit();
        }, this.options.interval * 1000);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\nStopping auto-commit interval...');
            clearInterval(intervalId);
            process.exit(0);
        });
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--push':
                options.push = true;
                break;
            case '--message':
            case '-m':
                options.message = args[++i];
                break;
            case '--interval':
            case '-i':
                options.interval = parseInt(args[++i]);
                break;
            case '--watch':
            case '-w':
                options.watch = true;
                break;
            case '--help':
            case '-h':
                console.log(`
Auto-Commit Script Usage:

Basic usage:
  node scripts/auto-commit.js                    # Commit once
  npm run auto-commit                           # Using npm script

Options:
  --push                                        # Push after commit
  --message "Custom message" / -m "message"     # Custom commit message
  --interval 300 / -i 300                      # Auto-commit every 300 seconds
  --watch / -w                                 # Watch files and auto-commit on changes
  --help / -h                                  # Show this help

Examples:
  node scripts/auto-commit.js --push
  node scripts/auto-commit.js --message "Work in progress" --push
  node scripts/auto-commit.js --interval 600 --push
  node scripts/auto-commit.js --watch --push
                `);
                process.exit(0);
        }
    }

    const autoCommit = new AutoCommit(options);

    if (options.watch) {
        autoCommit.watch();
    } else if (options.interval) {
        autoCommit.startInterval();
    } else {
        autoCommit.commit();
    }
}

module.exports = AutoCommit;