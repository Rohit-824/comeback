import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Since we are using direct UPI P2P transfers, we return success 
    // to allow the user to proceed with scanning/clicking the UPI link 
    // and submitting their UTR verification reference number.
    return NextResponse.json({ 
      success: true, 
      message: 'UPI payment intent initialized successfully.' 
    });
  } catch (error: any) {
    console.error('UPI intent initialization error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}