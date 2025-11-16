import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  serviceId: 'service_08g6kvd',
  templateId: 'template_6h1u2dc', 
  publicKey: '29Pbi-cBmpuqmSbGL',
};

export const sendEmail = async (recipientEmail, fileName, imageUrl, projectName = 'Design') => {
  try {
    const templateParams = {
      to_email: recipientEmail,
      file_name: fileName,
      project_name: projectName,
      from_name: 'Design App',
      message: `Your design "${projectName}" is ready. See the image below.`,
      image_url: imageUrl, // Now using regular image URL, not data URL
    };

    console.log('Sending email with image URL:', imageUrl);

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email. Please try again.');
  }
};