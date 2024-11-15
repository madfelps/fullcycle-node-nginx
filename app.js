const http = require('http');
const mysql = require('mysql2');

const port = 3000;

const config = {
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'nodedb',
};

const connection = mysql.createConnection(config);

function connectToDatabase(callback) {
  connection.connect((error) => {
    if (error) {
      console.error('Erro ao conectar ao banco de dados:', error);
      return;
    }
    console.log('Conectado ao banco de dados com sucesso!');
    callback();
  });
}

function createTable() {
  const query = 'CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao criar a tabela:', error);
      connection.end();
      return;
    }
    console.log('Tabela "people" criada ou já existia.');
  });
}

function insertPerson(callback) {
  const query = 'INSERT INTO people (name) VALUES ("felipe")';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao inserir pessoa:', error);
      connection.end();
      return;
    }
    console.log('Pessoa inserida na tabela.');
    callback();
  });
}

function selectPeople(callback) {
  const query = 'SELECT * FROM people';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao consultar pessoas:', error);
      connection.end();
      return;
    }
    callback(results);
  });
}

function requestHandler(req, res) {
  if (req.url === '/') {
    insertPerson(() => {
      selectPeople((results) => {

        let peopleList = '<ul>';
        results.forEach((person) => {
          peopleList += `<li>${person.name}</li>`;
        });
        peopleList += '</ul>';

  
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>Full Cycle Rocks!</h1>
          <p>Lista de nomes cadastrados no banco de dados:</p>
          ${peopleList}
        `);
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada!');
  }
}


connectToDatabase(() => {
  createTable();

  const server = http.createServer(requestHandler);

  server.listen(port, () => {
    console.log(`Servidor HTTP rodando na porta ${port}`);
  });
});
