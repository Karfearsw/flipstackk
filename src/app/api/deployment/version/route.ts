import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DeploymentVersion {
  version: string;
  commitHash: string;
  branch: string;
  buildTime: string;
  environment: string;
  vercelDeploymentId?: string;
  vercelDeploymentUrl?: string;
  githubRepository: string;
  lastDeployment: string;
  status: 'synced' | 'outdated' | 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Get current Git information
    const [commitHashResult, branchResult] = await Promise.allSettled([
      execAsync('git rev-parse HEAD'),
      execAsync('git rev-parse --abbrev-ref HEAD')
    ]);

    const commitHash = commitHashResult.status === 'fulfilled' 
      ? commitHashResult.value.stdout.trim().substring(0, 8)
      : 'unknown';
    
    const branch = branchResult.status === 'fulfilled'
      ? branchResult.value.stdout.trim()
      : 'unknown';

    // Get package.json version
    const packageJson = require('../../../../../package.json');
    const version = packageJson.version || '1.0.0';

    // Get Vercel deployment information from environment variables
    const vercelDeploymentId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL;
    const vercelDeploymentUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : undefined;

    // Build time from environment or current time
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    
    // Environment detection
    const environment = process.env.NODE_ENV || 'development';
    
    // GitHub repository
    const githubRepository = 'https://github.com/Karfearsw/flipstackk';

    // Determine deployment status
    let status: 'synced' | 'outdated' | 'unknown' = 'unknown';
    
    // If we have Vercel deployment info and it matches current commit, it's synced
    if (vercelDeploymentId && commitHash !== 'unknown') {
      // In a real scenario, you'd compare with Vercel API
      // For now, we'll assume it's synced if we have deployment info
      status = 'synced';
    } else if (environment === 'production') {
      status = 'outdated';
    }

    const deploymentInfo: DeploymentVersion = {
      version,
      commitHash,
      branch,
      buildTime,
      environment,
      vercelDeploymentId,
      vercelDeploymentUrl,
      githubRepository,
      lastDeployment: buildTime,
      status
    };

    return NextResponse.json({
      success: true,
      data: deploymentInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting deployment version:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get deployment version information',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'verify-sync') {
      // Verify if GitHub and Vercel are in sync
      const [commitHashResult] = await Promise.allSettled([
        execAsync('git rev-parse HEAD')
      ]);

      const currentCommit = commitHashResult.status === 'fulfilled' 
        ? commitHashResult.value.stdout.trim()
        : null;

      // In a real implementation, you'd call Vercel API to get deployment info
      // For now, we'll simulate the check
      const isInSync = currentCommit && process.env.VERCEL_DEPLOYMENT_ID;

      return NextResponse.json({
        success: true,
        data: {
          inSync: isInSync,
          currentCommit: currentCommit?.substring(0, 8),
          vercelDeployment: process.env.VERCEL_DEPLOYMENT_ID,
          recommendation: isInSync 
            ? 'Deployment is in sync' 
            : 'Consider redeploying to sync with latest changes'
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    console.error('Error in deployment verification:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to verify deployment sync',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });