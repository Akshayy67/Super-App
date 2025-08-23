// This file can be deleted - SendGrid is no longer used
export default async function handler(req, res) {
  res.status(410).json({ 
    error: 'SendGrid service has been discontinued',
    message: 'This endpoint is no longer available'
  });
}