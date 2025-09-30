import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Zoom SDK configuration
const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY;
const ZOOM_SDK_SECRET = process.env.ZOOM_SDK_SECRET;

interface SignatureRequest {
  meetingNumber: string;
  role: number; // 0 for participant, 1 for host
}

interface SignatureResponse {
  signature: string;
  sdkKey: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignatureResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { meetingNumber, role = 0 }: SignatureRequest = req.body;

    if (!meetingNumber) {
      return res.status(400).json({ error: 'Meeting number is required' });
    }

    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      console.error('Zoom SDK credentials not configured');
      return res.status(500).json({ error: 'Zoom SDK not configured' });
    }

    // Generate JWT signature for Zoom Web SDK
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 hours

    const oHeader = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const oPayload = {
      iss: ZOOM_SDK_KEY,
      exp: exp,
      iat: iat,
      aud: 'zoom',
      appKey: ZOOM_SDK_KEY,
      tokenExp: exp,
      alg: 'HS256'
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);

    const signature = jwt.sign(oPayload, ZOOM_SDK_SECRET, { header: oHeader });

    res.status(200).json({
      signature,
      sdkKey: ZOOM_SDK_KEY
    });

  } catch (error) {
    console.error('Error generating Zoom signature:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}
