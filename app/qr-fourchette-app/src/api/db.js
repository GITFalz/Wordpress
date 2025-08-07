import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'cs11693-001.eu.clouddb.ovh.net',
  port: 35415,
  user: 'qrfour_app_USER',
  password: 'TyM5W28Got75',
  database: 'qrfour_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;