const data = require('./data.json');

// call api
fetch('http://localhost:3000/export/test', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then(r => r.json())
    .then(r => {
        console.log(r);
    })
    .catch(e => {
        console.error(e);
    });