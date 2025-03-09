import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Load messages for the requested locale
  const messages = (await import(`./messages/${locale}.json`)).default;
  
  return {
    messages,
    // You can add other configuration options here if needed
    timeZone: 'Asia/Riyadh',
    now: new Date(),
  };
});
