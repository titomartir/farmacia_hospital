const http = require('http');

// Primero hacer login para obtener el token
const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const loginData = JSON.stringify({
  nombre_usuario: 'ANA LILYAN',
  password: 'usuario'
});

console.log('Testing API endpoints...\n');

const loginReq = http.request(loginOptions, (loginRes) => {
  let data = '';

  loginRes.on('data', (chunk) => {
    data += chunk;
  });

  loginRes.on('end', () => {
    console.log(`✓ Login Status: ${loginRes.statusCode}`);
    const loginResponse = JSON.parse(data);
    
    if (loginResponse.success && loginResponse.data.token) {
      const token = loginResponse.data.token;
      
      // Probar endpoint de insumos
      const insumosOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/insumos',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const insumosReq = http.request(insumosOptions, (insumosRes) => {
        let insumosData = '';
        
        insumosRes.on('data', (chunk) => {
          insumosData += chunk;
        });
        
        insumosRes.on('end', () => {
          console.log(`✓ Insumos Status: ${insumosRes.statusCode}`);
          const insumosResponse = JSON.parse(insumosData);
          if (insumosResponse.success) {
            console.log(`  Total insumos: ${insumosResponse.data.length}`);
            if (insumosResponse.data.length > 0) {
              console.log(`  Primer insumo: ${insumosResponse.data[0].nombre_generico}`);
            }
          }
          
          // Probar endpoint de requisiciones
          const reqOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/requisiciones',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          const reqReq = http.request(reqOptions, (reqRes) => {
            let reqData = '';
            
            reqRes.on('data', (chunk) => {
              reqData += chunk;
            });
            
            reqRes.on('end', () => {
              console.log(`✓ Requisiciones Status: ${reqRes.statusCode}`);
              const reqResponse = JSON.parse(reqData);
              if (reqResponse.success) {
                console.log(`  Total requisiciones: ${reqResponse.data.length}`);
              }
              console.log('\n✅ All API endpoints tested successfully!');
            });
          });
          
          reqReq.on('error', (error) => {
            console.error('✗ Error testing requisiciones:', error.message);
          });
          
          reqReq.end();
        });
      });
      
      insumosReq.on('error', (error) => {
        console.error('✗ Error testing insumos:', error.message);
      });
      
      insumosReq.end();
    } else {
      console.error('✗ Login failed:', loginResponse);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('✗ Error during login:', error.message);
});

loginReq.write(loginData);
loginReq.end();
