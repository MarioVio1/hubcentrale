import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdfData, title, chapterNum, kindleEmail } = body as {
      pdfData: string;
      title: string;
      chapterNum: number;
      kindleEmail: string;
    };

    // Validate inputs
    if (!pdfData || !kindleEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Kindle email format
    if (!kindleEmail.endsWith('@kindle.com') && !kindleEmail.endsWith('@free.kindle.com')) {
      return NextResponse.json(
        { error: 'Invalid Kindle email address. Must end with @kindle.com or @free.kindle.com' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const isDevelopment = true; // Always use dev mode for now (no verified domain)

    if (isDevelopment) {
      // In development, simulate sending for testing purposes
      console.log('[DEV MODE] Simulating Kindle email send:', {
        to: kindleEmail,
        title: `${title} - Capitolo ${chapterNum}`,
        pdfSize: pdfData.length,
        note: 'In production mode, you need a verified domain on Resend to send to Kindle addresses'
      });

      return NextResponse.json({
        success: true,
        message: 'Chapter simulated sent to Kindle (development mode)',
        devMode: true,
        note: 'To enable real Kindle emails, verify a domain on resend.com/domains'
      });
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Convert base64 to buffer
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Create email attachment
    const attachment = {
      filename: `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_Cap${chapterNum}.pdf`,
      content: pdfBuffer.toString('base64'),
      type: 'application/pdf'
    };

    // Send email to Kindle
    const result = await resend.emails.send({
      from: 'MangaFlow <onboarding@resend.dev>',
      to: kindleEmail,
      subject: `${title} - Capitolo ${chapterNum}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #8b5cf6;">${title} - Capitolo ${chapterNum}</h2>
          <p>Il tuo capitolo manga è allegato a questo email.</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Questo capitolo verrà automaticamente sincronizzato sul tuo dispositivo Kindle.
          </p>
        </div>
      `,
      attachments: [attachment]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Chapter sent to Kindle successfully',
      result 
    });

  } catch (error) {
    console.error('Error sending to Kindle:', error);
    return NextResponse.json(
      { error: 'Failed to send to Kindle', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
