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

console.log('Testing login...');

const loginReq = http.request(loginOptions, (loginRes) => {
  let data = '';

  loginRes.on('data', (chunk) => {
    data += chunk;
  });

  loginRes.on('end', () => {
    console.log(`Login Status: ${loginRes.statusCode}`);
    const loginResponse = JSON.parse(data);
    
    if (loginResponse.success && loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log('Login successful, testing dashboard endpoints...\n');
      
      // Probar endpoint de estadísticas
      const statsOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/dashboard/estadisticas',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const statsReq = http.request(statsOptions, (statsRes) => {
        let statsData = '';
        
        statsRes.on('data', (chunk) => {
          statsData += chunk;
        });
        
        statsRes.on('end', () => {
          console.log(`Estadísticas Status: ${statsRes.statusCode}`);
          console.log('Response:', statsData);
          console.log('\nTesting alertas endpoint...\n');
          
          // Probar endpoint de alertas
          const alertasOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/dashboard/alertas',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          const alertasReq = http.request(alertasOptions, (alertasRes) => {
            let alertasData = '';
            
            alertasRes.on('data', (chunk) => {
              alertasData += chunk;
            });
            
            alertasRes.on('end', () => {
              console.log(`Alertas Status: ${alertasRes.statusCode}`);
              console.log('Response:', alertasData);
              console.log('\n✅ All tests completed!');
            });
          });
          
          alertasReq.on('error', (error) => {
            console.error('Error testing alertas:', error);
          });
          
          alertasReq.end();
        });
      });
      
      statsReq.on('error', (error) => {
        console.error('Error testing estadísticas:', error);
      });
      
      statsReq.end();
    } else {
      console.error('Login failed:', loginResponse);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Error during login:', error);
});

loginReq.write(loginData);
loginReq.end();
