// CommonJS shim so Vercel does not tree-shake the postgres driver out of the bundle.
module.exports = require('pg');
