import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler for desktop app integration
 * Receives OAuth response from Google and redirects to custom protocol URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const testMode = searchParams.get('test'); // Add ?test=true to see JSON response

    // Log the incoming request for debugging
    console.log('OAuth Callback received:', {
      code: code ? `${code.substring(0, 10)}...` : null,
      state: state,
      fullUrl: request.url
    });

    // Validate that we have the required parameters
    if (!code) {
      console.error('OAuth callback missing code parameter');
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Build the custom protocol URL for the desktop app
    const customUrl = new URL('projectwr://oauth/callback');
    customUrl.searchParams.set('code', code);
    if (state) {
      customUrl.searchParams.set('state', state);
    }

    const redirectUrl = customUrl.toString();
    console.log('Redirecting to:', redirectUrl);

    // If in test mode, return JSON instead of redirecting
    if (testMode === 'true') {
      return NextResponse.json({
        success: true,
        message: 'OAuth callback processed successfully',
        redirectUrl: redirectUrl,
        parameters: {
          code: code,
          state: state
        }
      });
    }

    // Create a redirect response to the custom protocol URL
    // This will trigger the desktop app to handle the callback
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process OAuth callback' },
      { status: 500 }
    );
  }
}
