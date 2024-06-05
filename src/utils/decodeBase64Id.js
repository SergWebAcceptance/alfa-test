export const decodeBase64Id = (encodedId) => {
    const decodedString = Buffer.from(encodedId, 'base64').toString('utf8');
    const id = decodedString.split(':').pop();
    return id;
  };
  