module.exports = {
    mongoURI: process.env.CONNECTION_STRING || 'mongodb+srv://hussaiinkhan:743745426@yetisplus.kpnzg4r.mongodb.net/',
    jwtSecret: process.env.JWT_SECRET || 'YetişPlusSecret',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyACo_c4lTPnAR77zAomQnmBaMsCj-hiFxs'
  };
  