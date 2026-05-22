const { Client } = require('pg');
const c = new Client({
  user: 'postgres',
  host: 'localhost',
  password: 'MYSECRETPASSWORD',
  port: 5432,
  database: 'ProyectAula'
});
c.connect().then(() => {
  return c.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
}).then(r => {
  r.rows.forEach(row => console.log(row.table_name));
  c.end();
}).catch(e => {
  console.error(e.message);
  c.end();
});
