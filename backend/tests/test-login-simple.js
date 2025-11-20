const http = require('http');

const data = JSON.stringify({
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
    'Content-Length': data.length
  },
  timeout: 5000
};

console.log('🔐 Probando login...');
console.log('📍 URL: http://localhost:3000/api/auth/login');
console.log('👤 Usuario: ANA LILYAN\n');

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📦 Response:\n`);
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n🎉 Login exitoso!');
        console.log(`🔑 Token: ${json.data.token.substring(0, 50)}...`);
        console.log(`👤 Usuario: ${json.data.usuario.nombre_usuario}`);
        console.log(`🎭 Rol: ${json.data.usuario.rol}`);
      } else {
        console.log('\n❌ Login fallido:', json.message);
      }
    } catch (error) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en request:');
  console.error('   Code:', error.code);
  console.error('   ¿Servidor corriendo en http://localhost:3000?');
});

req.on('timeout', () => {
  console.error('⏱️  Timeout - El servidor no responde');
  req.destroy();
});

req.write(data);
req.end();
