const data = []

data.push({"ROW_NUM":0,"GENERAL_NAME_REPORT":"This is general data name report - Lorem","CODE":"","NAME":""})

for (let i = 0; i < 1000000; i++) {
	const temp = {}
	
	temp.ROW_NUM = 1;
	temp.GENERAL_NAME_REPORT = '';
	temp.CODE = `CODE_${i + 1}`;
	temp.NAME = `FULL_NAME_${i + 1}`;
	
	data.push(temp);
}

// call api
fetch('http://192.168.1.195:3000/export/test', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		"code": "template-simple",
		"data": [data]
	})
}).then(r => r.json())
	.then(r => {
		console.log(r);
	})
	.catch(e => {
		console.error(e);
	});