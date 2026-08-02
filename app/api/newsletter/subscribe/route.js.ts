import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    // You can connect this to your database later
    console.log(`New newsletter subscriber: ${email}`);

    return NextResponse.json({ success: true, message: 'Successfully subscribed to the Ilm Hub newsletter!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error processing subscription' }, { status: 500 });
  }
}