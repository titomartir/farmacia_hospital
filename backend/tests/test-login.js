const http = require('http');

async function testLogin() {
  const postData = JSON.stringify({
    nombre_usuario: 'ANA LILYAN',
    password: 'usuario'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📡 Status: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Login exitoso!\n');
            console.log('📝 Respuesta:', JSON.stringify(response, null, 2));
            if (response.data && response.data.token) {
              console.log('\n🔑 Token (primeros 50 chars):', response.data.token.substring(0, 50) + '...');
            }
          } else {
            console.log('❌ Login falló:', response.message || data);
          }
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing JSON:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error en request:', error.message);
      console.error('   Code:', error.code);
      console.error('   ¿Servidor corriendo en http://localhost:3000?');
      reject(error);
    });

    req.on('timeout', () => {
      console.error('⏱️ Timeout - El servidor no respondió en 5 segundos');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

console.log('🔐 Probando login...');
console.log('📍 URL: http://localhost:3000/api/auth/login');
console.log('👤 Usuario: ANA LILYAN\n');

testLogin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n💥 Test failed:', err.message);
    process.exit(1);
  });
