import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  serviceId: 'service_08g6kvd',
  templateId: 'template_6h1u2dc',
  publicKey: '29Pbi-cBmpuqmSbGL',
};

export const sendEmail = async (recipientEmail, projectName, imageUrls, jsonUrls, pageNames = []) => {
  try {
    const isMultiPage = imageUrls.length > 1;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build template parameters
    const pages = imageUrls.map((url, index) => ({
      name: pageNames[index] || `Page ${index + 1}`,
      image: url,
      json: jsonUrls[index] || null,
    }));

    const templateParams = {
      to_email: recipientEmail,
      project_name: projectName,
      from_name: 'Mohini DesignHub',
      today_date: today,
      message: `Your design "${projectName}" is ready.`,
      pages, // <-- dynamic array
      total_pages: pages.length,
      is_multi_page: pages.length > 1
    };


    // Only add the pages that actually exist
    imageUrls.forEach((url, index) => {
      if (url) { // Only add if URL exists
        templateParams[`image_url_${index + 1}`] = url;
      }
    });

    jsonUrls.forEach((url, index) => {
      if (url) { // Only add if URL exists
        templateParams[`json_url_${index + 1}`] = url;
      }
    });

    console.log('Sending email with pages:', imageUrls.length);
    console.log('Template params:', Object.keys(templateParams));

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Email sent successfully');
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email. Please try again.');
  }
};