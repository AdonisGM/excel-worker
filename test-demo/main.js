const call = () => {
  const arr = [];
  const data = {"ROW_NUM": 1, "GENERAL_NAME_REPORT": "", "CODE": "CODE_1", "NAME": "FULL_NAME_1"};

  for (let i = 0; i < 5000; i++) {
    arr.push(data);
  }

// call api
  fetch('http://localhost:4000/v1/excel/async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "referId": "000001",
      "code": "template-simple",
      "data": [
        [{
          "ROW_NUM": 0,
          "GENERAL_NAME_REPORT": "This is general data name report - Lorem",
          "CODE": "",
          "NAME": ""
        }, ...arr],
      ]
    })
  }).then(r => r.json())
                          .then(r => {
                            // console.log(r);
                          })
                          .catch(e => {
                            console.error(e);
                          });
}

for (let i = 0; i < 10; i++) {
  call();
}